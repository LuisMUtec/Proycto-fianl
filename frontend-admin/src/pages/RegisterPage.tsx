import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Register page removed — redirect to login
export function RegisterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/auth/login', { replace: true });
  }, [navigate]);

  return null;
}
