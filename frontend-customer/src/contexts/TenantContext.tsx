import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Sedes disponibles - mapeo de tenant_id a nombre legible
export const AVAILABLE_TENANTS: Record<string, string> = {
  'TENANT#001': 'TGI Fridays - Miraflores',
  'TENANT#002': 'TGI Fridays - San Isidro',
  'TENANT#003': 'TGI Fridays - La Molina',
};

// Sede por defecto
const DEFAULT_TENANT = 'TENANT#001';
const TENANT_STORAGE_KEY = 'fridays_selected_tenant';

interface TenantContextType {
  tenantId: string;
  tenantName: string;
  setTenantId: (tenantId: string) => void;
  availableTenants: typeof AVAILABLE_TENANTS;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantIdState] = useState<string>(() => {
    // Cargar tenant guardado o usar el por defecto
    const saved = localStorage.getItem(TENANT_STORAGE_KEY);
    return saved && AVAILABLE_TENANTS[saved] ? saved : DEFAULT_TENANT;
  });

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(TENANT_STORAGE_KEY, tenantId);
  }, [tenantId]);

  const setTenantId = (newTenantId: string) => {
    if (AVAILABLE_TENANTS[newTenantId]) {
      setTenantIdState(newTenantId);
    }
  };

  const tenantName = AVAILABLE_TENANTS[tenantId] || 'TGI Fridays';

  const value: TenantContextType = {
    tenantId,
    tenantName,
    setTenantId,
    availableTenants: AVAILABLE_TENANTS,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
