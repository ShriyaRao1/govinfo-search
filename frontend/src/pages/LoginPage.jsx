import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/auth/login', { email: email.trim(), password });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f4f6f9' }}>
      <div className="card border-0 shadow-sm" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body p-4">

          {/* Header */}
          <div className="text-center mb-4">
            <div className="fs-1 mb-2">🏛️</div>
            <h1 className="h4 fw-bold">Sign in to GovInfo</h1>
            <p className="text-muted small">Search government notifications</p>
          </div>

          {/* Error alert */}
          {error && (
            <div id="login-error" className="alert alert-danger py-2 small">{error}</div>
          )}

          <form onSubmit={handleSubmit} id="login-form" noValidate>
            <div className="mb-3">
              <label htmlFor="login-email" className="form-label fw-semibold">Email address</label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="login-password" className="form-label fw-semibold">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Signing in…</>
                : 'Sign In'}
            </button>
          </form>

          <hr className="my-3" />

          <p className="text-center text-muted small mb-0">
            Don't have an account?{' '}
            <Link to="/register" id="go-to-register-link" className="text-primary fw-semibold">
              Register here
            </Link>
          </p>

          <p className="text-center mt-2">
            <Link to="/" className="text-muted small">← Back to search</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
