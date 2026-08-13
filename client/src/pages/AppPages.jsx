import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
const statusClass = (s) => `badge ${s?.toLowerCase().replaceAll(" ", "-")}`;
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
const PAGE_SIZE = 8;
function Pagination({ page, pages, total, onChange }) {
  if (pages <= 1) return total ? <p className="pagination-summary">Showing {total} result{total === 1 ? '' : 's'}</p> : null;
  const numbers = Array.from({ length: pages }, (_, index) => index + 1).filter((number) => number === 1 || number === pages || Math.abs(number - page) <= 1);
  return <div className="pagination"><span>Page {page} of {pages} · {total} results</span><div><button type="button" aria-label="Previous page" onClick={() => onChange(page - 1)} disabled={page === 1}>←</button>{numbers.map((number, index) => <React.Fragment key={number}>{index > 0 && numbers[index - 1] !== number - 1 && <i>…</i>}<button type="button" className={number === page ? 'active' : ''} onClick={() => onChange(number)}>{number}</button></React.Fragment>)}<button type="button" aria-label="Next page" onClick={() => onChange(page + 1)} disabled={page === pages}>→</button></div></div>;
}
export function Dashboard({ admin = false }) {
  const [d, setD] = useState(null), [exporting, setExporting] = useState(false), [exportError, setExportError] = useState("");
  useEffect(() => {
    api.get("/dashboard").then((r) => setD(r.data));
  }, []);
  if (!d) return <div className="center">Loading dashboard…</div>;
  const cards = admin
    ? [
        ["Candidates", d.totalCandidates],
        ["Applications", d.totalApplications],
        ["Today", d.today],
        ["Pending", d.pending],
        ["Active jobs", d.activeJobs],
        ["Interviews", d.interviews],
      ]
    : [
        ["Applications", d.totalApplications],
        ["Pending", d.pending],
        ["Rejected", d.rejected],
        ["Interviews", d.interviews],
      ];
  const exportDetails = async () => {
    setExporting(true);
    setExportError("");
    try {
      const { data } = await api.get("/applications", { params: { limit: 10000 } });
      const date = (value) => (value ? new Date(value).toLocaleString() : "");
      downloadCsv(
        `hr-application-details-${new Date().toISOString().slice(0, 10)}.csv`,
        ["Application ID", "Candidate Name", "Candidate Email", "Candidate Phone", "Job ID", "Job Title", "Department", "Location", "Referral Employee", "Referral Employee ID", "Referral Email", "Referral Department", "Relationship", "Status", "HR Remarks", "Internal Notes", "Cover Letter", "Additional Notes", "Resume File", "Created At", "Last Updated"],
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
      setExportError(error.response?.data?.message || "Could not export application details");
    } finally {
      setExporting(false);
    }
  };
  return (
    <div className="dashboard">
      <div className="dashboard-intro">
        <div><p className="dashboard-kicker">{admin ? "HR OVERVIEW" : "YOUR RECRUITMENT HUB"}</p><h2>{admin ? "Talent pipeline at a glance" : "Keep your opportunities moving"}</h2><p>{admin ? "Monitor applications, hiring activity, and open roles from one place." : "Track each referral application and stay prepared for every next step."}</p></div>
        <div className="dashboard-orb"><span>{admin ? "HR" : "IS"}</span></div>
      </div>
      <div className="cards">
        {cards.map(([x, y]) => (
          <article className="card" key={x}>
            <small>{x}</small>
            <strong>{y}</strong>
          </article>
        ))}
      </div>
      <section className="panel dashboard-activity">
        <div className="section-heading"><div><p>LIVE UPDATES</p><h2>Recent activity</h2></div>{admin ? <button type="button" onClick={exportDetails} disabled={exporting}>{exporting ? "Exporting..." : "Export details"}</button> : <span>Updated just now</span>}</div>
        {exportError && <p className="error">{exportError}</p>}
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

export function Profile(){const {user,setUser}=useAuth(),[f,setF]=useState({name:user.name,phone:user.phone||''}),[message,setMessage]=useState('');return <section className="panel profile-panel"><div className="profile-heading"><div className="profile-monogram">{user.name[0]}</div><div><h2>Profile settings</h2><p>Manage your account information.</p></div></div><form onSubmit={async e=>{e.preventDefault();const r=await api.patch('/profile',f);setUser(r.data.user);setMessage('Profile updated')}}><label>Name<input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label><label>Email<input value={user.email} disabled/></label><label>Phone<input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/></label><div className="profile-actions"><button>Save changes</button>{message&&<p className="success">{message}</p>}</div></form></section>}
export function Notifications(){const [rows,setRows]=useState([]),[page,setPage]=useState(1);useEffect(()=>{api.get('/notifications').then(r=>setRows(r.data.notifications))},[]);const pages=Math.ceil(rows.length/PAGE_SIZE),shown=rows.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);return <section className="panel"><h2>Notifications</h2>{shown.map(n=><article className={`notification ${n.read?'':'unread'}`} key={n._id}><strong>{n.title}</strong><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleString()}</small></article>)}{!rows.length&&<p>No notifications yet.</p>}<Pagination page={page} pages={pages} total={rows.length} onChange={setPage}/></section>}
export function UserManagement(){const [users,setUsers]=useState([]),[error,setError]=useState(''),[updating,setUpdating]=useState(''),[page,setPage]=useState(1);const load=()=>api.get('/users').then(r=>setUsers(r.data.users)).catch(e=>setError(e.response?.data?.message||'Could not load HR admins'));useEffect(()=>{load()},[]);const changeStatus=async(user)=>{setUpdating(user._id);setError('');try{const status=user.status==='active'?'inactive':'active';const r=await api.patch(`/users/${user._id}/status`,{status});setUsers(users.map(u=>u._id===user._id?{...u,...r.data.user,_id:u._id}:u))}catch(e){setError(e.response?.data?.message||'Could not update account')}finally{setUpdating('')}};const date=(value)=>value?new Date(value).toLocaleString():'Never',pages=Math.ceil(users.length/PAGE_SIZE),shown=users.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);return <section className="panel"><div className="page-actions"><div><h2>HR admin monitoring</h2><p>Review access and activity for every HR administrator.</p></div></div>{error&&<p className="error">{error}</p>}<table><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Last sign-in</th><th>Jobs</th><th>HR actions</th><th>Action</th></tr></thead><tbody>{shown.map(u=><tr key={u._id}><td>{u.name}<small>{new Date(u.createdAt).toLocaleDateString()}</small></td><td>{u.email}</td><td><span className={`badge ${u.status==='active'?'selected':'rejected'}`}>{u.status}</span></td><td>{date(u.lastLogin)}</td><td>{u.jobsCreated}</td><td>{u.actionsTaken}<small>{date(u.lastActivity)}</small></td><td><button disabled={updating===u._id} onClick={()=>changeStatus(u)}>{updating===u._id?'Updating...':u.status==='active'?'Deactivate':'Activate'}</button></td></tr>)}</tbody></table>{!users.length&&!error&&<p>No HR admin accounts found.</p>}<Pagination page={page} pages={pages} total={users.length} onChange={setPage}/></section>}
export function CreateAdmin(){const [form,setForm]=useState({name:'',email:'',phone:'',password:''}),[message,setMessage]=useState(''),[error,setError]=useState('');const submit=async(e)=>{e.preventDefault();setError('');setMessage('');try{await api.post('/users/admins',form);setForm({name:'',email:'',phone:'',password:''});setMessage('HR admin created. Activate the account from HR Admins before sign-in.')}catch(e){setError(e.response?.data?.message||'Could not create HR admin')}};return <section className="panel"><div className="page-actions"><div><h2>Create HR admin</h2><p>New HR admin accounts require Super Admin approval before they can sign in.</p></div></div><form className="form-grid" onSubmit={submit}><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>Password<input required minLength="8" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><div><button>Create HR admin</button></div></form>{message&&<p className="success">{message}</p>}{error&&<p className="error">{error}</p>}</section>}
export function ApplicationDetails() {
  const id = location.pathname.split('/').pop();
  const nav = useNavigate();
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get(`/applications/${id}`).then((r) => {
      setApp(r.data.application);
      setStatus(r.data.application.status);
    }).catch(() => setError('Could not load this application.'));
  }, [id]);
  if (error && !app) return <div className="center">{error}</div>;
  if (!app) return <div className="center">Loading application...</div>;
  const candidateName = app.candidate?.name || 'Candidate unavailable';
  const initials = candidateName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const resumeUrl = app.resume?.path && `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${app.resume.path}`;
  const updateStatus = async () => {
    setSaving(true); setError('');
    try {
      const r = await api.patch(`/applications/${id}/status`, { status, remarks: remarks || 'Updated from HR portal' });
      setApp(r.data.application); setStatus(r.data.application.status); setRemarks('');
    } catch (e) { setError(e.response?.data?.message || 'Could not update application status.'); }
    finally { setSaving(false); }
  };
  return <section className="application-detail">
    <div className="application-topbar">
      <button className="back-link" type="button" onClick={() => nav(-1)}>← Back to applications</button>
      <span className="application-id">Application · {app.applicationId}</span>
    </div>
    <div className="application-hero">
      <div className="candidate-avatar">{initials}</div>
      <div className="application-title"><p>APPLICATION REVIEW</p><h2>{candidateName}</h2><span>{app.job?.title || 'Job unavailable'} <i>·</i> {app.job?.department || 'Department unavailable'}</span></div>
      <span className={statusClass(app.status)}>{app.status}</span>
    </div>
    <div className="application-layout">
      <div className="application-main">
        <article className="detail-card"><div className="detail-heading"><div><p>CANDIDATE</p><h3>Contact details</h3></div>{resumeUrl && <a className="resume-link" href={resumeUrl} target="_blank" rel="noreferrer">View resume ↗</a>}</div>
          <div className="contact-grid"><div><small>Email address</small><a href={`mailto:${app.candidate?.email}`}>{app.candidate?.email || 'No email available'}</a></div><div><small>Phone number</small><span>{app.candidate?.phone || 'No phone available'}</span></div></div>
        </article>
        <article className="detail-card"><div className="detail-heading"><div><p>REFERRAL</p><h3>Referred by</h3></div></div>
          <div className="referral-person"><div className="referral-avatar">{(app.referral?.employeeName || 'R')[0]}</div><div><strong>{app.referral?.employeeName || 'Referral unavailable'}</strong><span>{app.referral?.employeeId || 'No employee ID'} {app.referral?.department && `· ${app.referral.department}`}</span><a href={`mailto:${app.referral?.employeeEmail}`}>{app.referral?.employeeEmail || 'No email available'}</a></div></div>
        </article>
        {(app.coverLetter || app.additionalNotes) && <article className="detail-card"><div className="detail-heading"><div><p>APPLICATION</p><h3>Candidate notes</h3></div></div>{app.coverLetter && <div className="note-block"><small>Cover letter</small><p>{app.coverLetter}</p></div>}{app.additionalNotes && <div className="note-block"><small>Additional notes</small><p>{app.additionalNotes}</p></div>}</article>}
      </div>
      <aside className="application-sidebar">
        {user.role === 'admin' && <article className="status-editor"><p>HR ACTION</p><h3>Move application forward</h3><label>Application status<select value={status} onChange={(e) => setStatus(e.target.value)}>{['Applied', 'Resume Under Review', 'Interview Scheduled', 'Technical Round', 'HR Round', 'Selected', 'Rejected', 'Offer Released', 'Joined'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Remarks <span>(optional)</span><textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add a note for this update" /></label><button type="button" onClick={updateStatus} disabled={saving}>{saving ? 'Saving...' : 'Update status'}</button>{error && <small className="error">{error}</small>}</article>}
        <article className="timeline-card"><div className="detail-heading"><div><p>ACTIVITY</p><h3>Status history</h3></div></div><div className="timeline">{app.statusHistory?.length ? app.statusHistory.slice().reverse().map((history, index) => <div className="timeline-item" key={`${history.status}-${index}`}><span className="timeline-dot"/><div><strong>{history.status}</strong>{history.remarks && <p>{history.remarks}</p>}<small>{history.changedAt ? new Date(history.changedAt).toLocaleString() : index === app.statusHistory.length - 1 ? new Date(app.createdAt).toLocaleString() : ''}</small></div></div>) : <p className="empty-history">No status updates yet.</p>}</div></article>
      </aside>
    </div>
  </section>
}
export function AccessDenied(){return <div className="center"><h1>Access denied</h1><p>You don’t have permission to view this page.</p><Link to="/dashboard">Return to dashboard</Link></div>}
export function Jobs({ admin = false }) {
  const [jobs, setJobs] = useState([]),
    [form, setForm] = useState(null),
    [error, setError] = useState(""),
    [page, setPage] = useState(1);
  const load = () => api.get("/jobs").then((r) => setJobs(r.data.jobs));
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
      <section className="panel">
        <h2>{form._id ? "Edit" : "Create"} job</h2>
        <form className="form-grid" onSubmit={submit}>
          {[
            ["jobId", "Job ID"],
            ["title", "Title"],
            ["department", "Department"],
            ["location", "Location"],
            ["description", "Description"],
          ].map(([k, l]) => (
            <label key={k}>
              {l}
              {k === "description" ? (
                <textarea
                  required
                  value={form[k] || ""}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              ) : (
                <input
                  required
                  value={form[k] || ""}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              )}
            </label>
          ))}
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
  const visibleJobs = jobs.filter((j) => admin || j.status === "active");
  const pages = Math.ceil(visibleJobs.length / PAGE_SIZE);
  const shownJobs = visibleJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <div className="page-actions">
        <div>
          <h2>{admin ? "Manage Jobs" : "Open Positions"}</h2>
          <p>Explore roles and referral opportunities.</p>
        </div>
        {admin && <button onClick={() => setForm({})}>Create job</button>}
      </div>
      <div className="job-grid">
        {shownJobs.map((j) => (
            <article className="job" key={j._id}>
              <span>{j.department}</span>
              <h2>{j.title}</h2>
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
      {!visibleJobs.length && <p>No positions found.</p>}
      <Pagination page={page} pages={pages} total={visibleJobs.length} onChange={setPage}/>
    </>
  );
}
export function Apply() {
  const nav = useNavigate(),
    [jobs, setJobs] = useState([]),
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
      remarks: "",
      coverLetter: "",
      additionalNotes: "",
    });
  useEffect(() => {
    api.get("/jobs?status=active").then((r) => setJobs(r.data.jobs));
  }, []);
  const set = (k, v) => setF({ ...f, [k]: v });
  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMsg("");
    const d = new FormData();
    d.append("job", f.job);
    d.append("resume", file);
    d.append("coverLetter", f.coverLetter);
    d.append("additionalNotes", f.additionalNotes);
    d.append(
      "referral",
      JSON.stringify(
        Object.fromEntries(
          Object.entries(f).filter(
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
    <section className="panel">
      <h2>Submit referral application</h2>
      <form className="form-grid" onSubmit={submit}>
        <label>
          Open position
          <select
            required
            value={f.job}
            onChange={(e) => set("job", e.target.value)}
          >
            <option value="">Select role</option>
            {jobs.map((j) => (
              <option value={j._id} key={j._id}>
                {j.jobId} — {j.title}
              </option>
            ))}
          </select>
        </label>
        {[
          ["employeeName", "Employee name"],
          ["employeeId", "Employee ID"],
          ["employeeEmail", "Employee email"],
          ["department", "Employee department"],
          ["relationship", "Relationship with candidate"],
          ["remarks", "Referral remarks"],
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
        <label className="check">
          <input required type="checkbox" />
          <span>
            <strong>Declaration</strong>
            <span>I confirm that the information provided is accurate.</span>
          </span>
        </label>
        <div>
          <button disabled={submitting}>
            {submitting ? "Submitting..." : "Submit application"}
          </button>
        </div>
        {msg && <p className="error">{msg}</p>}
      </form>
    </section>
  );
}
export function Applications({ admin = false }) {
  const [rows, setRows] = useState([]),
    [status, setStatus] = useState(""),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [pages, setPages] = useState(0);
  const load = (pageToLoad = page) =>
    api
      .get("/applications", { params: { status, search, page: pageToLoad, limit: PAGE_SIZE } })
      .then((r) => { setRows(r.data.applications); setTotal(r.data.total); setPages(r.data.pages); });
  useEffect(() => {
    load();
  }, [status, page]);
  return (
    <section className="panel">
      <div className="page-actions">
        <h2>{admin ? "All Applications" : "My Applications"}</h2>
        <div>
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
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
          <button onClick={() => { setPage(1); load(1); }}>Search</button>
        </div>
      </div>
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
                <small>{a.candidate?.email || "No email available"}</small>
              </td>
              <td>{a.job?.title || "Job unavailable"}</td>
              <td>{a.referral?.employeeName || "Referral unavailable"}</td>
              <td>
                <span className={statusClass(a.status)}>{a.status}</span>
              </td>
              <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
              <td>
                <Link to={`${admin ? "/admin/applications" : "/applications"}/${a._id}`}>Details</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p>No applications found.</p>}
      <Pagination page={page} pages={pages} total={total} onChange={setPage}/>
    </section>
  );
}
