import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Alert from '../ui/Alert';

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn({ email: formData.email, password: formData.password });

      if (result?.error) throw result.error;

      // Redirigir al dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error en autenticación';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
          <Mail size={16} />
          <span>Email</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
          placeholder="tu@email.com"
          required
        />
      </div>

      <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
          <Lock size={16} />
          <span>Contraseña</span>
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
          placeholder="••••••••"
          required
          minLength={6}
        />
      </div>

      {error && (
        <div>
          <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {success && (
        <div>
          <Alert type="success" title="Éxito" message={success} onClose={() => setSuccess(null)} />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
      >
        {loading ? 'Procesando...' : 'Iniciar Sesión'}
      </button>

      {/* Registro deshabilitado en frontend-admin */}
    </form>
  );
}
