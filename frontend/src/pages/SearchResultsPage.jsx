import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import NotificationCard from '../components/NotificationCard';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = searchParams.get('q') || '';
  const department = searchParams.get('department') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [query, setQuery] = useState(q);
  const [deptFilter, setDeptFilter] = useState(department);

  // Load department list once
  useEffect(() => {
    axiosInstance.get('/api/search/departments')
      .then((res) => setDepartments(res.data.departments || []))
      .catch(() => {});
  }, []);

  // Run search whenever URL params change
  const runSearch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (q) params.q = q;
      if (department) params.department = department;
      const res = await axiosInstance.get('/api/search', { params });
      setResults(res.data.results || []);
    } catch (err) {
      setError('Search failed. Please check that the server is running.');
    } finally {
      setLoading(false);
    }
  }, [q, department]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  // Sync local form state with URL
  useEffect(() => {
    setQuery(q);
    setDeptFilter(department);
  }, [q, department]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (deptFilter) params.set('department', deptFilter);
    setSearchParams(params);
  };

  return (
    <div className="container py-4">
      {/* Search form (compact) */}
      <form onSubmit={handleSearch} id="results-search-form" className="mb-4">
        <div className="row g-2">
          <div className="col-12 col-md-6">
            <input
              id="results-search-input"
              type="text"
              className="form-control"
              placeholder="Search notifications…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-3">
            <select
              id="results-dept-filter"
              className="form-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-auto">
            <button id="results-search-btn" type="submit" className="btn btn-primary w-100">
              Search
            </button>
          </div>
          <div className="col-12 col-md-auto">
            <Link to="/" className="btn btn-outline-secondary w-100">← Home</Link>
          </div>
        </div>
      </form>

      {/* Results header */}
      {!loading && !error && (
        <div className="mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            {q || department ? (
              <span className="text-muted">
                {results.length === 0 ? 'No results' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
                {q && <> for <strong>"{q}"</strong></>}
                {department && <> in <span className="badge bg-secondary ms-1">{department}</span></>}
              </span>
            ) : (
              <span className="text-muted">Showing all notifications</span>
            )}
          </div>
          {(q || department) && (
            <button
              id="clear-filters-btn"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => { setQuery(''); setDeptFilter(''); setSearchParams({}); }}
            >
              ✕ Clear filters
            </button>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div id="search-loading" className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="mt-3 text-muted">Searching…</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div id="search-error" className="alert alert-danger">{error}</div>
      )}

      {/* Empty state */}
      {!loading && !error && results.length === 0 && (
        <div id="search-empty" className="text-center py-5">
          <div className="fs-1 mb-3">🔍</div>
          <h5 className="text-muted">No notifications found</h5>
          <p className="text-muted small">
            Try different keywords or remove the department filter.
          </p>
          <Link to="/" className="btn btn-primary mt-2">← Back to Home</Link>
        </div>
      )}

      {/* Results grid */}
      {!loading && !error && results.length > 0 && (
        <div id="search-results-grid" className="row g-3">
          {results.map((notification) => (
            <div className="col-12 col-md-6 col-lg-4" key={notification.id}>
              <NotificationCard notification={notification} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
