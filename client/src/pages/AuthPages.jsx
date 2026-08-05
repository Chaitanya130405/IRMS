import React, { useState } from "react";
import logo from "../../images/logo.png";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
export function Login() {
  const { login } = useAuth(),
    nav = useNavigate(),
    [form, setForm] = useState({ email: "", password: "" }),
    [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      const u = await login(form);
      nav(u.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (e) {
      setError(e.response?.data?.message || "Unable to sign in");
    }
  };
  return (
    <AuthShell title="Sign in to IRMS">
      <form onSubmit={submit}>
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(email) => setForm({ ...form, email })}
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(password) => setForm({ ...form, password })}
        />
        {error && <p className="error">{error}</p>}
        <button>Sign in</button>
        <Link to="/forgot-password">Forgot password?</Link>
        <p>
          New candidate? <Link to="/register">Create account</Link>
        </p>
      </form>
    </AuthShell>
  );
}
export function Register() {
  const nav = useNavigate(),
    [f, setF] = useState({ name: "", email: "", phone: "", password: "" }),
    [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", f);
      nav("/login", { replace: true });
    } catch (e) {
      setError(e.response?.data?.message || "Registration failed");
    }
  };
  return (
    <AuthShell title="Create candidate account">
      <form onSubmit={submit}>
        <Input
          label="Full name"
          value={f.name}
          onChange={(name) => setF({ ...f, name })}
        />
        <Input
          label="Email"
          type="email"
          value={f.email}
          onChange={(email) => setF({ ...f, email })}
        />
        <Input
          label="Phone"
          value={f.phone}
          onChange={(phone) => setF({ ...f, phone })}
        />
        <Input
          label="Password (min 8 chars)"
          type="password"
          value={f.password}
          onChange={(password) => setF({ ...f, password })}
        />
        {error && <p className="error">{error}</p>}
        <button>Create account</button>
        <p>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
export function Forgot() {
  const nav = useNavigate();
  const [email, setEmail] = useState(""),
    [message, setMessage] = useState("");
  return (
    <AuthShell title="Reset your password">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await api.post("/auth/forgot-password", { email });
          setMessage(r.data.message);
          if (r.data.resetToken) nav(`/reset-password/${r.data.resetToken}`, { replace: true });
        }}
      >
        <Input label="Email" type="email" value={email} onChange={setEmail} />
        <button>Request reset</button>
        {message && <p className="success">{message}</p>}
      </form>
    </AuthShell>
  );
}
export function ResetPassword(){const {token}=useParams(),nav=useNavigate(),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[error,setError]=useState('');const submit=async e=>{e.preventDefault();if(password!==confirm)return setError('Passwords do not match');try{await api.post(`/auth/reset-password/${token}`,{password});nav('/login',{replace:true})}catch(err){setError(err.response?.data?.message||'Could not reset password')}};return <AuthShell title="Choose a new password"><form onSubmit={submit}><Input label="New password (min 8 chars)" type="password" value={password} onChange={setPassword}/><Input label="Confirm new password" type="password" value={confirm} onChange={setConfirm}/>{error&&<p className="error">{error}</p>}<button>Reset password</button></form></AuthShell>}
function Input({ label, onChange, ...p }) {
  const autoComplete =
    p.type === "password"
      ? label.toLowerCase().includes("new")
        ? "new-password"
        : "current-password"
      : p.type === "email"
        ? "email"
        : p.label === "Full name"
          ? "name"
          : undefined;
  return (
    <label>
      {label}
      <input required autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} {...p} />
    </label>
  );
}
function AuthShell({ title, children }) {
  return (
    <div className="auth">
      <section>
        <div className="brand brand-logo">
          <img src={logo} alt="iSpace IRMS" />
          <span className="brand-text">i<span>Space</span></span>
        </div>
        <h1>{title}</h1>
        {children}
      </section>
    </div>
  );
}
