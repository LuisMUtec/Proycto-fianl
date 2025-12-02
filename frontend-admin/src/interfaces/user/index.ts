/** Tipos de usuario adaptados a un restaurante */
/** Tipos de usuario adaptados a un restaurante */
// Se normalizan campos para soportar tanto respuestas antiguas (es) como nuevas (en)

export interface UserProfile {
    // Canonical (camelCase / English)
    userId?: string;
    id?: string; // legacy id
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    address?: string;
    role: string; // flexible string (backend provides multiple role labels)
    tenantId?: string;
    tenant_id?: string; // legacy snake_case
    status?: 'ACTIVE' | 'INACTIVE' | string;
    active?: boolean;
    createdAt?: string; // ISO date
    created_at?: string; // legacy
    updatedAt?: string;
    updated_at?: string;

    // Spanish legacy fields (kept for compatibility with existing components)
    nombre?: string;
    apellido?: string;
    correo_electronico?: string;
    celular?: string;
    sede_id?: string;
    activo?: boolean;
}

export interface UserResponse {
    id: string;
    correo_electronico?: string;
    role: string;
    nombre?: string;
    apellido?: string;
}

// Tipos auxiliares (vacíos por ahora) — algunos módulos importan estas formas
export interface DataStudent {
    // campos específicos de estudiante si aplica
    [key: string]: any;
}

export interface DataAuthority {
    // campos específicos de autoridad/administrador si aplica
    [key: string]: any;
}


