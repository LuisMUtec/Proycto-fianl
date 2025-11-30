import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { AuthContextType } from '../interfaces/context/AuthContext';
import type { UserProfile } from '../interfaces/user';
import type { Role } from '../interfaces/api/common';
import * as authService from '../services/auth';
import webSocketService from '../services/websocket';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user_profile');

      if (token && savedUser) {
        try {
          const userProfile = JSON.parse(savedUser);
          setUser(userProfile);
          setProfile(userProfile);

          // WebSocket se conectará cuando el usuario procese un pedido
          console.log('📱 Sesión restaurada. WebSocket se conectará al procesar pedido.');
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_profile');
        }
      }
      setLoading(false);
    };

    checkSession();

    // Cleanup: desconectar WebSocket al desmontar
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const signUp = async (data: {
    firstName: string;
    lastName?: string;
    phoneNumber?: string;
    email: string;
    password: string;
    role?: string;
    address?: string;
  }) => {
    try {
      setLoading(true);

      const result = await authService.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber,
        address: data.address,
      });

      // Guardar token
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
      }

      // Crear perfil de usuario desde la respuesta del backend
      const userProfile: UserProfile = {
        id: result.user.userId,
        nombre: result.user.firstName,
        apellido: result.user.lastName,
        correo_electronico: result.user.email,
        celular: result.user.phoneNumber || '',
        role: result.user.role as Role,
        activo: result.user.status === 'ACTIVE',
        created_at: result.user.createdAt,
      };

      localStorage.setItem('user_profile', JSON.stringify(userProfile));
      setUser(userProfile);
      setProfile(userProfile);

      // WebSocket se conectará cuando el usuario procese un pedido
      console.log('📱 Registro exitoso. WebSocket se conectará al procesar pedido.');

      return { error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      setLoading(true);

      const result = await authService.login(credentials);

      // Validar que solo clientes puedan acceder (el backend devuelve 'Cliente')
      const userRole = result.user?.role || 'Cliente';
      if (userRole !== 'Cliente') {
        throw new Error('Esta aplicación es solo para clientes. Por favor, usa la aplicación administrativa.');
      }

      // Guardar token
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
      }

      // Crear perfil de usuario desde la respuesta del backend
      const userData = result.user;
      const userProfile: UserProfile = {
        id: userData.userId,
        nombre: userData.firstName || userData.email.split('@')[0],
        apellido: userData.lastName || '',
        correo_electronico: userData.email,
        celular: userData.phoneNumber || '',
        role: userRole as Role,
        activo: userData.status === 'ACTIVE',
        created_at: userData.createdAt || new Date().toISOString(),
      };

      localStorage.setItem('user_profile', JSON.stringify(userProfile));
      setUser(userProfile);
      setProfile(userProfile);

      // WebSocket se conectará cuando el usuario procese un pedido
      console.log('📱 Login exitoso. WebSocket se conectará al procesar pedido.');

      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      // Intentar cerrar sesión en el servidor
      try {
        await authService.logout();
      } catch (error) {
        console.error('Error logging out from server:', error);
      }

      // Desconectar WebSocket
      webSocketService.disconnect();

      // Limpiar localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_profile');

      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    session: null,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
