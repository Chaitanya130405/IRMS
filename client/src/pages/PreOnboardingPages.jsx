import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const statusColors = {
  "Not Started": { bg: "#f1f5f9", text: "#64748b", dot: "#94a3b8" },
  "Pending": { bg: "#fef3c7", text: "#d97706", dot: "#f59e0b" },
  "In Progress": { bg: "#dbeafe", text: "#2563eb", dot: "#3b82f6" },
  "Completed": { bg: "#dcfce7", text: "#16a34a", dot: "#22c55e" },
  "At Risk": { bg: "#fee2e2", text: "#dc2626", dot: "#ef4444" },
  "On Track": { bg: "#dcfce7", text: "#16a34a", dot: "#22c55e" },
  "Dropped": { bg: "#fecaca", text: "#b91c1c", dot: "#dc2626" },
};

const getStatusStyle = (status) => statusColors[status] || statusColors["Not Started"];

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isOverdue = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

const PAGE_SIZE = 10;

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
  CheckCircle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Clock: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  TrendingUp: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
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
  FileText: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Activity: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  History: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 106 5.3L3 8" />
      <path d="M12 7v5l4 2" />
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
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

function StatusBadge({ status, size = "md" }) {
  const style = getStatusStyle(status);
  return (
    <span
      className={`status-badge-po ${size}`}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <span className="status-dot" style={{ backgroundColor: style.dot }} />
      {status}
    </span>
  );
}

function Pagination({ page, pages, total, onChange }) {
  if (pages <= 1) return null;

  return (
    <div className="pagination">
      <button className="pagination-btn" onClick={() => onChange(page - 1)} disabled={page === 1}>
        <Icons.ChevronLeft /> <span>Prev</span>
      </button>
      <span className="pagination-info">
        Page {page} of {pages}
      </span>
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

// ═══════════════════════════════════════════════════════════════════════════
// PRE-ONBOARDING LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════

export function PreOnboardingList() {
  const nav = useNavigate();
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const [listRes, dashRes] = await Promise.all([
        api.get("/pre-onboarding", {
          params: { search, status: statusFilter, page: p, limit: PAGE_SIZE },
        }),
        api.get("/pre-onboarding/dashboard"),
      ]);
      setData(listRes.data.preOnboardings);
      setMeta({ total: listRes.data.total, pages: listRes.data.pages });
      setStats(dashRes.data.stats);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load pre-onboarding data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    load(1);
  };

  const handleExport = async () => {
    try {
      const { data } = await api.get("/pre-onboarding/export");
      const headers = Object.keys(data.data[0] || {});
      const csv = [
        headers.join(","),
        ...data.data.map((row) => headers.map((h) => `"${row[h] || ""}"`).join(",")),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pre-onboarding-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } catch (e) {
      setError("Export failed");
    }
  };

  const statCards = stats
    ? [
        { label: "Total", value: stats.total, icon: <Icons.Users />, color: "blue" },
        { label: "On Track", value: stats.onTrack, icon: <Icons.CheckCircle />, color: "green" },
        { label: "In Progress", value: stats.inProgress, icon: <Icons.Clock />, color: "orange" },
        { label: "At Risk", value: stats.atRisk, icon: <Icons.AlertTriangle />, color: "red" },
      ]
    : [];

  return (
    <div className="page-container">
      <PageHeader
        title="Pre-Onboarding"
        description="Track and manage candidate engagement activities before joining"
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={handleSearch}
          placeholder="Search candidates..."
        />
        <select
          className="form-select"
          style={{ width: "auto" }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="In Progress">In Progress</option>
          <option value="On Track">On Track</option>
          <option value="At Risk">At Risk</option>
          <option value="Completed">Completed</option>
          <option value="Dropped">Dropped</option>
        </select>
        <button className="btn btn-secondary" onClick={handleSearch}>
          Search
        </button>
        <button className="btn btn-outline" onClick={handleExport}>
          <Icons.Download /> Export
        </button>
      </PageHeader>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid stats-4">
          {statCards.map((s) => (
            <div key={s.label} className={`stat-card stat-${s.color}`}>
              <div className="stat-card-icon">{s.icon}</div>
              <div className="stat-card-content">
                <span className="stat-card-value">{s.value}</span>
                <span className="stat-card-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Table */}
      <Card>
        {error && <div className="error-banner">{error}</div>}
        {loading ? (
          <LoadingState message="Loading pre-onboarding data..." />
        ) : data.length === 0 ? (
          <EmptyState
            icon={<Icons.FileText />}
            title="No pre-onboarding records"
            description={search || statusFilter ? "Try adjusting your filters" : "Pre-onboarding records will appear when candidates are selected"}
          />
        ) : (
          <>
            <div className="data-table-wrapper">
              <table className="data-table po-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Role / Client</th>
                    <th>Expected Joining</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Risk</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((po) => (
                    <tr key={po._id} onClick={() => nav(`/admin/pre-onboarding/${po._id}`)} style={{ cursor: "pointer" }}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-sm">{(po.candidate?.name || "?")[0]}</div>
                          <div>
                            <strong>{po.candidate?.name || "N/A"}</strong>
                            <small>{po.candidate?.email}</small>
                          </div>
                          {po.isCriticalHire && (
                            <span className="critical-badge">
                              <Icons.Star /> Critical
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{po.job?.title || "N/A"}</strong>
                          <small>{po.clientName || po.job?.clientName || "—"}</small>
                        </div>
                      </td>
                      <td>{formatDate(po.expectedJoiningDate)}</td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-bar-mini">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${po.stats?.progressPercent || 0}%` }}
                            />
                          </div>
                          <span>
                            {po.stats?.completed || 0}/{po.stats?.total || 0}
                          </span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={po.overallStatus} />
                      </td>
                      <td>
                        {po.stats?.atRisk > 0 ? (
                          <span className="risk-indicator">
                            <Icons.AlertTriangle /> {po.stats.atRisk}
                          </span>
                        ) : (
                          <span className="no-risk">—</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); nav(`/admin/pre-onboarding/${po._id}`); }}>
                          View <Icons.ArrowRight />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={meta.pages} total={meta.total} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRE-ONBOARDING DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════

export function PreOnboardingDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("checklist");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ title: "", owner: "Hiring Team", isCriticalHire: true });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/pre-onboarding/${id}`);
      setData(res.data.preOnboarding);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load pre-onboarding details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateActivity = async (activityId, updates) => {
    setSaving(true);
    try {
      const res = await api.patch(`/pre-onboarding/${id}/activities/${activityId}`, updates);
      setData(res.data.preOnboarding);
      setEditingActivity(null);
    } catch (e) {
      setError(e.response?.data?.message || "Could not update activity");
    } finally {
      setSaving(false);
    }
  };

  const addActivity = async () => {
    if (!newActivity.title.trim()) return;
    setSaving(true);
    try {
      const res = await api.post(`/pre-onboarding/${id}/activities`, newActivity);
      setData(res.data.preOnboarding);
      setShowAddActivity(false);
      setNewActivity({ title: "", owner: "Hiring Team", isCriticalHire: true });
    } catch (e) {
      setError(e.response?.data?.message || "Could not add activity");
    } finally {
      setSaving(false);
    }
  };

  const updateOverallStatus = async (status) => {
    setSaving(true);
    try {
      const res = await api.patch(`/pre-onboarding/${id}`, { overallStatus: status });
      setData(res.data.preOnboarding);
    } catch (e) {
      setError(e.response?.data?.message || "Could not update status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-container"><LoadingState message="Loading pre-onboarding..." /></div>;
  if (error && !data) return <div className="page-container"><div className="error-state"><h3>Error</h3><p>{error}</p><button className="btn btn-primary" onClick={() => nav(-1)}>Go Back</button></div></div>;
  if (!data) return null;

  const stats = data.stats || {};
  const candidate = data.candidate || {};
  const job = data.job || {};

  return (
    <div className="page-container po-detail-page">
      {/* Header */}
      <div className="po-detail-header">
        <button className="btn btn-outline btn-sm" onClick={() => nav("/admin/pre-onboarding")}>
          <Icons.ArrowLeft /> Back to List
        </button>
      </div>

      {/* Candidate Info Card */}
      <Card className="po-candidate-card">
        <div className="po-candidate-info">
          <div className="po-candidate-avatar">
            {candidate.name?.[0] || "?"}
          </div>
          <div className="po-candidate-details">
            <h2>{candidate.name || "N/A"}</h2>
            <p>{job.title || "N/A"}</p>
            {data.isCriticalHire && (
              <span className="critical-badge-lg">
                <Icons.Star /> Critical Hire
              </span>
            )}
          </div>
        </div>
        <div className="po-candidate-meta">
          <div className="meta-item">
            <label>Client Name</label>
            <span>{data.clientName || job.clientName || "—"}</span>
          </div>
          <div className="meta-item">
            <label>Expected Joining</label>
            <span>
              <Icons.Calendar /> {formatDate(data.expectedJoiningDate)}
            </span>
          </div>
          <div className="meta-item">
            <label>Engagement Start</label>
            <span>
              <Icons.Calendar /> {formatDate(data.engagementStartDate)}
            </span>
          </div>
          <div className="meta-item">
            <label>Owner</label>
            <span>{data.assignedTo?.name || "Hiring Team"}</span>
          </div>
        </div>
        <div className="po-status-dropdown">
          <select
            className="form-select status-select"
            value={data.overallStatus}
            onChange={(e) => updateOverallStatus(e.target.value)}
            disabled={saving}
            style={{ backgroundColor: getStatusStyle(data.overallStatus).bg, color: getStatusStyle(data.overallStatus).text }}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Completed">Completed</option>
            <option value="Dropped">Dropped</option>
          </select>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="po-stats-row">
        <div className="po-stat-item">
          <div className="po-stat-icon blue"><Icons.FileText /></div>
          <div className="po-stat-content">
            <span className="po-stat-value">{stats.total || 0}</span>
            <span className="po-stat-label">Total Activities</span>
          </div>
        </div>
        <div className="po-stat-item">
          <div className="po-stat-icon green"><Icons.CheckCircle /></div>
          <div className="po-stat-content">
            <span className="po-stat-value">{stats.completed || 0}</span>
            <span className="po-stat-label">Completed</span>
          </div>
        </div>
        <div className="po-stat-item">
          <div className="po-stat-icon orange"><Icons.Clock /></div>
          <div className="po-stat-content">
            <span className="po-stat-value">{stats.pending || 0}</span>
            <span className="po-stat-label">Pending</span>
          </div>
        </div>
        <div className="po-stat-item">
          <div className="po-stat-icon red"><Icons.AlertTriangle /></div>
          <div className="po-stat-content">
            <span className="po-stat-value">{stats.atRisk || 0}</span>
            <span className="po-stat-label">At Risk</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="po-tabs">
        <button
          className={`po-tab ${activeTab === "checklist" ? "active" : ""}`}
          onClick={() => setActiveTab("checklist")}
        >
          Checklist
        </button>
        <button
          className={`po-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Activity History
        </button>
        <button
          className={`po-tab ${activeTab === "followups" ? "active" : ""}`}
          onClick={() => setActiveTab("followups")}
        >
          Follow-Ups
        </button>
        <button
          className={`po-tab ${activeTab === "risk" ? "active" : ""}`}
          onClick={() => setActiveTab("risk")}
        >
          Risk Alerts
        </button>
      </div>

      {/* Tab Content */}
      <Card className="po-tab-content">
        {activeTab === "checklist" && (
          <>
            {/* Progress Bar */}
            <div className="po-progress-header">
              <span>Engagement Progress</span>
              <div className="po-progress-bar">
                <div className="po-progress-fill" style={{ width: `${stats.progressPercent || 0}%` }} />
              </div>
              <span className="po-progress-text">
                {stats.progressPercent || 0}% ({stats.completed || 0} / {stats.total || 0}) Completed
              </span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddActivity(true)}>
                <Icons.Plus /> Add Follow-up
              </button>
            </div>

            {/* Activities Table */}
            <div className="data-table-wrapper">
              <table className="data-table po-activities-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Activity</th>
                    <th>Owner</th>
                    <th>Critical Hire</th>
                    <th>Status</th>
                    <th>Follow-up Date</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.activities?.map((activity, idx) => (
                    <tr key={activity._id} className={activity.status === "At Risk" ? "at-risk-row" : ""}>
                      <td>{idx + 1}.</td>
                      <td className="activity-title">{activity.title}</td>
                      <td>
                        <span className="owner-badge">{activity.owner}</span>
                      </td>
                      <td>{activity.isCriticalHire ? "Yes" : "No"}</td>
                      <td>
                        {editingActivity === activity._id ? (
                          <select
                            className="form-select form-select-sm"
                            value={activity.status}
                            onChange={(e) => updateActivity(activity._id, { status: e.target.value })}
                          >
                            <option>Not Started</option>
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                            <option>At Risk</option>
                          </select>
                        ) : (
                          <StatusBadge status={activity.status} size="sm" />
                        )}
                      </td>
                      <td className={isOverdue(activity.followUpDate) && activity.status !== "Completed" ? "overdue" : ""}>
                        {editingActivity === activity._id ? (
                          <input
                            type="date"
                            className="form-input form-input-sm"
                            value={activity.followUpDate?.split("T")[0] || ""}
                            onChange={(e) => updateActivity(activity._id, { followUpDate: e.target.value })}
                          />
                        ) : (
                          formatDate(activity.followUpDate)
                        )}
                      </td>
                      <td className="notes-cell">
                        {editingActivity === activity._id ? (
                          <input
                            type="text"
                            className="form-input form-input-sm"
                            value={activity.notes || ""}
                            placeholder="Add notes..."
                            onChange={(e) => updateActivity(activity._id, { notes: e.target.value })}
                          />
                        ) : (
                          activity.notes || "—"
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-icon"
                          onClick={() => setEditingActivity(editingActivity === activity._id ? null : activity._id)}
                          title="Edit"
                          aria-label="Edit activity"
                        >
                          <Icons.Edit />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Activity Modal */}
            {showAddActivity && (
              <div className="modal-backdrop" onClick={() => setShowAddActivity(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Add Custom Activity</h3>
                  <div className="form-group">
                    <label>Activity Title</label>
                    <input
                      className="form-input"
                      value={newActivity.title}
                      onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                      placeholder="Enter activity title"
                    />
                  </div>
                  <div className="form-group">
                    <label>Owner</label>
                    <select
                      className="form-select"
                      value={newActivity.owner}
                      onChange={(e) => setNewActivity({ ...newActivity, owner: e.target.value })}
                    >
                      <option>Hiring Team</option>
                      <option>Hiring Manager</option>
                      <option>Admin Team</option>
                      <option>Management</option>
                      <option>TSA / TSM</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newActivity.isCriticalHire}
                        onChange={(e) => setNewActivity({ ...newActivity, isCriticalHire: e.target.checked })}
                      />
                      <span>Critical Hire Activity</span>
                    </label>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowAddActivity(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={addActivity} disabled={saving}>
                      {saving ? "Adding..." : "Add Activity"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "history" && (
          <div className="po-history">
            <h3><Icons.History /> Activity History</h3>
            {data.history?.length > 0 ? (
              <div className="timeline">
                {data.history.slice().reverse().map((entry, idx) => (
                  <div className="timeline-item" key={idx}>
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <strong>{entry.action}</strong>
                      {entry.activityTitle && <p>Activity: {entry.activityTitle}</p>}
                      {entry.previousStatus && entry.newStatus && (
                        <p>Status: {entry.previousStatus} → {entry.newStatus}</p>
                      )}
                      {entry.notes && <p>Notes: {entry.notes}</p>}
                      <small>{formatDate(entry.createdAt)}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No history yet</p>
            )}
          </div>
        )}

        {activeTab === "followups" && (
          <div className="po-followups">
            <h3><Icons.Bell /> Upcoming Follow-Ups</h3>
            {data.activities?.filter(a => a.followUpDate && a.status !== "Completed").length > 0 ? (
              <div className="followup-list">
                {data.activities
                  .filter(a => a.followUpDate && a.status !== "Completed")
                  .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
                  .map((activity) => (
                    <div
                      key={activity._id}
                      className={`followup-item ${isOverdue(activity.followUpDate) ? "overdue" : ""}`}
                    >
                      <div className="followup-info">
                        <strong>{activity.title}</strong>
                        <span>{activity.owner}</span>
                      </div>
                      <div className="followup-date">
                        <Icons.Calendar />
                        {formatDate(activity.followUpDate)}
                        {isOverdue(activity.followUpDate) && <span className="overdue-badge">Overdue</span>}
                      </div>
                      <StatusBadge status={activity.status} size="sm" />
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted">No upcoming follow-ups</p>
            )}
          </div>
        )}

        {activeTab === "risk" && (
          <div className="po-risk-alerts">
            <h3><Icons.AlertTriangle /> Risk Alerts</h3>
            {data.activities?.filter(a => a.status === "At Risk").length > 0 ? (
              <div className="risk-list">
                {data.activities
                  .filter(a => a.status === "At Risk")
                  .map((activity) => (
                    <div key={activity._id} className="risk-item">
                      <div className="risk-icon"><Icons.AlertTriangle /></div>
                      <div className="risk-info">
                        <strong>{activity.title}</strong>
                        <p>{activity.notes || "No notes provided"}</p>
                        <small>Follow-up: {formatDate(activity.followUpDate)}</small>
                      </div>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setActiveTab("checklist");
                          setEditingActivity(activity._id);
                        }}
                      >
                        Take Action
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="no-risk-state">
                <Icons.CheckCircle />
                <p>No risk alerts. All activities are on track!</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Key Insights Footer */}
      <div className="po-insights-footer">
        <div className="insight-card green">
          <Icons.CheckCircle />
          <div>
            <strong>On Track</strong>
            <span>{stats.completed || 0} Activities</span>
          </div>
        </div>
        <div className="insight-card orange">
          <Icons.Clock />
          <div>
            <strong>Pending Follow-up</strong>
            <span>{stats.pending || 0} Activities</span>
          </div>
        </div>
        <div className="insight-card red">
          <Icons.AlertTriangle />
          <div>
            <strong>Joining Risk</strong>
            <span>{stats.atRisk || 0} Activities</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// START PRE-ONBOARDING (From Application Details)
// ═══════════════════════════════════════════════════════════════════════════

export function StartPreOnboarding({ applicationId, onSuccess }) {
  const [form, setForm] = useState({
    clientName: "",
    isCriticalHire: true,
    expectedJoiningDate: "",
    engagementStartDate: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post(`/pre-onboarding/application/${applicationId}`, form);
      onSuccess?.();
    } catch (e) {
      setError(e.response?.data?.message || "Could not start pre-onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="start-po-form" onSubmit={handleSubmit}>
      <h3>Start Pre-Onboarding</h3>
      <p>Initialize the candidate engagement checklist for this selected candidate.</p>

      <div className="form-group">
        <label className="form-label">Client Name</label>
        <input
          className="form-input"
          value={form.clientName}
          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          placeholder="Enter client name"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Expected Joining Date</label>
        <input
          className="form-input"
          type="date"
          value={form.expectedJoiningDate}
          onChange={(e) => setForm({ ...form, expectedJoiningDate: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Engagement Start Date</label>
        <input
          className="form-input"
          type="date"
          value={form.engagementStartDate}
          onChange={(e) => setForm({ ...form, engagementStartDate: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.isCriticalHire}
            onChange={(e) => setForm({ ...form, isCriticalHire: e.target.checked })}
          />
          <span>Mark as Critical Hire</span>
        </label>
      </div>

      {error && <div className="form-message error">{error}</div>}

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Starting..." : "Start Pre-Onboarding"}
      </button>
    </form>
  );
}
