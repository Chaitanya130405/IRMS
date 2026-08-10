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
      <form className="grid gap-4" onSubmit={submit}>
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
        {error && <p className="m-0 font-semibold text-[#d54253]">{error}</p>}
        <div className="flex flex-wrap items-center gap-4">
          <button className="justify-self-start rounded-xl border-0 bg-[linear-gradient(135deg,#0875e1,#0754ae)] px-5 py-3 text-[13px] font-bold text-white shadow-[0_8px_16px_rgba(8,117,225,.2)] transition hover:-translate-y-px hover:shadow-[0_12px_20px_rgba(8,117,225,.28)]">
            Sign in
          </button>
          <Link
            className="text-[13px] font-bold text-[#0875e1] no-underline hover:text-[#062b5c]"
            to="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        <p className="border-t border-[#e7eef6] pt-4 text-[13px] text-[#52667f]">
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
      <form className="grid gap-4" onSubmit={submit}>
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
        {error && <p className="m-0 font-semibold text-[#d54253]">{error}</p>}
        <button className="justify-self-start rounded-xl border-0 bg-[linear-gradient(135deg,#0875e1,#0754ae)] px-5 py-3 text-[13px] font-bold text-white shadow-[0_8px_16px_rgba(8,117,225,.2)] transition hover:-translate-y-px hover:shadow-[0_12px_20px_rgba(8,117,225,.28)]">
          Create account
        </button>
        <p className="border-t border-[#e7eef6] pt-4 text-[13px] text-[#52667f]">
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
        className="grid gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await api.post("/auth/forgot-password", { email });
          setMessage(r.data.message);
          if (r.data.resetToken)
            nav(`/reset-password/${r.data.resetToken}`, { replace: true });
        }}
      >
        <Input label="Email" type="email" value={email} onChange={setEmail} />
        <button className="justify-self-start rounded-xl border-0 bg-[linear-gradient(135deg,#0875e1,#0754ae)] px-5 py-3 text-[13px] font-bold text-white shadow-[0_8px_16px_rgba(8,117,225,.2)] transition hover:-translate-y-px">
          Request reset
        </button>
        {message && (
          <p className="m-0 font-semibold text-[#16895b]">{message}</p>
        )}
      </form>
    </AuthShell>
  );
}
export function ResetPassword() {
  const { token } = useParams(),
    nav = useNavigate(),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords do not match");
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      nav("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password");
    }
  };
  return (
    <AuthShell title="Choose a new password">
      <form className="grid gap-[17px]" onSubmit={submit}>
        <Input
          label="New password (min 8 chars)"
          type="password"
          value={password}
          onChange={setPassword}
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={setConfirm}
        />
        {error && <p className="m-0 font-semibold text-[#d54253]">{error}</p>}
        <button className="justify-self-start rounded-[9px] border-0 bg-[#0875e1] px-[18px] py-[11px] text-[13px] font-bold text-white hover:bg-[#0060bd]">
          Reset password
        </button>
      </form>
    </AuthShell>
  );
}
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
    <label className="grid gap-[7px] text-xs font-bold tracking-[.1px] text-[#34435a]">
      {label}
      <input
        className="w-full rounded-lg border border-[#d7e0eb] bg-white px-3 py-[11px] font-sans text-sm font-medium text-[#17243a] outline-none focus:border-[#52a3f1] focus:ring-[3px] focus:ring-[#0c8de31c]"
        required
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        {...p}
      />
    </label>
  );
}
function AuthShell({ title, children }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[radial-gradient(circle_at_15%_15%,#2497f3_0%,transparent_28%),linear-gradient(135deg,#041d45_0%,#0755a7_50%,#1294e7_100%)] p-[18px] md:p-7">
      <div className="absolute -bottom-32 -right-28 h-[420px] w-[420px] rounded-full border-[50px] border-white/10" />
      <section className="relative w-full max-w-[490px] rounded-[24px] border border-white/70 bg-white px-7 py-9 shadow-[0_28px_70px_rgba(1,25,65,.32)] md:px-11 md:py-11">
        <div className="flex items-center gap-3 text-2xl font-extrabold text-[#17243a]">
          <img
            className="h-[54px] w-[54px] rounded-xl object-contain shadow-sm"
            src={logo}
            alt="iSpace IRMS"
          />
          
        </div>
        <h1 className="mb-7 mt-9 text-[29px] font-extrabold tracking-[-1px] text-[#062b5c]">
          {title}
        </h1>
        {children}
      </section>
    </div>
  );
}
