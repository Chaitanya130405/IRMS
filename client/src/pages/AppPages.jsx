import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
const statusClass = (s) => `badge ${s?.toLowerCase().replaceAll(" ", "-")}`;
const csvValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const downloadCsv = (filename, headers, rows) => {
  const csv = [headers, ...rows]
    .map((row) => row.map(csvValue).join(","))
    .join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
const PAGE_SIZE = 8;
function Pagination({ page, pages, total, onChange }) {
  if (pages <= 1)
    return total ? (
      <p className="pagination-summary">
        Showing {total} result{total === 1 ? "" : "s"}
      </p>
    ) : null;
  const numbers = Array.from({ length: pages }, (_, index) => index + 1).filter(
    (number) =>
      number === 1 || number === pages || Math.abs(number - page) <= 1,
  );
  return (
    <div className="pagination">
      <span>
        Page {page} of {pages} · {total} results
      </span>
      <div>
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
        >
          ←
        </button>
        {numbers.map((number, index) => (
          <React.Fragment key={number}>
            {index > 0 && numbers[index - 1] !== number - 1 && <i>…</i>}
            <button
              type="button"
              className={number === page ? "active" : ""}
              onClick={() => onChange(number)}
            >
              {number}
            </button>
          </React.Fragment>
        ))}
        <button
          type="button"
          aria-label="Next page"
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
        >
          →
        </button>
      </div>
    </div>
  );
}
function TableSkeleton({ columns = 6, rows = 5 }) {
  return (
    <div className="table-skeleton" role="status" aria-label="Loading data">
      <span className="loading-spinner" aria-hidden="true" />
      <span>Loading data…</span>
      <table aria-hidden="true">
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              {Array.from({ length: columns }, (_, column) => (
                <td key={column}>
                  <i />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function JobSkeleton() {
  return (
    <div className="job-grid" role="status" aria-label="Loading jobs">
      {Array.from({ length: 3 }, (_, index) => (
        <article className="job job-skeleton" key={index}>
          <i />
          <i />
          <i />
          <i />
        </article>
      ))}
    </div>
  );
}
function NotificationSkeleton() {
  return (
    <div
      className="notification-skeleton"
      role="status"
      aria-label="Loading notifications"
    >
      <span className="loading-spinner" aria-hidden="true" /> Loading
      notifications…
      {Array.from({ length: 3 }, (_, index) => (
        <article className="notification" key={index}>
          <i />
          <i />
          <i />
        </article>
      ))}
    </div>
  );
}
function DashboardSkeleton() {
  return (
    <div
      className="dashboard dashboard-skeleton"
      role="status"
      aria-label="Loading dashboard"
    >
      <div className="dashboard-intro">
        <span className="loading-spinner" aria-hidden="true" />
        <p>Loading dashboard...</p>
        <i />
        <i />
      </div>
      <div className="cards">
        {Array.from({ length: 4 }, (_, index) => (
          <article className="card" key={index}>
            <i />
            <i />
            <i />
          </article>
        ))}
      </div>
      <section className="panel">
        <i />
        <i />
        <i />
        <i />
      </section>
    </div>
  );
}
function ApplicationDetailSkeleton() {
  return (
    <div
      className="application-detail detail-skeleton"
      role="status"
      aria-label="Loading application"
    >
      <span className="loading-spinner" aria-hidden="true" /> Loading
      application...
      <div />
      <div />
      <section />
      <section />
    </div>
  );
}
export function Dashboard({ admin = false }) {
  const [d, setD] = useState(null),
    [loadError, setLoadError] = useState("");
  const loadDashboard = () => {
    setLoadError("");
    api
      .get("/dashboard")
      .then((r) => setD(r.data))
      .catch((error) =>
        setLoadError(
          error.response?.data?.message || "Could not load the dashboard.",
        ),
      );
  };
  useEffect(() => {
    loadDashboard();
  }, []);
  if (loadError)
    return (
      <div className="center">
        <p>{loadError}</p>
        <button type="button" onClick={loadDashboard}>
          Try again
        </button>
      </div>
    );
  if (!d) return <DashboardSkeleton />;
  const applicationPath = admin ? "/admin/applications" : "/applications";
  const cards = admin
    ? [
        ["Candidates", d.totalCandidates, "/admin/insights/candidates"],
        ["Applications", d.totalApplications, "/admin/insights/applications"],
        ["Today", d.today, "/admin/insights/today"],
        ["Pending", d.pending, "/admin/insights/pending"],
        ["Active jobs", d.activeJobs, "/admin/insights/active-jobs"],
        ["Interviews", d.interviews, "/admin/insights/interviews"],
      ]
    : [
        ["Applications", d.totalApplications, applicationPath],
        ["Pending", d.pending, `${applicationPath}?group=pending`],
        ["Rejected", d.rejected, `${applicationPath}?status=Rejected`],
        [
          "Interviews",
          d.interviews,
          `${applicationPath}?status=Interview%20Scheduled`,
        ],
      ];
  return (
    <div className="dashboard">
      <div className="dashboard-intro">
        <div>
          <p className="dashboard-kicker">
            {admin ? "HR OVERVIEW" : "YOUR RECRUITMENT HUB"}
          </p>
          <h2>
            {admin
              ? "Talent pipeline at a glance"
              : "Keep your opportunities moving"}
          </h2>
          <p>
            {admin
              ? "Monitor applications, hiring activity, and open roles from one place."
              : "Track each referral application and stay prepared for every next step."}
          </p>
        </div>
        <div className="dashboard-orb">
          <span>{admin ? "HR" : "IS"}</span>
        </div>
      </div>
      <div className="cards">
        {cards.map(([x, y, to]) => (
          <Link className="card dashboard-card" to={to} key={x}>
            <small>{x}</small>
            <strong>{y}</strong>
            <span>View details →</span>
          </Link>
        ))}
      </div>
      <section className="panel dashboard-activity">
        <div className="section-heading">
          <div>
            <p>LIVE UPDATES</p>
            <h2>Recent activity</h2>
          </div>
          <span>Updated just now</span>
        </div>
        {d.recent.length ? (
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Job</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {d.recent.map((a) => (
                <tr key={a._id}>
                  <td>{a.applicationId}</td>
                  <td>{a.job?.title}</td>
                  <td>
                    <span className={statusClass(a.status)}>{a.status}</span>
                  </td>
                  <td>{new Date(a.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No activity yet.</p>
        )}
      </section>
    </div>
  );
}

export function Profile() {
  const { user, setUser } = useAuth(),
    [f, setF] = useState({ name: user.name, phone: user.phone || "" }),
    [message, setMessage] = useState("");
  return (
    <section className="panel profile-panel">
      <div className="profile-heading">
        <div className="profile-monogram">{user.name[0]}</div>
        <div>
          <h2>Profile settings</h2>
          <p>Manage your account information.</p>
        </div>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await api.patch("/profile", f);
          setUser(r.data.user);
          setMessage("Profile updated");
        }}
      >
        <label>
          Name
          <input
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        </label>
        <label>
          Email
          <input value={user.email} disabled />
        </label>
        <label>
          Phone
          <input
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value })}
          />
        </label>
        <div className="profile-actions">
          <button>Save changes</button>
          {message && <p className="success">{message}</p>}
        </div>
      </form>
    </section>
  );
}
export function Notifications() {
  const [rows, setRows] = useState([]),
    [page, setPage] = useState(1),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/notifications")
      .then((r) => setRows(r.data.notifications))
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load notifications."),
      )
      .finally(() => setLoading(false));
  }, []);
  const pages = Math.ceil(rows.length / PAGE_SIZE),
    shown = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <section className="panel">
      <h2>Notifications</h2>
      {loading ? (
        <NotificationSkeleton />
      ) : (
        <>
          {shown.map((n) => (
            <article
              className={`notification ${n.read ? "" : "unread"}`}
              key={n._id}
            >
              <strong>{n.title}</strong>
              <p>{n.message}</p>
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </article>
          ))}
          {error ? (
            <p className="error table-state">{error}</p>
          ) : (
            !rows.length && <p>No notifications yet.</p>
          )}
          <Pagination
            page={page}
            pages={pages}
            total={rows.length}
            onChange={setPage}
          />
        </>
      )}
    </section>
  );
}
export function Candidates() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async (pageToLoad = page) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/candidates", {
        params: { search, page: pageToLoad, limit: PAGE_SIZE },
      });
      setRows(data.candidates);
      setMeta({ total: data.total, pages: data.pages });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not load candidates.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [page]);
  return (
    <section className="panel">
      <div className="page-actions">
        <div>
          <h2>Candidates</h2>
          <p>Review registered candidates and their contact details.</p>
        </div>
        <div>
          <input
            value={search}
            placeholder="Search candidates"
            onChange={(event) => setSearch(event.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              setPage(1);
              load(1);
            }}
          >
            Search
          </button>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <TableSkeleton columns={5} />
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Phone</th>
                <th>Account status</th>
                <th>Joined</th>
                <th>Last sign-in</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((candidate) => (
                <tr key={candidate._id}>
                  <td>
                    {candidate.name}
                    <small>{candidate.email}</small>
                  </td>
                  <td>{candidate.phone || "Not provided"}</td>
                  <td>
                    <span
                      className={`badge ${candidate.status === "active" ? "selected" : "rejected"}`}
                    >
                      {candidate.status}
                    </span>
                  </td>
                  <td>{new Date(candidate.createdAt).toLocaleDateString()}</td>
                  <td>
                    {candidate.lastLogin
                      ? new Date(candidate.lastLogin).toLocaleDateString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && !error && (
            <p className="table-state">No candidates found.</p>
          )}
          <Pagination
            page={page}
            pages={meta.pages}
            total={meta.total}
            onChange={setPage}
          />
        </>
      )}
    </section>
  );
}
export function UserManagement() {
  const [users, setUsers] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [updating, setUpdating] = useState(""),
    [page, setPage] = useState(1);
  const load = () => {
    setLoading(true);
    setError("");
    return api
      .get("/users")
      .then((r) => setUsers(r.data.users))
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load HR admins"),
      )
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);
  const changeStatus = async (user) => {
    setUpdating(user._id);
    setError("");
    try {
      const status = user.status === "active" ? "inactive" : "active";
      const r = await api.patch(`/users/${user._id}/status`, { status });
      setUsers(
        users.map((u) =>
          u._id === user._id ? { ...u, ...r.data.user, _id: u._id } : u,
        ),
      );
    } catch (e) {
      setError(e.response?.data?.message || "Could not update account");
    } finally {
      setUpdating("");
    }
  };
  const date = (value) => (value ? new Date(value).toLocaleString() : "Never"),
    pages = Math.ceil(users.length / PAGE_SIZE),
    shown = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <section className="panel">
      <div className="page-actions">
        <div>
          <h2>HR admin monitoring</h2>
          <p>Review access and activity for every HR administrator.</p>
        </div>
      </div>
      {loading ? (
        <TableSkeleton columns={7} />
      ) : (
        <>
          {error && <p className="error table-state">{error}</p>}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Last sign-in</th>
                <th>Jobs</th>
                <th>HR actions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u._id}>
                  <td>
                    {u.name}
                    <small>{new Date(u.createdAt).toLocaleDateString()}</small>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`badge ${u.status === "active" ? "selected" : "rejected"}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>{date(u.lastLogin)}</td>
                  <td>{u.jobsCreated}</td>
                  <td>
                    {u.actionsTaken}
                    <small>{date(u.lastActivity)}</small>
                  </td>
                  <td>
                    <button
                      disabled={updating === u._id}
                      onClick={() => changeStatus(u)}
                    >
                      {updating === u._id
                        ? "Updating..."
                        : u.status === "active"
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && !error && <p>No HR admin accounts found.</p>}
          <Pagination
            page={page}
            pages={pages}
            total={users.length}
            onChange={setPage}
          />
        </>
      )}
    </section>
  );
}
export function CreateAdmin() {
  const [form, setForm] = useState({
      name: "",
      email: "",
      phone: "",
      password: "",
    }),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/users/admins", form);
      setForm({ name: "", email: "", phone: "", password: "" });
      setMessage(
        "HR admin created. Activate the account from HR Admins before sign-in.",
      );
    } catch (e) {
      setError(e.response?.data?.message || "Could not create HR admin");
    }
  };
  return (
    <section className="panel">
      <div className="page-actions">
        <div>
          <h2>Create HR admin</h2>
          <p>
            New HR admin accounts require Super Admin approval before they can
            sign in.
          </p>
        </div>
      </div>
      <form className="form-grid" onSubmit={submit}>
        <label>
          Full name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Phone
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            required
            minLength="8"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <div>
          <button>Create HR admin</button>
        </div>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}
export function ApplicationDetails() {
  const id = location.pathname.split("/").pop();
  const nav = useNavigate();
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get(`/applications/${id}`)
      .then((r) => {
        setApp(r.data.application);
        setStatus(r.data.application.status);
      })
      .catch(() => setError("Could not load this application."));
  }, [id]);
  if (error && !app) return <div className="center">{error}</div>;
  if (!app) return <ApplicationDetailSkeleton />;
  const candidateName = app.candidate?.name || "Candidate unavailable";
  const initials = candidateName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const resumeUrl =
    app.resume?.path &&
    `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/uploads/${app.resume.path}`;
  const updateStatus = async () => {
    setSaving(true);
    setError("");
    try {
      const r = await api.patch(`/applications/${id}/status`, {
        status,
        remarks: remarks || "Updated from HR portal",
      });
      setApp(r.data.application);
      setStatus(r.data.application.status);
      setRemarks("");
    } catch (e) {
      setError(
        e.response?.data?.message || "Could not update application status.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="application-detail">
      <div className="application-topbar">
        <button className="back-link" type="button" onClick={() => nav(-1)}>
          ← Back to applications
        </button>
        <span className="application-id">
          Application · {app.applicationId}
        </span>
      </div>
      <div className="application-hero">
        <div className="candidate-avatar">{initials}</div>
        <div className="application-title">
          <p>APPLICATION REVIEW</p>
          <h2>{candidateName}</h2>
          <span>
            {app.job?.title || "Job unavailable"} <i>·</i>{" "}
            {app.job?.department || "Department unavailable"}
          </span>
        </div>
        <span className={statusClass(app.status)}>{app.status}</span>
      </div>
      <div className="application-layout">
        <div className="application-main">
          <article className="detail-card">
            <div className="detail-heading">
              <div>
                <p>CANDIDATE</p>
                <h3>Contact details</h3>
              </div>
              {resumeUrl && (
                <a
                  className="resume-link"
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View resume ↗
                </a>
              )}
            </div>
            <div className="contact-grid">
              <div>
                <small>Email address</small>
                <a href={`mailto:${app.candidate?.email}`}>
                  {app.candidate?.email || "No email available"}
                </a>
              </div>
              <div>
                <small>Phone number</small>
                <span>{app.candidate?.phone || "No phone available"}</span>
              </div>
            </div>
          </article>
          <article className="detail-card">
            <div className="detail-heading">
              <div>
                <p>REFERRAL</p>
                <h3>Referred by</h3>
              </div>
            </div>
            <div className="referral-person">
              <div className="referral-avatar">
                {(app.referral?.employeeName || "R")[0]}
              </div>
              <div>
                <strong>
                  {app.referral?.employeeName || "Referral unavailable"}
                </strong>
                <span>
                  {app.referral?.employeeId || "No employee ID"}{" "}
                  {app.referral?.department && `· ${app.referral.department}`}
                </span>
                <a href={`mailto:${app.referral?.employeeEmail}`}>
                  {app.referral?.employeeEmail || "No email available"}
                </a>
              </div>
            </div>
            <div className="contact-grid referral-facts">
              <div>
                <small>Candidate contact</small>
                <span>{app.referral?.candidateContact || "Not provided"}</span>
              </div>
              <div>
                <small>Relationship</small>
                <span>
                  {app.referral?.candidateRelationship ||
                    app.referral?.relationship ||
                    "Not provided"}
                </span>
              </div>
              <div>
                <small>Known for</small>
                <span>{app.referral?.durationKnown || "Not provided"}</span>
              </div>
              <div>
                <small>Worked directly</small>
                <span>{app.referral?.workedDirectly || "Not provided"}</span>
              </div>
              <div>
                <small>Experience</small>
                <span>
                  {app.referral?.candidateExperienceLevel || "Not provided"}
                </span>
              </div>
              <div>
                <small>Designation</small>
                <span>{app.referral?.designation || "Not provided"}</span>
              </div>
              <div>
                <small>Referral date</small>
                <span>
                  {app.referral?.createdAt
                    ? new Date(app.referral.createdAt).toLocaleString()
                    : "Captured on submission"}
                </span>
              </div>
            </div>
          </article>
          {(app.coverLetter || app.additionalNotes) && (
            <article className="detail-card">
              <div className="detail-heading">
                <div>
                  <p>APPLICATION</p>
                  <h3>Candidate notes</h3>
                </div>
              </div>
              {app.coverLetter && (
                <div className="note-block">
                  <small>Cover letter</small>
                  <p>{app.coverLetter}</p>
                </div>
              )}
              {app.additionalNotes && (
                <div className="note-block">
                  <small>Additional notes</small>
                  <p>{app.additionalNotes}</p>
                </div>
              )}
            </article>
          )}
        </div>
        <aside className="application-sidebar">
          {user.role === "admin" && (
            <article className="status-editor">
              <p>HR ACTION</p>
              <h3>Move application forward</h3>
              <label>
                Application status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {[
                    "Applied",
                    "Resume Under Review",
                    "Interview Scheduled",
                    "Technical Round",
                    "HR Round",
                    "Selected",
                    "Rejected",
                    "Offer Released",
                    "Joined",
                  ].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Remarks <span>(optional)</span>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add a note for this update"
                />
              </label>
              <button type="button" onClick={updateStatus} disabled={saving}>
                {saving ? "Saving..." : "Update status"}
              </button>
              {error && <small className="error">{error}</small>}
            </article>
          )}
          <article className="timeline-card">
            <div className="detail-heading">
              <div>
                <p>ACTIVITY</p>
                <h3>Status history</h3>
              </div>
            </div>
            <div className="timeline">
              {app.statusHistory?.length ? (
                app.statusHistory
                  .slice()
                  .reverse()
                  .map((history, index) => (
                    <div
                      className="timeline-item"
                      key={`${history.status}-${index}`}
                    >
                      <span className="timeline-dot" />
                      <div>
                        <strong>{history.status}</strong>
                        {history.remarks && <p>{history.remarks}</p>}
                        <small>
                          {history.changedAt
                            ? new Date(history.changedAt).toLocaleString()
                            : index === app.statusHistory.length - 1
                              ? new Date(app.createdAt).toLocaleString()
                              : ""}
                        </small>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="empty-history">No status updates yet.</p>
              )}
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
export function AccessDenied() {
  return (
    <div className="center">
      <h1>Access denied</h1>
      <p>You don’t have permission to view this page.</p>
      <Link to="/dashboard">Return to dashboard</Link>
    </div>
  );
}
export function ReferralPolicy() {
  return (
    <section className="panel page-scroll-panel policy-panel">
      <p className="section-label">EMPLOYEE REFERRAL POLICY</p>
      <h2>Referral policy</h2>
      <p>
        Referrals should be submitted with the candidate's consent and accurate
        contact details.
      </p>
      <ul>
        <li>Do not submit the same candidate more than once.</li>
        <li>
          Keep candidate information confidential and use it only for
          recruitment.
        </li>
        <li>Declare your relationship with the candidate honestly.</li>
        <li>Recruitment status updates are managed by the hiring team.</li>
      </ul>
      <Link className="button" to="/jobs">
        Back to open jobs
      </Link>
    </section>
  );
}
export function Jobs({ admin = false, onlyActive = false }) {
  const location = useLocation();
  const requestedStatus = new URLSearchParams(location.search).get("status");
  const [jobs, setJobs] = useState([]),
    [form, setForm] = useState(null),
    [search, setSearch] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [page, setPage] = useState(1);
  const load = async (searchTerm = search) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/jobs", {
        params: { search: searchTerm },
      });
      setJobs(response.data.jobs);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load jobs.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    try {
      form._id
        ? await api.patch(`/jobs/${form._id}`, form)
        : await api.post("/jobs", form);
      setForm(null);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not save job");
    }
  };
  if (form)
    return (
      <section className="panel page-scroll-panel">
        <h2>{form._id ? "Edit" : "Create"} job</h2>
        <form className="form-grid" onSubmit={submit}>
          {[
            ["jobId", "Job ID"],
            ["title", "Title"],
            ["clientName", "Client name"],
            ["projectName", "Project name"],
            ["department", "Department"],
            ["location", "Location"],
          ].map(([k, l]) => (
            <label key={k}>
              {l}
              <input
                required
                value={form[k] || ""}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </label>
          ))}
          <label className="md:col-span-2">
            Job description
            <textarea
              required
              value={form.description || ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe the role, responsibilities, and required skills"
            />
          </label>
          <label>
            Experience level
            <input
              required
              value={form.experienceLevel || ""}
              onChange={(e) =>
                setForm({ ...form, experienceLevel: e.target.value })
              }
              placeholder="e.g. 3-5 years"
            />
          </label>
          <label>
            Number of openings
            <input
              required
              type="number"
              min="1"
              value={form.openings || 1}
              onChange={(e) =>
                setForm({ ...form, openings: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Priority
            <select
              value={form.priority || "Medium"}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
          <label>
            Work mode
            <select
              value={form.workMode || "Onsite"}
              onChange={(e) => setForm({ ...form, workMode: e.target.value })}
            >
              <option>Onsite</option>
              <option>WFO</option>
              <option>WFH</option>
            </select>
          </label>
          <label>
            Employment type
            <select
              value={form.employmentType || "Full-time"}
              onChange={(e) =>
                setForm({ ...form, employmentType: e.target.value })
              }
            >
              <option>Full-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </label>
          <label>
            Status
            <select
              value={form.status || "active"}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </label>
          <div>
            <button>Save job</button>
            <button
              type="button"
              className="secondary"
              onClick={() => setForm(null)}
            >
              Cancel
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      </section>
    );
  const visibleJobs = jobs.filter(
    (j) =>
      (admin || j.status === "active") &&
      (!requestedStatus || j.status === requestedStatus) &&
      (!onlyActive || j.status === "active"),
  );
  const pages = Math.ceil(visibleJobs.length / PAGE_SIZE);
  const shownJobs = visibleJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <section className="page-scroll jobs-panel">
      <div className="page-actions">
        <div>
          <h2>{admin ? "Manage Jobs" : "Open Positions"}</h2>
          <p>
            {requestedStatus === "active" || onlyActive
              ? "Showing active roles."
              : "Explore roles and referral opportunities."}
          </p>
        </div>
        <div className="application-page-controls">
          <input
            value={search}
            placeholder="Search jobs"
            onChange={(event) => setSearch(event.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              setPage(1);
              load(search);
            }}
          >
            Search
          </button>
          {admin && <button onClick={() => setForm({})}>Create job</button>}
        </div>
      </div>
      <div className="page-scroll-content">
        {loading ? (
          <JobSkeleton />
        ) : (
          <>
            <div className="job-grid">
              {shownJobs.map((j) => (
                <article className="job" key={j._id}>
                  <span>{j.department}</span>
                  <h2>{j.title}</h2>
                  {admin && (
                    <div className="mb-4 grid gap-1 text-[12px] font-semibold text-[#39709f]">
                      <span>Client: {j.clientName || "Not specified"}</span>
                      <span>Project: {j.projectName || "Not specified"}</span>
                      <span>
                        Openings: {j.openings || 1} · {j.workMode || "Onsite"}
                      </span>
                      <span>
                        Priority: {j.priority || "Medium"} · Experience:{" "}
                        {j.experienceLevel || "Not specified"}
                      </span>
                    </div>
                  )}
                  <p>
                    {j.location} · {j.employmentType}
                  </p>
                  <p>{j.description}</p>
                  {admin ? (
                    <div>
                      <button onClick={() => setForm(j)}>Edit</button>
                      <button
                        className="danger"
                        onClick={async () => {
                          if (confirm("Delete this job?")) {
                            await api.delete(`/jobs/${j._id}`);
                            load();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <Link className="button" to={`/apply/${j._id}`}>
                      Apply with referral
                    </Link>
                  )}
                </article>
              ))}
            </div>
            {!visibleJobs.length && !error && <p>No positions found.</p>}
            {error && <p className="error table-state">{error}</p>}
            <Pagination
              page={page}
              pages={pages}
              total={visibleJobs.length}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </section>
  );
}
export function Apply() {
  const nav = useNavigate(),
    [jobs, setJobs] = useState([]),
    [jobsLoading, setJobsLoading] = useState(true),
    [jobsError, setJobsError] = useState(""),
    [file, setFile] = useState(),
    [msg, setMsg] = useState(""),
    [submitting, setSubmitting] = useState(false),
    [f, setF] = useState({
      job: "",
      employeeName: "",
      employeeId: "",
      employeeEmail: "",
      department: "",
      relationship: "",
      candidateContact: "",
      candidateRelationship: "",
      durationKnown: "",
      workedDirectly: "",
      candidateExperienceLevel: "",
      designation: "",
      remarks: "",
      coverLetter: "",
      additionalNotes: "",
    });
  useEffect(() => {
    api
      .get("/jobs?status=active")
      .then((r) => setJobs(r.data.jobs))
      .catch((error) =>
        setJobsError(
          error.response?.data?.message || "Could not load open positions.",
        ),
      )
      .finally(() => setJobsLoading(false));
  }, []);
  const set = (k, v) => setF({ ...f, [k]: v });
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const checkDuplicate = async () => {
    if (!f.candidateContact || !f.job) return false;
    setCheckingDuplicate(true);
    setDuplicateMessage("");
    try {
      const { data } = await api.get("/applications/check-duplicate", {
        params: { candidateContact: f.candidateContact, job: f.job },
      });
      if (data.referralExists) {
        setDuplicateMessage(
          data.applicationStatus
            ? `This candidate already has an application (${data.applicationStatus}).`
            : "This candidate has already been referred.",
        );
        return true;
      }
      if (data.candidateExists) {
        setDuplicateMessage(
          "A candidate with this contact already exists in the system.",
        );
        return true;
      }
      return false;
    } catch (error) {
      setDuplicateMessage(
        error.response?.data?.message ||
          "Could not check for duplicate candidates.",
      );
      return true;
    } finally {
      setCheckingDuplicate(false);
    }
  };
  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMsg("");
    if (
      !/^(?:[^\s@]+@[^\s@]+\.[^\s@]+|\+?[\d\s().-]{7,})$/.test(
        f.candidateContact.trim(),
      )
    ) {
      setMsg("Enter a valid candidate phone number or email address.");
      setSubmitting(false);
      return;
    }
    if (await checkDuplicate()) {
      setSubmitting(false);
      return;
    }
    const d = new FormData();
    d.append("job", f.job);
    d.append("resume", file);
    d.append("coverLetter", f.coverLetter);
    d.append("additionalNotes", f.additionalNotes);
    d.append(
      "referral",
      JSON.stringify(
        Object.fromEntries(
          Object.entries({
            ...f,
            relationship: f.candidateRelationship,
          }).filter(
            ([k]) => !["job", "coverLetter", "additionalNotes"].includes(k),
          ),
        ),
      ),
    );
    try {
      await api.post("/applications", d);
      nav("/applications");
    } catch (e) {
      setMsg(e.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <section className="panel page-scroll-panel">
      <div className="form-intro">
        <p className="section-label">EMPLOYEE REFERRAL</p>
        <h2>Submit referral application</h2>
        <p>
          Share a strong candidate with the hiring team. Referral date and
          status are captured automatically.
        </p>
      </div>
      <form className="form-grid" onSubmit={submit}>
        <div className="form-section-heading">Job details</div>
        <label>
          Open position
          <select
            required
            value={f.job}
            disabled={jobsLoading || Boolean(jobsError)}
            onChange={(e) => set("job", e.target.value)}
          >
            <option value="">
              {jobsLoading
                ? "Loading open positions..."
                : jobsError
                  ? "Positions unavailable"
                  : "Select role"}
            </option>
            {jobs.map((j) => (
              <option value={j._id} key={j._id}>
                {j.jobId} — {j.title}
              </option>
            ))}
          </select>
          {jobsError && <small className="error">{jobsError}</small>}
        </label>
        {[
          ["employeeName", "Employee name"],
          ["employeeId", "Employee ID"],
          ["employeeEmail", "Employee email"],
          ["department", "Employee department"],
        ].map(([k, l]) => (
          <label key={k}>
            {l}
            <input
              required={k !== "remarks"}
              value={f[k]}
              onChange={(e) => set(k, e.target.value)}
            />
          </label>
        ))}
        <div className="form-section-heading">Candidate details</div>
        <label>
          Candidate phone number or email
          <input
            required
            value={f.candidateContact}
            onChange={(e) => set("candidateContact", e.target.value)}
            onBlur={checkDuplicate}
            placeholder="name@example.com or +91 98765 43210"
          />
          <small>Enter either a valid phone number or email address.</small>
        </label>
        <label>
          Candidate relationship
          <select
            required
            value={f.candidateRelationship}
            onChange={(e) => set("candidateRelationship", e.target.value)}
          >
            <option value="">Select relationship</option>
            <option>Ex-colleague</option>
            <option>Friend</option>
            <option>Family</option>
            <option>Classmate</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          Duration known
          <select
            required
            value={f.durationKnown}
            onChange={(e) => set("durationKnown", e.target.value)}
          >
            <option value="">Select duration</option>
            <option>Less than 1 year</option>
            <option>1-3 years</option>
            <option>3-5 years</option>
            <option>More than 5 years</option>
          </select>
        </label>
        <label>
          Worked directly
          <select
            required
            value={f.workedDirectly}
            onChange={(e) => set("workedDirectly", e.target.value)}
          >
            <option value="">Select one</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>
        <label>
          Candidate experience level
          <input
            required
            value={f.candidateExperienceLevel}
            onChange={(e) => set("candidateExperienceLevel", e.target.value)}
            placeholder="e.g. Senior software engineer"
          />
        </label>
        <label>
          Designation / job title
          <input
            required
            value={f.designation}
            onChange={(e) => set("designation", e.target.value)}
          />
        </label>
        <label>
          Referral date & time
          <input value="Captured automatically on submission" readOnly />
        </label>
        <label>
          Referral status
          <input value="Applied - tracked by recruitment workflow" readOnly />
        </label>
        {duplicateMessage && (
          <p className="error form-section-wide">{duplicateMessage}</p>
        )}
        <div className="form-section-heading">Supporting information</div>
        <label>
          Resume (PDF/DOC/DOCX, max 5MB)
          <input
            required
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
        <label>
          Cover letter
          <textarea
            value={f.coverLetter}
            onChange={(e) => set("coverLetter", e.target.value)}
          />
        </label>
        <label>
          Referral remarks
          <textarea
            value={f.remarks}
            onChange={(e) => set("remarks", e.target.value)}
            placeholder="Add context for the hiring team"
          />
        </label>
        <label className="check">
          <input required type="checkbox" />
          <span>
            <strong>Declaration</strong>
            <span>
              I confirm that the information provided is accurate and follows
              the <a href="/referral-policy">employee referral policy</a>.
            </span>
          </span>
        </label>
        <div>
          <button disabled={submitting || checkingDuplicate}>
            {submitting
              ? "Submitting..."
              : checkingDuplicate
                ? "Checking..."
                : "Submit application"}
          </button>
        </div>
        {msg && <p className="error">{msg}</p>}
      </form>
    </section>
  );
}
export function Applications({ admin = false, insight }) {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const insights = {
    candidates: {
      title: "Candidates",
      description: "Candidate applications and contact details.",
    },
    applications: {
      title: "All Applications",
      description: "Every application in the hiring pipeline.",
    },
    today: {
      title: "Today's Applications",
      description: "Applications submitted today.",
      period: "today",
    },
    pending: {
      title: "Pending Applications",
      description: "Applications awaiting a hiring decision.",
      group: "pending",
    },
    interviews: {
      title: "Interview Applications",
      description: "Candidates with an interview scheduled.",
      status: "Interview Scheduled",
    },
  };
  const activeInsight = insights[insight];
  const [rows, setRows] = useState([]),
    [status, setStatus] = useState(
      activeInsight?.status || query.get("status") || "",
    ),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [pages, setPages] = useState(0),
    [loading, setLoading] = useState(true),
    [exporting, setExporting] = useState(false),
    [exportError, setExportError] = useState(""),
    [loadError, setLoadError] = useState("");
  const load = async (pageToLoad = page) => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await api.get("/applications", {
        params: {
          status,
          search,
          period: activeInsight?.period || query.get("period") || "",
          group: activeInsight?.group || query.get("group") || "",
          page: pageToLoad,
          limit: PAGE_SIZE,
        },
      });
      setRows(response.data.applications);
      setTotal(response.data.total);
      setPages(response.data.pages);
    } catch (requestError) {
      setLoadError(
        requestError.response?.data?.message || "Could not load applications.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setStatus(activeInsight?.status || query.get("status") || "");
    setPage(1);
  }, [location.search, insight]);
  useEffect(() => {
    load();
  }, [status, page, location.search]);
  const exportDetails = async () => {
    setExporting(true);
    setExportError("");
    try {
      const { data } = await api.get("/applications", {
        params: { limit: 10000 },
      });
      const date = (value) => (value ? new Date(value).toLocaleString() : "");
      downloadCsv(
        `hr-application-details-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          "Application ID",
          "Candidate Name",
          "Candidate Email",
          "Candidate Phone",
          "Job ID",
          "Job Title",
          "Department",
          "Location",
          "Referral Employee",
          "Referral Employee ID",
          "Referral Email",
          "Referral Department",
          "Relationship",
          "Candidate Contact",
          "Candidate Relationship",
          "Duration Known",
          "Worked Directly",
          "Candidate Experience",
          "Designation",
          "Referral Date",
          "Status",
          "HR Remarks",
          "Internal Notes",
          "Cover Letter",
          "Additional Notes",
          "Resume File",
          "Created At",
          "Last Updated",
        ],
        data.applications.map((application) => [
          application.applicationId,
          application.candidate?.name,
          application.candidate?.email,
          application.candidate?.phone,
          application.job?.jobId,
          application.job?.title,
          application.job?.department,
          application.job?.location,
          application.referral?.employeeName,
          application.referral?.employeeId,
          application.referral?.employeeEmail,
          application.referral?.department,
          application.referral?.relationship,
          application.referral?.candidateContact,
          application.referral?.candidateRelationship,
          application.referral?.durationKnown,
          application.referral?.workedDirectly,
          application.referral?.candidateExperienceLevel,
          application.referral?.designation,
          date(application.referral?.createdAt),
          application.status,
          application.hrRemarks,
          application.internalNotes,
          application.coverLetter,
          application.additionalNotes,
          application.resume?.originalName,
          date(application.createdAt),
          date(application.updatedAt),
        ]),
      );
    } catch (error) {
      setExportError(
        error.response?.data?.message || "Could not export application details",
      );
    } finally {
      setExporting(false);
    }
  };
  return (
    <section className="panel applications-panel">
      <div className="page-actions">
        <div>
          <h2>
            {activeInsight?.title ||
              (admin ? "All Applications" : "My Applications")}
          </h2>
          {activeInsight?.description && <p>{activeInsight.description}</p>}
          {query.get("period") === "today" && (
            <p>Applications submitted today</p>
          )}
          {query.get("group") === "pending" && (
            <p>Applications awaiting a hiring decision</p>
          )}
          {query.get("view") === "candidates" && (
            <p>Candidate applications and contact details</p>
          )}
        </div>
        <div className="application-page-controls">
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {[
              "Applied",
              "Resume Under Review",
              "Interview Scheduled",
              "Technical Round",
              "HR Round",
              "Selected",
              "Rejected",
              "Offer Released",
              "Joined",
              "Withdrawn",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setPage(1);
              load(1);
            }}
          >
            Search
          </button>
          {admin && (
            <button type="button" onClick={exportDetails} disabled={exporting}>
              {exporting ? "Exporting..." : "Export details"}
            </button>
          )}
        </div>
      </div>
      <div className="panel-content-scroll">
        {exportError && <p className="error">{exportError}</p>}
        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Referral</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a._id}>
                    <td>
                      {a.candidate?.name || "Candidate unavailable"}
                      <small>
                        {a.candidate?.email || "No email available"}
                      </small>
                    </td>
                    <td>{a.job?.title || "Job unavailable"}</td>
                    <td>
                      {a.referral?.employeeName || "Referral unavailable"}
                    </td>
                    <td>
                      <span className={statusClass(a.status)}>{a.status}</span>
                    </td>
                    <td>
                      {a.createdAt
                        ? new Date(a.createdAt).toLocaleDateString(undefined, {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td>
                      <Link
                        to={`${admin ? "/admin/applications" : "/applications"}/${a._id}`}
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && !loadError && <p>No applications found.</p>}
            {loadError && <p className="error table-state">{loadError}</p>}
            <Pagination
              page={page}
              pages={pages}
              total={total}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </section>
  );
}
