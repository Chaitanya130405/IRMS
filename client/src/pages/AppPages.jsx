import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
const statusClass = (s) => `badge ${s?.toLowerCase().replaceAll(" ", "-")}`;
export function Dashboard({ admin = false }) {
  const [d, setD] = useState(null);
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
        <div className="section-heading"><div><p>LIVE UPDATES</p><h2>Recent activity</h2></div><span>Updated just now</span></div>
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
export function Notifications(){const [rows,setRows]=useState([]);useEffect(()=>{api.get('/notifications').then(r=>setRows(r.data.notifications))},[]);return <section className="panel"><h2>Notifications</h2>{rows.map(n=><article className={`notification ${n.read?'':'unread'}`} key={n._id}><strong>{n.title}</strong><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleString()}</small></article>)}{!rows.length&&<p>No notifications yet.</p>}</section>}
export function ApplicationDetails(){const id=location.pathname.split('/').pop(),{user}=useAuth(),[app,setApp]=useState(null),[status,setStatus]=useState('');useEffect(()=>{api.get(`/applications/${id}`).then(r=>{setApp(r.data.application);setStatus(r.data.application.status)})},[id]);if(!app)return <div className="center">Loading application...</div>;return <section className="panel"><div className="page-actions"><div><h2>{app.applicationId}</h2><p>{app.job.title} - {app.job.department}</p></div><span className={statusClass(app.status)}>{app.status}</span></div><div className="form-grid"><div><h3>Candidate</h3><p>{app.candidate.name}<br/>{app.candidate.email}<br/>{app.candidate.phone}</p><h3>Referral</h3><p>{app.referral.employeeName} ({app.referral.employeeId})<br/>{app.referral.employeeEmail}</p></div><div><h3>Resume</h3>{app.resume?.path&&<a className="button" href={`${import.meta.env.VITE_API_URL?.replace('/api','')||'http://localhost:5000'}/uploads/${app.resume.path}`} target="_blank">Download resume</a>}<h3>Status history</h3>{app.statusHistory.map((h,i)=><p key={i}><b>{h.status}</b> - {h.remarks}</p>)}{user.role==='admin'&&<><select value={status} onChange={e=>setStatus(e.target.value)}>{['Applied','Resume Under Review','Interview Scheduled','Technical Round','HR Round','Selected','Rejected','Offer Released','Joined'].map(s=><option key={s}>{s}</option>)}</select><button onClick={async()=>{const r=await api.patch(`/applications/${id}/status`,{status,remarks:'Updated from HR portal'});setApp(r.data.application)}}>Update status</button></>}</div></div></section>}
export function AccessDenied(){return <div className="center"><h1>Access denied</h1><p>You don’t have permission to view this page.</p><Link to="/dashboard">Return to dashboard</Link></div>}
export function Jobs({ admin = false }) {
  const [jobs, setJobs] = useState([]),
    [form, setForm] = useState(null),
    [error, setError] = useState("");
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
        {jobs
          .filter((j) => admin || j.status === "active")
          .map((j) => (
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
    </>
  );
}
export function Apply() {
  const nav = useNavigate(),
    [jobs, setJobs] = useState([]),
    [file, setFile] = useState(),
    [msg, setMsg] = useState(""),
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
          <input required type="checkbox" /> I declare that this information is
          accurate.
        </label>
        <div>
          <button>Submit application</button>
        </div>
        {msg && <p className="error">{msg}</p>}
      </form>
    </section>
  );
}
export function Applications({ admin = false }) {
  const [rows, setRows] = useState([]),
    [status, setStatus] = useState(""),
    [search, setSearch] = useState("");
  const load = () =>
    api
      .get("/applications", { params: { status, search } })
      .then((r) => setRows(r.data.applications));
  useEffect(() => {
    load();
  }, [status]);
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
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
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
          <button onClick={load}>Search</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Job</th>
            <th>Referral</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a._id}>
              <td>
                {a.candidate.name}
                <small>{a.candidate.email}</small>
              </td>
              <td>{a.job.title}</td>
              <td>{a.referral.employeeName}</td>
              <td>
                <span className={statusClass(a.status)}>{a.status}</span>
              </td>
              <td>
                <Link to={`${admin ? "/admin/applications" : "/applications"}/${a._id}`}>Details</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
