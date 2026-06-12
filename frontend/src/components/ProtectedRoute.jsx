import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route and redirects to /login if not authenticated.
 * If adminOnly=true, also redirects non-admin users to /.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
