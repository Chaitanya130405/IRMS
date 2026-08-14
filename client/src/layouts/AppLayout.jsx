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
const superadmin = [
  ["/superadmin", "HR Admins"],
  ["/superadmin/create-admin", "Create HR Admin"],
  ["/superadmin/profile", "Settings"],
];
export default function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const links = user.role === "superadmin" ? superadmin : user.role === "admin" ? admin : candidate;
  return (
    <div className="app-shell grid min-h-screen grid-cols-1 lg:h-screen lg:min-h-0 lg:grid-cols-[260px_minmax(0,1fr)] lg:overflow-hidden">
      <aside className="app-sidebar flex flex-col border-r border-white/10 bg-[linear-gradient(180deg,#052c60_0%,#041b3e_100%)] px-4 py-7 shadow-[8px_0_30px_rgba(4,31,69,.12)] lg:h-screen lg:overflow-y-auto max-lg:block max-lg:p-[13px]">
        <div className="mb-2.5 flex items-center gap-2.5 px-[11px] text-2xl font-extrabold text-white max-lg:hidden">
          <img className="h-9 w-9 rounded-[10px] bg-white object-contain" src={logo} alt="iSpace IRMS" />
          <span className="whitespace-nowrap">i<span className="text-[#75bfff]">Space</span></span>
        </div>
        <p className="mx-3 mb-7 mt-[5px] text-[10px] font-extrabold tracking-[1.6px] text-[#75bfff] max-lg:hidden">
          {user.role === "superadmin" ? "SUPER ADMIN" : user.role === "admin" ? "HR ADMIN" : "CANDIDATE"}
        </p>
        <div className="mb-7 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.07] p-3 max-lg:hidden">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#5eb7ff] text-xs font-extrabold text-[#062b5c]">{user.name[0]}</div>
          <div className="min-w-0"><p className="truncate text-xs font-bold text-white">{user.name}</p><p className="mt-0.5 text-[10px] font-semibold text-[#9ac9f6]">{user.role === "superadmin" ? "Platform administration" : user.role === "admin" ? "Hiring workspace" : "Candidate portal"}</p></div>
        </div>
        <nav className="app-nav grid gap-[5px] max-lg:flex max-lg:gap-[7px] max-lg:overflow-x-auto">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin" || to === "/dashboard" || to === "/superadmin"}
              className={({ isActive }) => `relative whitespace-nowrap rounded-xl px-[13px] py-3 text-[13px] font-semibold text-[#b8d0eb] transition before:mb-0.5 before:mr-3 before:inline-block before:h-[6px] before:w-[6px] before:rounded-full before:bg-current before:content-[''] max-lg:px-[11px] max-lg:py-[9px] max-lg:before:hidden ${isActive ? '!bg-white !text-[#0875e1] hover:!bg-white hover:!text-[#0875e1] shadow-[0_8px_18px_rgba(0,15,45,.25)] before:bg-[#0875e1]' : 'hover:bg-white/10 hover:!text-white'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          className="mt-auto w-full rounded-xl border border-white/15 bg-white/[.06] px-[18px] py-[11px] text-left text-[13px] font-bold text-[#d9eaff] transition hover:bg-[#d94a57] hover:text-white max-lg:float-right max-lg:my-3 max-lg:w-auto max-lg:px-3 max-lg:py-2"
          onClick={() => {
            logout();
            nav("/login", { replace: true });
          }}
        >
          Sign out
        </button>
      </aside>
      <main className="app-main min-w-0 px-[17px] pb-[25px] md:px-[38px] md:pb-[38px] lg:h-screen lg:min-h-0 lg:overflow-x-hidden lg:overflow-y-auto">
        <header className="app-header mb-5 flex items-center justify-between border-b border-[#e7edf5] bg-[#f4f8fc] py-[19px] md:mb-7 md:py-7 md:pb-[26px]">
          <div>
            <h1 className="m-0 text-[25px] font-bold tracking-[-.7px]">Welcome, {user.name.split(" ")[0]}</h1>
            <p className="mb-0 mt-[5px] font-medium text-[#6c7a90]">iSpace Recruitment Management System</p>
          </div>
          <button
            className="grid h-[43px] w-[43px] place-items-center rounded-full border-0 bg-[#d7ecff] p-0 text-base font-extrabold text-[#0759aa] shadow-[0_5px_13px_#0875e133] hover:bg-[#bfe1ff]"
            title="Open profile"
            aria-label="Open profile"
            onClick={() => nav(user.role === "superadmin" ? "/superadmin/profile" : user.role === "admin" ? "/admin/profile" : "/profile")}
          >
            {user.name[0]}
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
