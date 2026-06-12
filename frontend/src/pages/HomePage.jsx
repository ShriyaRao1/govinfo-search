import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/api/search/departments')
      .then((res) => setDepartments(res.data.departments || []))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (department) params.set('department', department);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero section */}
      <div className="bg-primary text-white py-5">
        <div className="container text-center">
          <h1 className="display-5 fw-bold mb-2">🏛️ GovInfo Search</h1>
          <p className="lead mb-4 opacity-75">
            Search government notifications — exam results, scholarships, policy updates &amp; more
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} id="homepage-search-form">
            <div className="row g-2 justify-content-center">
              <div className="col-12 col-md-6">
                <input
                  id="homepage-search-input"
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="e.g. CBSE result, scholarship, PM Kisan…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="col-12 col-md-3">
                <select
                  id="homepage-dept-filter"
                  className="form-select form-select-lg"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-auto">
                <button
                  id="homepage-search-btn"
                  type="submit"
                  className="btn btn-light btn-lg text-primary fw-bold w-100"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          <p className="mt-3 small opacity-50">
            Powered by MySQL FULLTEXT search
          </p>
        </div>
      </div>

      {/* Department quick-links */}
      <div className="container py-5">
        <h5 className="fw-semibold mb-3 text-muted">Browse by Department</h5>
        <div className="d-flex flex-wrap gap-2">
          {departments.map((d) => (
            <button
              key={d}
              id={`dept-btn-${d.replace(/\s+/g, '-').toLowerCase()}`}
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate(`/search?department=${encodeURIComponent(d)}`)}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Info cards */}
        <div className="row g-3 mt-4">
          {[
            { icon: '📋', title: 'Exam Notifications', desc: 'JEE, NEET, CUET, UPSC CSE and more', q: 'exam' },
            { icon: '🎓', title: 'Scholarships', desc: 'NSP, PM YASASVI, state schemes', q: 'scholarship' },
            { icon: '🌾', title: 'Agriculture Schemes', desc: 'PM Kisan, PMFBY, and farmer welfare', q: 'kisan' },
            { icon: '🏥', title: 'Health Programmes', desc: 'Ayushman Bharat, NHM, JSY updates', q: 'health' },
          ].map((card) => (
            <div className="col-6 col-md-3" key={card.q}>
              <div
                className="card border-0 shadow-sm h-100 text-center p-3"
                style={{ cursor: 'pointer' }}
                id={`category-card-${card.q}`}
                onClick={() => navigate(`/search?q=${card.q}`)}
              >
                <div className="fs-2 mb-2">{card.icon}</div>
                <h6 className="fw-semibold mb-1">{card.title}</h6>
                <p className="text-muted small mb-0">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
