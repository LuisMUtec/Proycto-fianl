import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function RegisterForm() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir al login y mostrar información — registro no disponible
    // Dejamos la ruta disponible pero evitamos que el usuario se registre desde aquí.
  }, []);

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-xl font-semibold">Registro no disponible</h2>
      <p className="text-gray-600">El registro de usuarios no está habilitado desde esta interfaz administrativa.</p>
      <div className="mt-4">
        <button
          onClick={() => navigate('/auth/login')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    </div>
  );
}
