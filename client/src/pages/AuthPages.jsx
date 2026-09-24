import React, { useEffect, useState, useRef } from "react";
import logo from "../../images/logo.png";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Animated background component
function AuthBackground() {
  return (
    <div className="auth-background">
      <div className="auth-gradient" />
      <div className="auth-shapes">
        <div className="auth-shape auth-shape-1" />
        <div className="auth-shape auth-shape-2" />
        <div className="auth-shape auth-shape-3" />
        <div className="auth-shape auth-shape-4" />
      </div>
      <div className="auth-grid" />
    </div>
  );
}

// Floating particles
function Particles() {
  return (
    <div className="auth-particles">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

// Password strength indicator
function PasswordStrength({ password }) {
  const getStrength = (pass) => {
    if (!pass) return { level: 0, text: "", color: "" };
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/[0-9]/)) strength++;
    if (pass.match(/[^a-zA-Z0-9]/)) strength++;

    const levels = [
      { level: 0, text: "", color: "" },
      { level: 1, text: "Weak", color: "var(--error-500)" },
      { level: 2, text: "Fair", color: "var(--warning-500)" },
      { level: 3, text: "Good", color: "var(--primary-500)" },
      { level: 4, text: "Strong", color: "var(--success-500)" },
    ];
    return levels[strength];
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-bars">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`strength-bar ${level <= strength.level ? "active" : ""}`}
            style={{ backgroundColor: level <= strength.level ? strength.color : undefined }}
          />
        ))}
      </div>
      <span style={{ color: strength.color }}>{strength.text}</span>
    </div>
  );
}

// Custom input with floating label and icons
function Input({ label, onChange, icon, showPasswordToggle, error, success, ...p }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [autofilled, setAutofilled] = useState(false);
  const inputRef = useRef(null);
  const hasValue = p.value && p.value.length > 0;

  // Detect browser autofill
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    // Check for autofill on mount and after a delay (browsers autofill at different times)
    const checkAutofill = () => {
      try {
        // Check if input has autofill pseudo-class
        if (input.matches(':-webkit-autofill')) {
          setAutofilled(true);
        }
      } catch (e) {
        // matches() may throw on unsupported selectors
      }
    };

    // Check immediately and after delays
    checkAutofill();
    const timer1 = setTimeout(checkAutofill, 100);
    const timer2 = setTimeout(checkAutofill, 500);
    const timer3 = setTimeout(checkAutofill, 1000);

    // Also listen for animation event that Chrome fires on autofill
    const handleAnimation = (e) => {
      if (e.animationName === 'onAutoFillStart') {
        setAutofilled(true);
      } else if (e.animationName === 'onAutoFillCancel') {
        setAutofilled(false);
      }
    };
    input.addEventListener('animationstart', handleAnimation);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      input.removeEventListener('animationstart', handleAnimation);
    };
  }, []);

  const autoComplete =
    p.type === "password"
      ? label.toLowerCase().includes("new")
        ? "new-password"
        : "current-password"
      : p.type === "email"
        ? "email"
        : label === "Full name"
          ? "name"
          : undefined;

  const inputType = showPasswordToggle && showPassword ? "text" : p.type;

  return (
    <div className={`input-group ${focused ? "focused" : ""} ${hasValue || autofilled ? "has-value" : ""} ${error ? "has-error" : ""} ${success ? "has-success" : ""}`}>
      {icon && <span className="input-icon">{icon}</span>}
      <input
        {...p}
        ref={inputRef}
        type={inputType}
        required
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          setAutofilled(false); // User is typing, so clear autofill state
          onChange(e.target.value);
        }}
        className={icon ? "has-icon" : ""}
      />
      <label className={icon ? "has-icon" : ""}>{label}</label>
      {showPasswordToggle && (
        <button
          type="button"
          className="password-toggle unstyled"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      )}
      <div className="input-border" />
    </div>
  );
}

// Auth card wrapper
function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <AuthBackground />
      <Particles />
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card-inner">
            {/* Logo */}
            <Link to="/" className="auth-logo">
              <img src={logo} alt="iSpace IRMS" />
              <span>i<span>Space</span></span>
            </Link>

            {/* Header */}
            <div className="auth-header">
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>

            {/* Content */}
            <div className="auth-content">
              {children}
            </div>
          </div>

          {/* Decorative elements */}
          <div className="auth-card-glow" />
        </div>

        {/* Side illustration - hidden on mobile */}
        <div className="auth-illustration">
          <div className="illustration-content">
            <div className="illustration-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              Secure & Trusted
            </div>
            <h2>Streamline your recruitment process</h2>
            <p>Join thousands of companies using iSpace to manage employee referrals and build better teams.</p>
            
            <div className="illustration-stats">
              <div className="illustration-stat">
                <strong>2,500+</strong>
                <span>Successful Hires</span>
              </div>
              <div className="illustration-stat">
                <strong>150+</strong>
                <span>Companies</span>
              </div>
            </div>

            <div className="illustration-features">
              <div className="illustration-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Track every application</span>
              </div>
              <div className="illustration-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Real-time notifications</span>
              </div>
              <div className="illustration-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Hire with confidence</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Login Page
export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Warm up the API
    api.get("/health").catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    
    try {
      const u = await login(form);
      nav(
        u.role === "superadmin" ? "/superadmin" : 
        u.role === "admin" ? "/admin" : "/dashboard",
        { replace: true }
      );
    } catch (e) {
      setError(e.response?.data?.message || "Unable to sign in. Please check your credentials.");
      setSubmitting(false);
    }
  };

  return (
    <AuthShell 
      title="Welcome back" 
      subtitle="Sign in to continue to your dashboard"
    >
      <form onSubmit={submit}>
        <Input
          label="Email address"
          type="email"
          value={form.email}
          onChange={(email) => setForm({ ...form, email })}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          }
        />
        
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(password) => setForm({ ...form, password })}
          showPasswordToggle
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          }
        />

        <div className="auth-options">
          <label className="remember-me">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="forgot-link">
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="auth-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        <div className="auth-divider">
          <span>New to iSpace?</span>
        </div>

        <Link to="/register" className="auth-alternate">
          Create an account
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </form>
    </AuthShell>
  );
}

// Register Page
export function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    try {
      await api.post("/auth/register", form);
      nav("/login", { replace: true });
    } catch (e) {
      setError(e.response?.data?.message || "Registration failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <AuthShell 
      title="Create account" 
      subtitle="Start managing referrals in minutes"
    >
      <form onSubmit={submit}>
        <Input
          label="Full name"
          value={form.name}
          onChange={(name) => setForm({ ...form, name })}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />

        <Input
          label="Email address"
          type="email"
          value={form.email}
          onChange={(email) => setForm({ ...form, email })}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          }
        />

        <Input
          label="Phone number"
          type="tel"
          value={form.phone}
          onChange={(phone) => setForm({ ...form, phone })}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
          }
        />

        <div>
          <Input
            label="Password (min 8 characters)"
            type="password"
            value={form.password}
            onChange={(password) => setForm({ ...form, password })}
            showPasswordToggle
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            }
          />
          <PasswordStrength password={form.password} />
        </div>

        {error && (
          <div className="auth-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <div className="auth-terms">
          <label className="terms-check">
            <input type="checkbox" required />
            <span>
              I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </span>
          </label>
        </div>

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        <div className="auth-divider">
          <span>Already have an account?</span>
        </div>

        <Link to="/login" className="auth-alternate">
          Sign in instead
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </form>
    </AuthShell>
  );
}

// Forgot Password Page
export function Forgot() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const r = await api.post("/auth/forgot-password", { email });
      setMessage(r.data.message);
      if (r.data.resetToken) {
        nav(`/reset-password/${r.data.resetToken}`, { replace: true });
      }
    } catch (e) {
      setMessage("If this email exists, a reset link has been sent.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell 
      title="Reset password" 
      subtitle="Enter your email to receive reset instructions"
    >
      <form onSubmit={submit}>
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          }
        />

        {message && (
          <div className="auth-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {message}
          </div>
        )}

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" />
              Sending...
            </>
          ) : (
            <>
              Send reset link
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        <div className="auth-divider">
          <span>Remember your password?</span>
        </div>

        <Link to="/login" className="auth-alternate">
          Back to sign in
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
      </form>
    </AuthShell>
  );
}

// Reset Password Page
export function ResetPassword() {
  const { token } = useParams();
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    
    setSubmitting(true);
    setError("");

    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      nav("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password. The link may have expired.");
      setSubmitting(false);
    }
  };

  return (
    <AuthShell 
      title="Choose new password" 
      subtitle="Create a strong password for your account"
    >
      <form onSubmit={submit}>
        <div>
          <Input
            label="New password (min 8 characters)"
            type="password"
            value={password}
            onChange={setPassword}
            showPasswordToggle
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            }
          />
          <PasswordStrength password={password} />
        </div>

        <Input
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          showPasswordToggle
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          }
        />

        {error && (
          <div className="auth-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" />
              Resetting...
            </>
          ) : (
            <>
              Reset password
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        <div className="auth-divider">
          <span>Changed your mind?</span>
        </div>

        <Link to="/login" className="auth-alternate">
          Back to sign in
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
      </form>
    </AuthShell>
  );
}
