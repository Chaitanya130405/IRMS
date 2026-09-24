import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════
const statusClass = (s) => `status-badge status-${s?.toLowerCase().replaceAll(" ", "-")}`;

const csvValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const downloadCsv = (filename, headers, rows) => {
  const csv = [headers, ...rows].map((row) => row.map(csvValue).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const PAGE_SIZE = 6;

// ═══════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════
const Icons = {
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  FileText: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Calendar: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Clock: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Briefcase: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  ),
  UserCheck: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  ),
  TrendingUp: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  Download: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Edit: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  ExternalLink: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Bell: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  MapPin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Mail: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Phone: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  Lock: () => (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  AlertCircle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  User: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Upload: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
};

// ═══════════════════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function PageHeader({ title, description, children }) {
  return (
    <div className="page-header">
      <div className="page-header-text">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function Pagination({ page, pages, total, onChange }) {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const numbers = [];
    const maxVisible = 5;
    
    if (pages <= maxVisible) {
      for (let i = 1; i <= pages; i++) numbers.push(i);
    } else {
      numbers.push(1);
      let start = Math.max(2, page - 1);
      let end = Math.min(pages - 1, page + 1);
      
      if (page <= 2) end = 4;
      else if (page >= pages - 1) start = pages - 3;
      
      if (start > 2) numbers.push('...');
      for (let i = start; i <= end; i++) numbers.push(i);
      if (end < pages - 1) numbers.push('...');
      numbers.push(pages);
    }
    return numbers;
  };

  return (
    <div className="pagination">
      <button className="pagination-btn" onClick={() => onChange(page - 1)} disabled={page === 1}>
        <Icons.ChevronLeft /> <span>Prev</span>
      </button>
      <div className="pagination-numbers">
        {getPageNumbers().map((num, idx) => (
          num === '...' ? (
            <span key={`dots-${idx}`} className="pagination-dots">...</span>
          ) : (
            <button key={num} className={`pagination-num ${num === page ? 'active' : ''}`} onClick={() => onChange(num)}>
              {num}
            </button>
          )
        ))}
      </div>
      <button className="pagination-btn" onClick={() => onChange(page + 1)} disabled={page === pages}>
        <span>Next</span> <Icons.ChevronRight />
      </button>
    </div>
  );
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

function LoadingState({ message = "Loading..." }) {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}

function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-state-icon"><Icons.AlertCircle /></div>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && <button className="btn btn-primary" onClick={onRetry}>Try again</button>}
    </div>
  );
}

function ConfirmModal({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, danger = false }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon">
          {danger ? <Icons.AlertCircle /> : <Icons.AlertCircle />}
        </div>
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
          <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange, onSearch, placeholder = "Search..." }) {
  return (
    <div className="search-bar">
      <Icons.Search />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
      />
    </div>
  );
}

function DataTable({ columns, data, loading, emptyIcon, emptyTitle, emptyDescription }) {
  if (loading) return <LoadingState message="Loading data..." />;
  if (!data.length) return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>{columns.map((col) => <th key={col.key}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row._id || i}>
              {columns.map((col) => <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

export function Dashboard({ admin = false }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api.get("/dashboard")
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.message || "Could not load dashboard"));
  };

  useEffect(() => { load(); }, []);

  if (error) return <div className="page-container"><ErrorState title="Unable to load dashboard" message={error} onRetry={load} /></div>;
  if (!data) return <div className="page-container"><LoadingState message="Loading dashboard..." /></div>;

  const stats = admin
    ? [
        { label: "Total Candidates", value: data.totalCandidates, icon: <Icons.Users />, color: "blue" },
        { label: "Applications", value: data.totalApplications, icon: <Icons.FileText />, color: "purple" },
        { label: "Today's Applications", value: data.today, icon: <Icons.Calendar />, color: "green" },
        { label: "Pending Review", value: data.pending, icon: <Icons.Clock />, color: "orange" },
        { label: "Active Jobs", value: data.activeJobs, icon: <Icons.Briefcase />, color: "pink" },
        { label: "Interviews", value: data.interviews, icon: <Icons.UserCheck />, color: "cyan" },
      ]
    : [
        { label: "Total Applications", value: data.totalApplications, icon: <Icons.FileText />, color: "blue" },
        { label: "Pending", value: data.pending, icon: <Icons.Clock />, color: "orange" },
        { label: "Rejected", value: data.rejected, icon: <Icons.TrendingUp />, color: "red" },
        { label: "Interviews", value: data.interviews, icon: <Icons.UserCheck />, color: "green" },
      ];

  return (
    <div className="page-container">
      <div className="dashboard-welcome">
        <h1>Welcome back, {user.name.split(" ")[0]}</h1>
        <p>{admin ? "Here's your recruitment overview" : "Track your job applications"}</p>
        <span className="dashboard-date">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </span>
      </div>

      <div className={`stats-grid ${!admin ? 'stats-4' : ''}`}>
        {stats.map((s) => (
          <div key={s.label} className={`stat-card stat-${s.color}`}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-content">
              <span className="stat-card-value">{s.value}</span>
              <span className="stat-card-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <div className="card-header">
          <h2>Recent Activity</h2>
          <Link to={admin ? "/admin/applications" : "/applications"} className="card-link">
            View all <Icons.ArrowRight />
          </Link>
        </div>
        <div className="card-table-wrapper">
          {data.recent?.length ? (
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Job</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.slice(0, 5).map((a) => (
                  <tr key={a._id}>
                    <td><code className="code-badge">{a.applicationId}</code></td>
                    <td>{a.job?.title || "—"}</td>
                    <td><span className={statusClass(a.status)}>{a.status}</span></td>
                    <td className="text-muted">{new Date(a.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-message">No recent activity</div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════════════════

export function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const r = await api.patch("/profile", form);
      setUser(r.data.user);
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <PageHeader title="Profile Settings" description="Manage your account information" />

      <Card>
        <div className="profile-hero">
          <div className="profile-avatar-lg">{user.name[0]}</div>
          <div className="profile-hero-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <span className="role-tag">{user.role}</span>
          </div>
        </div>

        <form className="profile-form-new" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter your full name" />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" value={user.email} disabled />
            <span className="form-hint">Email cannot be changed</span>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Enter your phone number" />
          </div>

          {message.text && <div className={`form-message ${message.type}`}>{message.text}</div>}

          <button className="btn btn-primary" type="submit" disabled={saving} style={{ marginTop: '8px' }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadNotifications = () => {
    setLoading(true);
    api.get("/notifications")
      .then((r) => setNotifications(r.data.notifications))
      .catch((e) => setError(e.response?.data?.message || "Could not load notifications"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Mark single notification as read when clicked
  const handleNotificationClick = async (notificationId, isRead) => {
    if (isRead) return; // Already read, no need to call API
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      setError(e.response?.data?.message || "Failed to mark all as read");
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    try {
      await api.delete("/notifications/clear-all");
      setNotifications([]);
      setShowClearConfirm(false);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to clear notifications");
      setShowClearConfirm(false);
    }
  };

  const pages = Math.ceil(notifications.length / PAGE_SIZE);
  const shown = notifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="page-container">
      <PageHeader title="Notifications" description="Stay updated with your application status">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {unread > 0 && <span className="unread-badge">{unread} unread</span>}
          {unread > 0 && (
            <button className="btn btn-sm btn-secondary" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="btn btn-sm btn-outline" onClick={() => setShowClearConfirm(true)}>
              Clear all
            </button>
          )}
        </div>
      </PageHeader>

      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear All Notifications"
        message="Are you sure you want to delete all notifications? This action cannot be undone."
        confirmText="Delete All"
        cancelText="Cancel"
        danger={true}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />

      <Card>
        {loading ? (
          <LoadingState message="Loading notifications..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Icons.Bell />}
            title="No notifications"
            description="You're all caught up! New notifications will appear here."
          />
        ) : (
          <>
            <div className="notification-list">
              {shown.map((n) => (
                <div 
                  key={n._id} 
                  className={`notification-item ${n.read ? "" : "unread"}`}
                  onClick={() => handleNotificationClick(n._id, n.read)}
                  style={{ cursor: n.read ? "default" : "pointer" }}
                >
                  <div className="notification-icon"><Icons.Bell /></div>
                  <div className="notification-content">
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} pages={pages} total={notifications.length} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CANDIDATES (Admin)
// ═══════════════════════════════════════════════════════════════════════════

export function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/candidates", { params: { search, page: p, limit: PAGE_SIZE } });
      setCandidates(data.candidates);
      setMeta({ total: data.total, pages: data.pages });
    } catch (e) {
      setError(e.response?.data?.message || "Could not load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); load(1); };

  return (
    <div className="page-container">
      <PageHeader title="Candidates" description="Review registered candidates and their details">
        <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} placeholder="Search candidates..." />
        <button className="btn btn-secondary" onClick={handleSearch}>Search</button>
      </PageHeader>

      <Card>
        {error && <div className="error-banner">{error}</div>}
        <DataTable
          loading={loading}
          emptyIcon={<Icons.Users />}
          emptyTitle="No candidates found"
          emptyDescription={search ? "Try adjusting your search" : "Candidates will appear when they register"}
          columns={[
            {
              key: "name",
              label: "Candidate",
              render: (c) => (
                <div className="user-cell">
                  <div className="user-avatar-sm">{c.name[0]}</div>
                  <div>
                    <strong>{c.name}</strong>
                    <small>{c.email}</small>
                  </div>
                </div>
              ),
            },
            { key: "phone", label: "Phone", render: (c) => c.phone || "—" },
            {
              key: "status",
              label: "Status",
              render: (c) => <span className={`status-badge status-${c.status}`}>{c.status}</span>,
            },
            { key: "createdAt", label: "Joined", render: (c) => new Date(c.createdAt).toLocaleDateString() },
            { key: "lastLogin", label: "Last Sign-in", render: (c) => c.lastLogin ? new Date(c.lastLogin).toLocaleDateString() : "Never" },
          ]}
          data={candidates}
        />
        <Pagination page={page} pages={meta.pages} total={meta.total} onChange={setPage} />
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT (Super Admin)
// ═══════════════════════════════════════════════════════════════════════════

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState("");
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError("");
    api.get("/users")
      .then((r) => setUsers(r.data.users))
      .catch((e) => setError(e.response?.data?.message || "Could not load HR admins"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (u) => {
    setUpdating(u._id);
    try {
      const status = u.status === "active" ? "inactive" : "active";
      const r = await api.patch(`/users/${u._id}/status`, { status });
      setUsers(users.map((x) => (x._id === u._id ? { ...x, ...r.data.user } : x)));
    } catch (e) {
      setError(e.response?.data?.message || "Could not update status");
    } finally {
      setUpdating("");
    }
  };

  const pages = Math.ceil(users.length / PAGE_SIZE);
  const shown = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page-container">
      <PageHeader title="HR Admin Management" description="Review and manage HR administrator accounts">
        <Link to="/superadmin/create-admin" className="btn btn-primary">
          <Icons.Plus /> Create HR Admin
        </Link>
      </PageHeader>

      <Card>
        {error && <div className="error-banner">{error}</div>}
        <DataTable
          loading={loading}
          emptyIcon={<Icons.Users />}
          emptyTitle="No HR admins found"
          emptyDescription="Create your first HR admin to get started"
          columns={[
            {
              key: "name",
              label: "Admin",
              render: (u) => (
                <div className="user-cell">
                  <div className="user-avatar-sm">{u.name[0]}</div>
                  <div>
                    <strong>{u.name}</strong>
                    <small>{u.email}</small>
                  </div>
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (u) => <span className={`status-badge status-${u.status}`}>{u.status}</span>,
            },
            { key: "lastLogin", label: "Last Sign-in", render: (u) => u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never" },
            { key: "jobsCreated", label: "Jobs", render: (u) => <span className="number-badge">{u.jobsCreated || 0}</span> },
            { key: "actionsTaken", label: "Actions", render: (u) => <span className="number-badge">{u.actionsTaken || 0}</span> },
            {
              key: "actions",
              label: "",
              render: (u) => (
                <button
                  className={`btn btn-sm ${u.status === "active" ? "btn-outline" : "btn-primary"}`}
                  disabled={updating === u._id}
                  onClick={() => toggleStatus(u)}
                >
                  {updating === u._id ? "..." : u.status === "active" ? "Deactivate" : "Activate"}
                </button>
              ),
            },
          ]}
          data={shown}
        />
        <Pagination page={page} pages={pages} total={users.length} onChange={setPage} />
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CREATE ADMIN (Super Admin)
// ═══════════════════════════════════════════════════════════════════════════

export function CreateAdmin() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      await api.post("/users/admins", form);
      setForm({ name: "", email: "", phone: "", password: "" });
      setMessage({ type: "success", text: "HR admin created successfully. Activate the account from HR Admins before sign-in." });
    } catch (e) {
      setMessage({ type: "error", text: e.response?.data?.message || "Could not create HR admin" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: "600px" }}>
      <PageHeader title="Create HR Admin" description="New HR admin accounts require Super Admin approval before they can sign in." />

      <Card>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email address" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number <span className="optional">(Optional)</span></label>
              <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Enter phone number" />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" required type="password" minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" />
            </div>
          </div>

          {message.text && <div className={`form-message ${message.type}`}>{message.text}</div>}

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create HR Admin"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// JOBS
// ═══════════════════════════════════════════════════════════════════════════

export function Jobs({ admin = false, onlyActive = false }) {
  const location = useLocation();
  const requestedStatus = new URLSearchParams(location.search).get("status");
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/jobs", { params: { search } });
      setJobs(data.jobs);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      form._id ? await api.patch(`/jobs/${form._id}`, form) : await api.post("/jobs", form);
      setForm(null);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not save job");
    }
  };

  const handleDelete = async (job) => {
    if (!confirm("Delete this job?")) return;
    try {
      await api.delete(`/jobs/${job._id}`);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not delete job");
    }
  };

  // Job Form View
  if (form) {
    return (
      <div className="page-container">
        <PageHeader title={form._id ? "Edit Job" : "Create New Job"} description="Fill in the job details below" />
        <Card>
          <form className="form-grid" onSubmit={handleSubmit}>
            {/* Row 1: Basic Info */}
            <div className="form-group">
              <label className="form-label">Job ID</label>
              <input className="form-input" required value={form.jobId || ""} placeholder="e.g. ENG-101" onChange={(e) => setForm({ ...form, jobId: e.target.value })} />
            </div>
            <div className="form-group span-2">
              <label className="form-label">Title</label>
              <input className="form-input" required value={form.title || ""} placeholder="e.g. Senior Software Engineer" onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" required value={form.department || ""} placeholder="e.g. Engineering" onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>

            {/* Row 2: Client & Location */}
            <div className="form-group">
              <label className="form-label">Client Name</label>
              <input className="form-input" required value={form.clientName || ""} placeholder="Client company" onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input className="form-input" required value={form.projectName || ""} placeholder="Project name" onChange={(e) => setForm({ ...form, projectName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" required value={form.location || ""} placeholder="e.g. Bengaluru" onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Experience</label>
              <input className="form-input" required value={form.experienceLevel || ""} placeholder="e.g. 3-5 years" onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} />
            </div>

            {/* Row 3: Dropdowns */}
            <div className="form-group">
              <label className="form-label">Openings</label>
              <input className="form-input" type="number" min="1" value={form.openings || 1} onChange={(e) => setForm({ ...form, openings: +e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority || "Medium"} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Work Mode</label>
              <select className="form-select" value={form.workMode || "Onsite"} onChange={(e) => setForm({ ...form, workMode: e.target.value })}>
                <option>Onsite</option>
                <option>WFO</option>
                <option>WFH</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Employment</label>
              <select className="form-select" value={form.employmentType || "Full-time"} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>

            {/* Row 4: Description & Status */}
            <div className="form-group span-3">
              <label className="form-label">Description</label>
              <input className="form-input" required value={form.description || ""} placeholder="Brief role description..." onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status || "active"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {error && <div className="form-message error full-width">{error}</div>}

            <div className="form-actions full-width">
              <button className="btn btn-primary" type="submit">{form._id ? "Update Job" : "Create Job"}</button>
              <button className="btn btn-outline" type="button" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Jobs List View
  const visibleJobs = jobs.filter(
    (j) => (admin || j.status === "active") && (!requestedStatus || j.status === requestedStatus) && (!onlyActive || j.status === "active")
  );
  const pages = Math.ceil(visibleJobs.length / PAGE_SIZE);
  const shown = visibleJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page-container">
      <PageHeader title={admin ? "Manage Jobs" : "Open Positions"} description={onlyActive ? "Active roles only" : "Explore opportunities"}>
        <SearchBar value={search} onChange={setSearch} onSearch={() => { setPage(1); load(); }} placeholder="Search jobs..." />
        <button className="btn btn-secondary" onClick={() => { setPage(1); load(); }}>Search</button>
        {admin && <button className="btn btn-primary" onClick={() => setForm({})}><Icons.Plus /> Create Job</button>}
      </PageHeader>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <LoadingState message="Loading jobs..." />
      ) : visibleJobs.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Icons.Briefcase />}
            title="No jobs found"
            description={search ? "Try adjusting your search" : "No open positions at the moment"}
            action={admin && <button className="btn btn-primary" onClick={() => setForm({})}><Icons.Plus /> Create Job</button>}
          />
        </Card>
      ) : (
        <>
          <div className="jobs-grid">
            {shown.map((job) => (
              <Card key={job._id} className="job-card">
                <div className="job-card-header">
                  <span className="job-department">{job.department}</span>
                  <span className={`status-badge status-${job.status}`}>{job.status}</span>
                </div>
                <h3 className="job-title">{job.title}</h3>
                <div className="job-meta">
                  <span><Icons.MapPin /> {job.location}</span>
                  <span>{job.employmentType}</span>
                  {admin && <span>{job.openings} opening{job.openings > 1 ? "s" : ""}</span>}
                </div>
                <p className="job-description">{job.description}</p>
                <div className="job-card-actions">
                  {admin ? (
                    <>
                      <button className="btn btn-outline btn-sm" onClick={() => setForm(job)}><Icons.Edit /> Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job)}><Icons.Trash /> Delete</button>
                    </>
                  ) : (
                    <Link to={`/apply/${job._id}`} className="btn btn-primary">Apply <Icons.ArrowRight /></Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} pages={pages} total={visibleJobs.length} onChange={setPage} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APPLICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function Applications({ admin = false, insight }) {
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const insights = {
    candidates: { title: "Candidates", description: "Candidate applications and contact details." },
    applications: { title: "All Applications", description: "Every application in the pipeline." },
    today: { title: "Today's Applications", description: "Applications submitted today.", period: "today" },
    pending: { title: "Pending Applications", description: "Applications awaiting decision.", group: "pending" },
    interviews: { title: "Interview Applications", description: "Candidates with interviews scheduled.", status: "Interview Scheduled" },
  };

  const activeInsight = insights[insight];
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState(activeInsight?.status || query.get("status") || "");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const load = async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/applications", {
        params: {
          status,
          search,
          period: activeInsight?.period || query.get("period") || "",
          group: activeInsight?.group || query.get("group") || "",
          page: p,
          limit: PAGE_SIZE,
        },
      });
      setApplications(data.applications);
      setMeta({ total: data.total, pages: data.pages });
    } catch (e) {
      setError(e.response?.data?.message || "Could not load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStatus(activeInsight?.status || query.get("status") || "");
    setPage(1);
  }, [location.search, insight]);

  useEffect(() => { load(); }, [status, page, location.search]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await api.get("/applications", { params: { limit: 10000 } });
      downloadCsv(
        `applications-${new Date().toISOString().slice(0, 10)}.csv`,
        ["Application ID", "Candidate", "Email", "Job", "Status", "Created", "Updated"],
        data.applications.map((a) => [
          a.applicationId,
          a.candidate?.name,
          a.candidate?.email,
          a.job?.title,
          a.status,
          new Date(a.createdAt).toLocaleString(),
          new Date(a.updatedAt).toLocaleString(),
        ])
      );
    } catch (e) {
      setError(e.response?.data?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleSearch = () => { setPage(1); load(1); };

  return (
    <div className="page-container">
      <PageHeader
        title={activeInsight?.title || (admin ? "All Applications" : "My Applications")}
        description={activeInsight?.description || "Track and manage applications"}
      >
        <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} placeholder="Search applications..." />
        <select className="form-select" style={{ width: 'auto' }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {["Applied", "Resume Under Review", "Interview Scheduled", "Technical Round", "HR Round", "Selected", "Rejected", "Offer Released", "Joined", "Withdrawn"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={handleSearch}>Search</button>
        {admin && (
          <button className="btn btn-outline" onClick={handleExport} disabled={exporting}>
            <Icons.Download /> {exporting ? "Exporting..." : "Export"}
          </button>
        )}
      </PageHeader>

      <Card>
        {error && <div className="error-banner">{error}</div>}
        <DataTable
          loading={loading}
          emptyIcon={<Icons.FileText />}
          emptyTitle="No applications found"
          emptyDescription={search || status ? "Try adjusting your filters" : "Applications will appear here"}
          columns={[
            {
              key: "candidate",
              label: "Candidate",
              render: (a) => (
                <div className="user-cell">
                  <div className="user-avatar-sm">{(a.candidate?.name || "?")[0]}</div>
                  <div>
                    <strong>{a.candidate?.name || "Unavailable"}</strong>
                    <small>{a.candidate?.email || "No email"}</small>
                  </div>
                </div>
              ),
            },
            { key: "job", label: "Job", render: (a) => a.job?.title || "Unavailable" },
            { key: "referral", label: "Referral", render: (a) => a.referral?.employeeName || "—" },
            { key: "status", label: "Status", render: (a) => <span className={statusClass(a.status)}>{a.status}</span> },
            { key: "createdAt", label: "Submitted", render: (a) => new Date(a.createdAt).toLocaleDateString() },
            {
              key: "actions",
              label: "",
              render: (a) => (
                <Link to={`${admin ? "/admin/applications" : "/applications"}/${a._id}`} className="btn btn-sm btn-outline">
                  View <Icons.ArrowRight />
                </Link>
              ),
            },
          ]}
          data={applications}
        />
        <Pagination page={page} pages={meta.pages} total={meta.total} onChange={setPage} />
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APPLICATION DETAILS
// ═══════════════════════════════════════════════════════════════════════════

export function ApplicationDetails() {
  const id = location.pathname.split("/").pop();
  const nav = useNavigate();
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  const handleWithdraw = async () => {
    setSaving(true);
    setError("");
    setShowWithdrawConfirm(false);
    try {
      const r = await api.patch(`/applications/${id}/withdraw`);
      setApp(r.data.application);
    } catch (e) {
      setError(e.response?.data?.message || "Could not withdraw application");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    api.get(`/applications/${id}`)
      .then((r) => {
        setApp(r.data.application);
        setStatus(r.data.application.status);
      })
      .catch(() => setError("Could not load this application."));
  }, [id]);

  if (error && !app) return <div className="page-container"><ErrorState title="Application not found" message={error} onRetry={() => nav(-1)} /></div>;
  if (!app) return <div className="page-container"><LoadingState message="Loading application..." /></div>;

  const candidateName = app.candidate?.name || "Candidate unavailable";
  const initials = candidateName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const resumeUrl = app.resume?.path && `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/uploads/${app.resume.path}`;

  const updateStatus = async () => {
    setSaving(true);
    setError("");
    try {
      const r = await api.patch(`/applications/${id}/status`, { status, remarks: remarks || "Updated" });
      setApp(r.data.application);
      setStatus(r.data.application.status);
      setRemarks("");
    } catch (e) {
      setError(e.response?.data?.message || "Could not update status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Application Details" description={`Application ${app.applicationId}`}>
        <button className="btn btn-outline btn-sm" onClick={() => nav(-1)}><Icons.ArrowLeft /> Back</button>
      </PageHeader>

      <div className="detail-page">
        {/* Left: Main Info */}
        <div className="detail-main-col">
          <Card>
            <div className="detail-profile">
              <div className="detail-avatar">{initials}</div>
              <div className="detail-profile-info">
                <h2>{candidateName}</h2>
                <p>{app.job?.title || "Job unavailable"} · {app.job?.department || ""}</p>
                <div className="detail-badges">
                  <span className={statusClass(app.status)}>{app.status}</span>
                  {resumeUrl && <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary"><Icons.ExternalLink /> Resume</a>}
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Contact Information</h4>
              <div className="detail-row">
                <div><label>Email</label><span>{app.candidate?.email || "—"}</span></div>
                <div><label>Phone</label><span>{app.candidate?.phone || "—"}</span></div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Referrer Information</h4>
              <div className="detail-row">
                <div><label>Name</label><span>{app.referral?.employeeName || "—"}</span></div>
                <div><label>Employee ID</label><span>{app.referral?.employeeId || "—"}</span></div>
                <div><label>Department</label><span>{app.referral?.department || "—"}</span></div>
                <div><label>Email</label><span>{app.referral?.employeeEmail || "—"}</span></div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Referral Details</h4>
              <div className="detail-row">
                <div><label>Relationship</label><span>{app.referral?.candidateRelationship || "—"}</span></div>
                <div><label>Known For</label><span>{app.referral?.durationKnown || "—"}</span></div>
                <div><label>Worked Together</label><span>{app.referral?.workedDirectly || "—"}</span></div>
                <div><label>Experience</label><span>{app.referral?.candidateExperienceLevel || "—"}</span></div>
              </div>
            </div>

            {(app.coverLetter || app.additionalNotes) && (
              <div className="detail-section">
                <h4>Additional Notes</h4>
                {app.coverLetter && <p className="detail-note">{app.coverLetter}</p>}
                {app.additionalNotes && <p className="detail-note">{app.additionalNotes}</p>}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Actions & Timeline */}
        <div className="detail-side-col">
          {user.role === "admin" && (
            <Card>
              <div className="card-header"><h3>Update Status</h3></div>
              <div className="detail-form">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    {["Applied", "Resume Under Review", "Interview Scheduled", "Technical Round", "HR Round", "Selected", "Rejected", "Offer Released", "Joined"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <input className="form-input" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add a note..." />
                </div>
                {error && <div className="form-message error">{error}</div>}
                <button className="btn btn-primary" onClick={updateStatus} disabled={saving}>
                  {saving ? "Saving..." : "Update Status"}
                </button>
              </div>
            </Card>
          )}

          {user.role === "candidate" && !["Joined", "Rejected", "Withdrawn"].includes(app.status) && (
            <Card>
              <div className="card-header"><h3>Application Actions</h3></div>
              <div className="detail-form">
                <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '12px' }}>
                  If you no longer wish to proceed with this application, you can withdraw it.
                </p>
                {error && <div className="form-message error">{error}</div>}
                <button 
                  className="btn btn-danger" 
                  onClick={() => setShowWithdrawConfirm(true)} 
                  disabled={saving}
                >
                  {saving ? "Withdrawing..." : "Withdraw Application"}
                </button>
              </div>
            </Card>
          )}

          <ConfirmModal
            isOpen={showWithdrawConfirm}
            title="Withdraw Application"
            message="Are you sure you want to withdraw this application? This action cannot be undone."
            confirmText="Withdraw"
            cancelText="Cancel"
            danger={true}
            onConfirm={handleWithdraw}
            onCancel={() => setShowWithdrawConfirm(false)}
          />

          <Card>
            <div className="card-header"><h3>Status History</h3></div>
            <div className="detail-timeline">
              {app.statusHistory?.length ? (
                app.statusHistory.slice().reverse().map((h, i) => (
                  <div className="timeline-entry" key={i}>
                    <div className="timeline-dot" />
                    <div className="timeline-info">
                      <strong>{h.status}</strong>
                      <span>{h.changedAt ? new Date(h.changedAt).toLocaleDateString() : ""}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted" style={{ padding: '16px' }}>No updates yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APPLY (Referral Form)
// ═══════════════════════════════════════════════════════════════════════════

export function Apply() {
  const nav = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [duplicateMsg, setDuplicateMsg] = useState("");
  const [form, setForm] = useState({
    job: "", employeeName: "", employeeId: "", employeeEmail: "", department: "",
    candidateContact: "", candidateRelationship: "", durationKnown: "", workedDirectly: "",
    candidateExperienceLevel: "", designation: "", coverLetter: "", additionalNotes: "",
  });

  useEffect(() => {
    api.get("/jobs?status=active")
      .then((r) => setJobs(r.data.jobs))
      .catch((e) => setJobsError(e.response?.data?.message || "Could not load jobs"))
      .finally(() => setJobsLoading(false));
  }, []);

  const set = (k, v) => setForm({ ...form, [k]: v });

  const checkDuplicate = async () => {
    if (!form.candidateContact || !form.job) return false;
    setDuplicateMsg("");
    try {
      const { data } = await api.get("/applications/check-duplicate", {
        params: { candidateContact: form.candidateContact, job: form.job },
      });
      if (data.referralExists || data.candidateExists) {
        setDuplicateMsg(data.referralExists ? "This candidate has already been referred." : "A candidate with this contact already exists.");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    if (!/^(?:[^\s@]+@[^\s@]+\.[^\s@]+|\+?[\d\s().-]{7,})$/.test(form.candidateContact.trim())) {
      setError("Enter a valid phone number or email address.");
      setSubmitting(false);
      return;
    }

    if (await checkDuplicate()) {
      setSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append("job", form.job);
    data.append("resume", file);
    data.append("coverLetter", form.coverLetter);
    data.append("additionalNotes", form.additionalNotes);
    data.append("referral", JSON.stringify({
      ...form,
      relationship: form.candidateRelationship,
    }));

    try {
      await api.post("/applications", data);
      nav("/applications");
    } catch (e) {
      setError(e.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Submit Referral" description="Refer a candidate for an open position" />

      <Card>
        <form className="form-grid" onSubmit={handleSubmit}>
          {/* Row 1: Job Selection - full width */}
          <div className="form-group full-width">
            <label className="form-label">Open Position</label>
            <select className="form-select" required value={form.job} onChange={(e) => set("job", e.target.value)} disabled={jobsLoading}>
              <option value="">{jobsLoading ? "Loading..." : "Select a position"}</option>
              {jobs.map((j) => <option key={j._id} value={j._id}>{j.jobId} — {j.title}</option>)}
            </select>
            {jobsError && <span className="form-error">{jobsError}</span>}
          </div>

          {/* Row 2: Your Details - 4 fields */}
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input className="form-input" required value={form.employeeName} onChange={(e) => set("employeeName", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <input className="form-input" required value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Your Email</label>
            <input className="form-input" type="email" required value={form.employeeEmail} onChange={(e) => set("employeeEmail", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Your Department</label>
            <input className="form-input" required value={form.department} onChange={(e) => set("department", e.target.value)} />
          </div>

          {/* Row 3: Candidate Details - 6 fields */}
          <div className="form-group">
            <label className="form-label">Candidate Contact</label>
            <input className="form-input" required value={form.candidateContact} onChange={(e) => set("candidateContact", e.target.value)} onBlur={checkDuplicate} placeholder="Email or phone" />
          </div>
          <div className="form-group">
            <label className="form-label">Relationship</label>
            <select className="form-select" required value={form.candidateRelationship} onChange={(e) => set("candidateRelationship", e.target.value)}>
              <option value="">Select</option>
              <option>Ex-colleague</option>
              <option>Friend</option>
              <option>Family</option>
              <option>Classmate</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Duration Known</label>
            <select className="form-select" required value={form.durationKnown} onChange={(e) => set("durationKnown", e.target.value)}>
              <option value="">Select</option>
              <option>&lt;1 year</option>
              <option>1-3 years</option>
              <option>3-5 years</option>
              <option>5+ years</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Worked Together?</label>
            <select className="form-select" required value={form.workedDirectly} onChange={(e) => set("workedDirectly", e.target.value)}>
              <option value="">Select</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Experience Level</label>
            <input className="form-input" required value={form.candidateExperienceLevel} onChange={(e) => set("candidateExperienceLevel", e.target.value)} placeholder="e.g. Senior" />
          </div>
          <div className="form-group">
            <label className="form-label">Designation</label>
            <input className="form-input" required value={form.designation} onChange={(e) => set("designation", e.target.value)} placeholder="Job title" />
          </div>

          {duplicateMsg && <div className="form-message warning full-width"><Icons.AlertCircle /> {duplicateMsg}</div>}

          {/* Row 4: Resume, Cover Letter, Notes - inline with other fields */}
          <div className="form-group">
            <label className="form-label">Resume</label>
            <div className={`file-upload ${file ? 'file-selected' : ''}`}>
              <input type="file" required accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} />
              <div className="file-upload-icon">
                <Icons.Upload />
              </div>
              <div className="file-upload-text">
                <strong>{file ? file.name : 'Upload'}</strong>
                <span>PDF, DOC, DOCX</span>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Cover Letter <span className="optional">(opt)</span></label>
            <input className="form-input" value={form.coverLetter} onChange={(e) => set("coverLetter", e.target.value)} placeholder="Brief summary..." />
          </div>
          <div className="form-group span-2">
            <label className="form-label">Notes <span className="optional">(opt)</span></label>
            <input className="form-input" value={form.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)} placeholder="Additional info..." />
          </div>

          {/* Declaration & Submit */}
          <label className="checkbox-label full-width">
            <input type="checkbox" required />
            <span>I confirm that the information is accurate and follows the referral policy.</span>
          </label>

          {error && <div className="form-message error full-width">{error}</div>}

          <div className="form-actions full-width">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Referral"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ACCESS DENIED
// ═══════════════════════════════════════════════════════════════════════════

export function AccessDenied() {
  return (
    <div className="page-container page-center">
      <div className="access-denied">
        <Icons.Lock />
        <h1>Access Denied</h1>
        <p>You don't have permission to view this page.</p>
        <Link to="/dashboard" className="btn btn-primary btn-lg">Return to Dashboard</Link>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REFERRAL POLICY
// ═══════════════════════════════════════════════════════════════════════════

export function ReferralPolicy() {
  return (
    <div className="page-container page-narrow">
      <PageHeader title="Referral Guidelines" description="Please review before submitting a referral" />

      <Card>
        <ul className="policy-list">
          <li><Icons.Check /> Do not submit the same candidate more than once.</li>
          <li><Icons.Check /> Keep candidate information confidential.</li>
          <li><Icons.Check /> Declare your relationship honestly.</li>
          <li><Icons.Check /> Recruitment status updates are managed by the hiring team.</li>
        </ul>
        <div className="policy-actions">
          <Link to="/jobs" className="btn btn-primary btn-lg">Browse Open Jobs</Link>
        </div>
      </Card>
    </div>
  );
}
