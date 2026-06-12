import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-4" style={{ background: '#f4f6f9' }}>
      <div className="card border-0 shadow-sm" style={{ width: '100%', maxWidth: '440px' }}>
        <div className="card-body p-4">

          {/* Header */}
          <div className="text-center mb-4">
            <div className="fs-1 mb-2">🏛️</div>
            <h1 className="h4 fw-bold">Create your account</h1>
            <p className="text-muted small">Get access to GovInfo Search</p>
          </div>

          {/* API-level error */}
          {apiError && (
            <div id="register-api-error" className="alert alert-danger py-2 small">{apiError}</div>
          )}

          <form onSubmit={handleSubmit} id="register-form" noValidate>

            {/* Name */}
            <div className="mb-3">
              <label htmlFor="register-name" className="form-label fw-semibold">Full Name</label>
              <input
                id="register-name"
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Your full name"
                value={form.name}
                onChange={update('name')}
                autoComplete="name"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="register-email" className="form-label fw-semibold">Email address</label>
              <input
                id="register-email"
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={update('email')}
                autoComplete="email"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            {/* Password */}
            <div className="mb-3">
              <label htmlFor="register-password" className="form-label fw-semibold">Password</label>
              <input
                id="register-password"
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={update('password')}
                autoComplete="new-password"
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label htmlFor="register-confirm" className="form-label fw-semibold">Confirm Password</label>
              <input
                id="register-confirm"
                type="password"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating account…</>
                : 'Create Account'}
            </button>
          </form>

          <hr className="my-3" />

          <p className="text-center text-muted small mb-0">
            Already have an account?{' '}
            <Link to="/login" id="go-to-login-link" className="text-primary fw-semibold">
              Sign in here
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
