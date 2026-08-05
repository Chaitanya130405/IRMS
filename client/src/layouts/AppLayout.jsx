import React from "react";
import logo from "../../images/logo.png";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const candidate = [
  ["/dashboard", "Dashboard"],
  ["/jobs", "Open Jobs"],
  ["/applications", "My Applications"],
  ["/notifications", "Notifications"],
  ["/profile", "Profile"],
];
const admin = [
  ["/admin", "Dashboard"],
  ["/admin/jobs", "Manage Jobs"],
  ["/admin/applications", "Applications"],
  ["/admin/notifications", "Notifications"],
  ["/admin/profile", "Settings"],
];
export default function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const links = user.role === "admin" ? admin : candidate;
  return (
    <div className="shell">
      <aside>
        <div className="brand brand-logo">
          <img src={logo} alt="iSpace IRMS" />
          <span className="brand-text">i<span>Space</span></span>
        </div>
        <p className="role">
          {user.role === "admin" ? "HR ADMIN" : "CANDIDATE"}
        </p>
        <nav>
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin" || to === "/dashboard"}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          className="signout"
          onClick={() => {
            logout();
            nav("/login", { replace: true });
          }}
        >
          Sign out
        </button>
      </aside>
      <main>
        <header>
          <div>
            <h1>Welcome, {user.name.split(" ")[0]}</h1>
            <p>iSpace Recruitment Management System</p>
          </div>
          <button
            className="avatar"
            title="Open profile"
            aria-label="Open profile"
            onClick={() => nav(user.role === "admin" ? "/admin/profile" : "/profile")}
          >
            {user.name[0]}
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
