import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

// ── Stat Card sub-component ────────────────────────────────────
function StatCard({ icon, label, value, colour }) {
  return (
    <div className="col-6 col-md-3">
      <div className={`card border-0 border-start border-4 border-${colour} shadow-sm h-100`}>
        <div className="card-body">
          <div className="text-muted small text-uppercase fw-semibold mb-1">{label}</div>
          <div className="d-flex align-items-center gap-2">
            <span className="fs-3">{icon}</span>
            <span className={`fs-2 fw-bold text-${colour}`}>{value ?? '…'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dept breakdown table ───────────────────────────────────────
function DeptTable({ rows }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>Department</th>
            <th className="text-end">Notifications</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.department}>
              <td>{r.department}</td>
              <td className="text-end">
                <span className="badge bg-primary">{r.count}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
const DEPARTMENTS = [
  'CBSE', 'NTA', 'Ministry of Education', 'Ministry of Agriculture',
  'Ministry of Finance', 'Ministry of Health', 'UPSC', 'UGC',
  'Ministry of Home Affairs', 'Other',
];

const INITIAL_FORM = {
  title: '', description: '', department: '', source_url: '', published_date: '',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/', { replace: true });
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);

  // ── Stats ───────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const res = await axiosInstance.get('/api/admin/stats');
      setStats(res.data.stats);
    } catch (err) {
      setStatsError(err.response?.data?.message || 'Could not load stats.');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Add Notification form ───────────────────────────────────
  const [form, setForm] = useState(INITIAL_FORM);
  const [pdfFile, setPdfFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateForm = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const { title, description, department, source_url, published_date } = form;
    if (!title.trim() || !description.trim() || !department || !source_url.trim() || !published_date) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', title.trim());
      data.append('description', description.trim());
      data.append('department', department);
      data.append('source_url', source_url.trim());
      data.append('published_date', published_date);
      if (pdfFile) data.append('pdf', pdfFile);

      const res = await axiosInstance.post('/api/admin/notifications', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const pdfNote = res.data.pdf_extracted ? ' PDF text extracted and indexed.' : '';
      setFormSuccess(`✅ Notification #${res.data.id} added successfully.${pdfNote}`);
      setForm(INITIAL_FORM);
      setPdfFile(null);
      // Reset file input
      const fileInput = document.getElementById('admin-pdf-input');
      if (fileInput) fileInput.value = '';
      // Refresh stats
      fetchStats();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add notification.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="container py-4">

      {/* Page header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="h3 fw-bold mb-0">⚙️ Admin Dashboard</h1>
          <p className="text-muted small mb-0">Logged in as {user.name}</p>
        </div>
        <button
          id="admin-refresh-btn"
          className="btn btn-outline-secondary btn-sm"
          onClick={fetchStats}
          disabled={statsLoading}
        >
          {statsLoading ? '⟳ Refreshing…' : '⟳ Refresh Stats'}
        </button>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────── */}
      {statsError && (
        <div id="stats-error" className="alert alert-warning">{statsError}</div>
      )}

      <div className="row g-3 mb-4">
        <StatCard
          icon="📋"
          label="Total Notifications"
          value={stats?.total_notifications}
          colour="primary"
        />
        <StatCard
          icon="👥"
          label="Total Users"
          value={stats?.total_users}
          colour="success"
        />
        <StatCard
          icon="🕐"
          label="Added This Week"
          value={stats?.this_week}
          colour="warning"
        />
        <StatCard
          icon="🏛️"
          label="Departments"
          value={stats?.by_department?.length}
          colour="info"
        />
      </div>

      {/* ── Department breakdown ─────────────────────────────── */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white fw-semibold border-0 pt-3">
          📊 Notifications by Department
        </div>
        <div className="card-body pt-2">
          {statsLoading
            ? <div className="text-muted small">Loading…</div>
            : <DeptTable rows={stats?.by_department} />
          }
        </div>
      </div>

      {/* ── Add Notification Form ────────────────────────────── */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white fw-semibold border-0 pt-3">
          ➕ Add New Notification
        </div>
        <div className="card-body">

          {formError && (
            <div id="admin-form-error" className="alert alert-danger py-2 small">{formError}</div>
          )}
          {formSuccess && (
            <div id="admin-form-success" className="alert alert-success py-2 small">{formSuccess}</div>
          )}

          <form id="admin-add-notification-form" onSubmit={handleSubmit}>
            <div className="row g-3">

              {/* Title */}
              <div className="col-12">
                <label htmlFor="admin-title" className="form-label fw-semibold">
                  Title <span className="text-danger">*</span>
                </label>
                <input
                  id="admin-title"
                  type="text"
                  className="form-control"
                  placeholder="Notification title"
                  value={form.title}
                  onChange={updateForm('title')}
                  required
                />
              </div>

              {/* Description */}
              <div className="col-12">
                <label htmlFor="admin-description" className="form-label fw-semibold">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  id="admin-description"
                  className="form-control"
                  rows={4}
                  placeholder="Full notification description"
                  value={form.description}
                  onChange={updateForm('description')}
                  required
                />
              </div>

              {/* Department */}
              <div className="col-12 col-md-4">
                <label htmlFor="admin-department" className="form-label fw-semibold">
                  Department <span className="text-danger">*</span>
                </label>
                <select
                  id="admin-department"
                  className="form-select"
                  value={form.department}
                  onChange={updateForm('department')}
                  required
                >
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Source URL */}
              <div className="col-12 col-md-5">
                <label htmlFor="admin-source-url" className="form-label fw-semibold">
                  Source URL <span className="text-danger">*</span>
                </label>
                <input
                  id="admin-source-url"
                  type="url"
                  className="form-control"
                  placeholder="https://..."
                  value={form.source_url}
                  onChange={updateForm('source_url')}
                  required
                />
              </div>

              {/* Published Date */}
              <div className="col-12 col-md-3">
                <label htmlFor="admin-date" className="form-label fw-semibold">
                  Published Date <span className="text-danger">*</span>
                </label>
                <input
                  id="admin-date"
                  type="date"
                  className="form-control"
                  value={form.published_date}
                  onChange={updateForm('published_date')}
                  required
                />
              </div>

              {/* PDF Upload */}
              <div className="col-12">
                <label htmlFor="admin-pdf-input" className="form-label fw-semibold">
                  PDF Upload <span className="text-muted small fw-normal">(optional — text will be extracted and indexed)</span>
                </label>
                <input
                  id="admin-pdf-input"
                  type="file"
                  className="form-control"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files[0] || null)}
                />
                {pdfFile && (
                  <div className="form-text text-success">
                    📄 {pdfFile.name} ({(pdfFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="col-12">
                <button
                  id="admin-submit-btn"
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={submitting}
                >
                  {submitting
                    ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Adding…</>
                    : '➕ Add Notification'}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
