import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { AuthContextType } from '../interfaces/context/AuthContext';
import type { UserProfile } from '../interfaces/user';
import { loadEnv } from '../utils/loaderEnv';

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_URL = loadEnv('AUTH_URL');

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
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_profile');
        }
      }
      setLoading(false);
    };

    checkSession();
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
    // Registro no disponible en la aplicación administrativa.
    // Dejamos una función stub para no romper consumos existentes desde componentes.
    setLoading(false);
    return { error: new Error('Registro no disponible') };
  };

  const signIn = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      setLoading(true);

      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || result?.data?.message || 'Credenciales inválidas');
      }

      // Extraer payload flexible: muchas respuestas actuales vienen en { data: { user, token } }
      const payload = result?.data ?? result;

      // token puede estar en payload.token o en result.token
      const token = payload?.token || result?.token;
      if (token) localStorage.setItem('auth_token', token);

      // usuario puede estar en payload.user o result.user
      const userFromServer = payload?.user || result?.user || {};

      // Normalizar tenant id: tenant_id (snake_case) -> tenantId
      const tenantId = (userFromServer.tenantId || userFromServer.tenant_id || null) as string | null;

      // Normalizar role: mapear varios labels del backend a roles canónicos usados por la UI
      const rawRole = (userFromServer.role || userFromServer.rol || '').toString();

      const normalizeRole = (r: string) => {
        const low = r.toLowerCase().trim();
        // Exact matches for known backend role strings
        if (low === 'admin sede' || /admin/i.test(r) || /administrador/i.test(low)) return 'ADMIN';
        if (low === 'cheff ejecutivo' || /chef|cheff|cocinero|cocin/i.test(low)) return 'COOK';
        if (low === 'empacador' || low === 'repartidor' || /reparti|dispatch|despatc|empaca|empaqueta|empacador/i.test(low)) return 'DISPATCHER';
        if (/cliente|user|usuario/i.test(low)) return 'USER';
        return r.toUpperCase();
      };

      const canonicalRole = normalizeRole(rawRole);

      // Rechazar acceso a usuarios tipo Cliente
      if (canonicalRole === 'USER') {
        throw new Error('No tienes permisos para acceder a esta aplicación. Esta es solo para personal administrativo.');
      }


      const userProfile: UserProfile = {
        // canonical
        userId: userFromServer.userId || userFromServer.id || '',
        id: userFromServer.id || userFromServer.userId || undefined,
        email: userFromServer.email || userFromServer.correo_electronico || '',
        firstName: userFromServer.firstName || userFromServer.first_name || userFromServer.nombre || '',
        lastName: userFromServer.lastName || userFromServer.last_name || userFromServer.apellido || '',
        phoneNumber: userFromServer.phoneNumber || userFromServer.phone || userFromServer.celular || '',
        address: userFromServer.address || userFromServer.direccion || undefined,
        role: canonicalRole || '',
        tenantId: tenantId || undefined,
        tenant_id: (userFromServer.tenant_id || undefined) as string | undefined,
        status: userFromServer.status || undefined,
        active: userFromServer.status ? (userFromServer.status === 'ACTIVE') : (userFromServer.active ?? true),
        createdAt: userFromServer.createdAt || userFromServer.created_at || new Date().toISOString(),
        updatedAt: userFromServer.updatedAt || userFromServer.updated_at || new Date().toISOString(),

        // legacy Spanish fields for compatibility
        nombre: userFromServer.firstName || userFromServer.first_name || userFromServer.nombre || undefined,
        apellido: userFromServer.lastName || userFromServer.last_name || userFromServer.apellido || undefined,
        correo_electronico: userFromServer.email || userFromServer.correo_electronico || undefined,
        celular: userFromServer.phoneNumber || userFromServer.phone || userFromServer.celular || undefined,
        sede_id: userFromServer.sede_id || undefined,
        activo: userFromServer.status ? (userFromServer.status === 'ACTIVE') : (userFromServer.active ?? true),
      } as UserProfile;

      localStorage.setItem('user_profile', JSON.stringify(userProfile));
      setUser(userProfile);
      setProfile(userProfile);

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
