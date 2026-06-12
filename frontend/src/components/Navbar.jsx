import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand fw-bold fs-5" to="/">
          🏛️ GovInfo Search
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Inline search bar */}
          <form className="d-flex mx-auto" style={{ maxWidth: '420px', width: '100%' }} onSubmit={handleSearch}>
            <input
              id="navbar-search-input"
              type="search"
              className="form-control form-control-sm me-2"
              placeholder="Quick search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button id="navbar-search-btn" type="submit" className="btn btn-light btn-sm text-primary fw-semibold px-3">
              Search
            </button>
          </form>

          {/* Nav links */}
          <ul className="navbar-nav ms-auto align-items-center gap-1">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            {user ? (
              <>
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">Admin</Link>
                  </li>
                )}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="userDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    👤 {user.name}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><span className="dropdown-item-text text-muted small">{user.email}</span></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button id="logout-btn" className="dropdown-item text-danger" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link id="nav-login-link" className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link id="nav-register-link" className="btn btn-light btn-sm text-primary fw-semibold px-3" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
