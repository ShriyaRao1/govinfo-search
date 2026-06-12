import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const DEPT_COLOURS = {
  CBSE: 'danger',
  NTA: 'warning',
  'Ministry of Education': 'primary',
  'Ministry of Agriculture': 'success',
  'Ministry of Finance': 'info',
  'Ministry of Health': 'secondary',
  UPSC: 'dark',
  UGC: 'primary',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function NotificationDetailPage() {
  const { id } = useParams();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    axiosInstance.get(`/api/notifications/${id}`)
      .then((res) => setNotification(res.data.notification))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('Notification not found.');
        } else {
          setError('Failed to load notification. Please try again.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center" id="detail-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
        <p className="mt-3 text-muted">Loading notification…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5" id="detail-error">
        <div className="alert alert-danger">{error}</div>
        <Link to="/" className="btn btn-primary">← Back to Home</Link>
      </div>
    );
  }

  if (!notification) return null;

  const colour = DEPT_COLOURS[notification.department] || 'secondary';

  return (
    <div className="container py-4" style={{ maxWidth: '860px' }}>

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item">
            <Link to={`/search?department=${encodeURIComponent(notification.department)}`}>
              {notification.department}
            </Link>
          </li>
          <li className="breadcrumb-item active text-truncate" style={{ maxWidth: '300px' }}>
            {notification.title}
          </li>
        </ol>
      </nav>

      {/* Main card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">

          {/* Department + Date row */}
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <span
              id="detail-dept-badge"
              className={`badge bg-${colour} text-${colour === 'warning' ? 'dark' : 'white'} fs-6 px-3 py-2`}
            >
              {notification.department}
            </span>
            <div className="text-end">
              <div className="small text-muted">Published</div>
              <div className="fw-semibold">{formatDate(notification.published_date)}</div>
            </div>
          </div>

          {/* Title */}
          <h1 id="detail-title" className="h4 fw-bold mb-3">{notification.title}</h1>

          <hr />

          {/* Description */}
          <h6 className="text-muted text-uppercase small fw-semibold mb-2 mt-3">Description</h6>
          <div id="detail-description" className="text-secondary lh-lg" style={{ whiteSpace: 'pre-wrap' }}>
            {notification.description}
          </div>

          {/* PDF Text section */}
          {notification.pdf_text && (
            <>
              <hr />
              <h6 className="text-muted text-uppercase small fw-semibold mb-2 mt-3">
                📄 Extracted PDF Content
              </h6>
              <div
                id="detail-pdf-text"
                className="bg-light rounded p-3 text-secondary small"
                style={{ maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
              >
                {notification.pdf_text}
              </div>
            </>
          )}

          <hr />

          {/* Metadata */}
          <div className="row g-2 mt-1">
            <div className="col-12 col-md-6">
              <div className="small text-muted">Notification ID</div>
              <div className="fw-semibold">#{notification.id}</div>
            </div>
            <div className="col-12 col-md-6">
              <div className="small text-muted">Added to GovInfo</div>
              <div className="fw-semibold">
                {notification.created_at
                  ? new Date(notification.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })
                  : '—'}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="d-flex gap-2 mt-4 flex-wrap">
            <a
              id="detail-source-link"
              href={notification.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              🔗 Visit Official Source
            </a>
            <Link
              id="detail-back-btn"
              to={-1}
              className="btn btn-outline-secondary"
            >
              ← Go Back
            </Link>
            <Link
              to={`/search?department=${encodeURIComponent(notification.department)}`}
              className="btn btn-outline-secondary"
              id="detail-dept-link"
            >
              More from {notification.department}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
