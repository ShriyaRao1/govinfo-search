import { Link } from 'react-router-dom';

// Department → Bootstrap badge colour mapping
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

function getDeptColour(dept) {
  return DEPT_COLOURS[dept] || 'secondary';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NotificationCard({ notification }) {
  const { id, title, department, published_date, source_url, excerpt } = notification;
  const colour = getDeptColour(department);

  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body d-flex flex-column">
        {/* Department badge + date */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className={`badge bg-${colour} text-${colour === 'warning' ? 'dark' : 'white'}`}>
            {department}
          </span>
          <small className="text-muted">{formatDate(published_date)}</small>
        </div>

        {/* Title */}
        <h6 className="card-title fw-semibold mb-2">
          <Link
            to={`/notifications/${id}`}
            className="text-decoration-none text-dark stretched-link"
            id={`notification-card-${id}`}
          >
            {title}
          </Link>
        </h6>

        {/* Excerpt */}
        {excerpt && (
          <p className="card-text text-muted small mb-3" style={{ flexGrow: 1 }}>
            {excerpt.length > 180 ? excerpt.slice(0, 180) + '…' : excerpt}
          </p>
        )}

        {/* Source URL */}
        <div className="mt-auto">
          <a
            href={source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary btn-sm"
            onClick={(e) => e.stopPropagation()}
            id={`source-link-${id}`}
          >
            🔗 Official Source
          </a>
        </div>
      </div>
    </div>
  );
}
