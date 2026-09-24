import React, { useState, useEffect, useCallback } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import logo from "../../images/logo.png";

// Navigation items for each role
const candidateNav = [
  { 
    to: "/dashboard", 
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  },
  { 
    to: "/jobs", 
    label: "Open Jobs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
    )
  },
  { 
    to: "/applications", 
    label: "My Applications",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    )
  },
  { 
    to: "/notifications", 
    label: "Notifications",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    )
  },
  { 
    to: "/profile", 
    label: "Profile",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  },
];

const adminNav = [
  { 
    to: "/admin", 
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  },
  { 
    to: "/admin/jobs", 
    label: "Manage Jobs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
    )
  },
  { 
    to: "/admin/applications", 
    label: "Applications",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    )
  },
  { 
    to: "/admin/notifications", 
    label: "Notifications",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    )
  },
  { 
    to: "/admin/profile", 
    label: "Settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    )
  },
];

const superadminNav = [
  { 
    to: "/superadmin", 
    label: "HR Admins",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    )
  },
  { 
    to: "/superadmin/create-admin", 
    label: "Create HR Admin",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    )
  },
  { 
    to: "/superadmin/profile", 
    label: "Settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    )
  },
];

// Role badge component
function RoleBadge({ role }) {
  const config = {
    superadmin: { label: "SUPER ADMIN", color: "#f59e0b" },
    admin: { label: "HR ADMIN", color: "#8b5cf6" },
    candidate: { label: "CANDIDATE", color: "#3b82f6" },
  };

  const { label, color } = config[role] || config.candidate;

  return (
    <span className="role-badge" style={{ color }}>
      <span className="role-dot" style={{ background: color }} />
      {label}
    </span>
  );
}

// User card in sidebar
function UserCard({ user }) {
  return (
    <div className="sidebar-user-card">
      <div className="user-avatar">
        {user.profilePicture ? (
          <img src={user.profilePicture} alt={user.name} />
        ) : (
          <span>{user.name.charAt(0)}</span>
        )}
        <span className="avatar-status" />
      </div>
      <div className="user-info">
        <p className="user-name">{user.name}</p>
        <p className="user-email">{user.email}</p>
      </div>
    </div>
  );
}

// Quick stats in sidebar - removed
function QuickStats({ role }) {
  return null; // Removed per user request
}

// Portal Navigation Bar Component - Removed (using sidebar only)
function PortalNavBar({ navItems, currentPath }) {
  return null; // Removed - using sidebar navigation only
}

// Smart Back Button Component - Prevents logout on continuous back press
function BackButton({ user, navItems }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the home/dashboard path for current user role
  const getHomePath = useCallback(() => {
    if (user.role === "superadmin") return "/superadmin";
    if (user.role === "admin") return "/admin";
    return "/dashboard";
  }, [user.role]);

  // Check if current page is the home/dashboard page
  const isHomePage = useCallback(() => {
    const homePath = getHomePath();
    return location.pathname === homePath;
  }, [location.pathname, getHomePath]);

  // Get all valid paths for this user's portal
  const getValidPaths = useCallback(() => {
    return navItems.map(item => item.to);
  }, [navItems]);

  // Check if a path belongs to the current user's portal
  const isValidPortalPath = useCallback((path) => {
    const validPaths = getValidPaths();
    // Check exact match or if it starts with a valid path (for nested routes like /applications/:id)
    return validPaths.some(validPath => 
      path === validPath || path.startsWith(validPath + "/")
    );
  }, [getValidPaths]);

  const handleBack = useCallback(() => {
    // If already on home page, do nothing (prevent going to login/landing)
    if (isHomePage()) {
      return;
    }

    // Navigate to the parent route or dashboard
    const pathParts = location.pathname.split("/").filter(Boolean);
    
    // If we're on a nested route like /applications/123, go to /applications
    if (pathParts.length > 1) {
      // For admin routes like /admin/applications/123
      if (pathParts[0] === "admin" && pathParts.length > 2) {
        const parentPath = "/" + pathParts.slice(0, 2).join("/");
        if (isValidPortalPath(parentPath)) {
          navigate(parentPath);
          return;
        }
      }
      // For candidate routes like /applications/123
      if (pathParts[0] !== "admin" && pathParts[0] !== "superadmin") {
        const parentPath = "/" + pathParts[0];
        if (isValidPortalPath(parentPath)) {
          navigate(parentPath);
          return;
        }
      }
      // For superadmin nested routes
      if (pathParts[0] === "superadmin" && pathParts.length > 1) {
        navigate("/superadmin");
        return;
      }
    }

    // Default: go to dashboard/home
    navigate(getHomePath());
  }, [isHomePage, location.pathname, navigate, getHomePath, isValidPortalPath]);

  // Don't show back button on home page
  if (isHomePage()) {
    return null;
  }

  return (
    <button 
      className="back-button unstyled" 
      onClick={handleBack}
      title="Go back"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>Back</span>
    </button>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { data } = await api.get("/notifications");
        const unread = data.notifications?.filter(n => !n.read).length || 0;
        setUnreadCount(unread);
      } catch (e) {
        // Silently fail - don't break the app for badge
      }
    };
    
    fetchUnreadCount();
    // Refresh count when navigating (in case user marked notifications as read)
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent browser back button from logging out
  useEffect(() => {
    const handlePopState = (e) => {
      // Get the base paths for each portal
      const candidateBasePaths = ["/dashboard", "/jobs", "/applications", "/notifications", "/profile", "/apply", "/referral-policy"];
      const adminBasePaths = ["/admin"];
      const superadminBasePaths = ["/superadmin"];

      const currentPath = window.location.pathname;
      
      // Check if we're still within the app
      const isInApp = 
        candidateBasePaths.some(p => currentPath.startsWith(p)) ||
        adminBasePaths.some(p => currentPath.startsWith(p)) ||
        superadminBasePaths.some(p => currentPath.startsWith(p));

      // If trying to navigate outside the app (to login/landing), prevent it
      if (!isInApp) {
        e.preventDefault();
        // Push the current state back
        const homePath = user.role === "superadmin" ? "/superadmin" : 
                        user.role === "admin" ? "/admin" : "/dashboard";
        window.history.pushState(null, "", homePath);
        nav(homePath, { replace: true });
      }
    };

    // Push initial state to prevent going back to login
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [nav, user.role]);

  const navItems =
    user.role === "superadmin"
      ? superadminNav
      : user.role === "admin"
        ? adminNav
        : candidateNav;

  const roleLabel =
    user.role === "superadmin"
      ? "Platform Control"
      : user.role === "admin"
        ? "Hiring Workspace"
        : "Candidate Portal";

  const getPageTitle = () => {
    const path = location.pathname;
    const item = navItems.find(nav => nav.to === path);
    if (item) return item.label;
    
    // Handle nested routes
    if (path.includes("/applications/")) return "Application Details";
    if (path.includes("/apply/")) return "Apply for Job";
    if (path.includes("/insights/")) return "Insights";
    
    return "Dashboard";
  };

  const handleLogout = () => {
    logout();
    nav("/login", { replace: true });
  };

  return (
    <div className={`app-shell ${menuOpen ? "menu-open" : ""} ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className={`app-sidebar ${menuOpen ? "menu-open" : ""}`}>
        {/* Close button for mobile */}
        <button
          type="button"
          className="sidebar-close unstyled"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Logo */}
        <div className="sidebar-header">
          <div className="app-brand">
            <img src={logo} alt="iSpace" />
            <span className="brand-text">
              i<span>Space</span>
            </span>
          </div>
          <RoleBadge role={user.role} />
        </div>

        {/* User Card */}
        <UserCard user={user} />

        {/* Navigation */}
        <nav className="app-nav">
          <p className="nav-section-label">MENU</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin" || item.to === "/dashboard" || item.to === "/superadmin"}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">
                {item.icon}
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="nav-badge-dot" />
                )}
              </span>
              <span className="nav-label">{item.label}</span>
              <span className="nav-indicator" />
            </NavLink>
          ))}
        </nav>

        {/* Quick Stats */}
        <QuickStats role={user.role} />

        {/* Logout Button */}
        <button className="sidebar-logout unstyled" onClick={handleLogout}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Sign out</span>
        </button>

        {/* Sidebar decoration */}
        <div className="sidebar-decoration" />
      </aside>

      {/* Mobile menu trigger */}
      {!menuOpen && (
        <button
          type="button"
          className="sidebar-menu-trigger unstyled"
          aria-label="Open navigation menu"
          onClick={() => setMenuOpen(true)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* Mobile backdrop */}
      {menuOpen && (
        <div 
          className="menu-backdrop" 
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="app-main">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            {/* Back Button */}
            <BackButton user={user} navItems={navItems} />
            
            <div className="header-content">
              <div className="header-breadcrumb">
                <span className="breadcrumb-role">{roleLabel}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span className="breadcrumb-page">{getPageTitle()}</span>
              </div>
              <h1 className="header-greeting">
                Welcome back, <span>{user.name.split(" ")[0]}</span>
              </h1>
            </div>
          </div>

          <div className="header-actions">
            {/* Notifications quick access */}
            <button 
              className="header-icon-btn unstyled"
              onClick={() => nav(user.role === "admin" ? "/admin/notifications" : user.role === "superadmin" ? "/superadmin" : "/notifications")}
              title="Notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {unreadCount > 0 && <span className="notification-dot" />}
            </button>

            {/* Profile button */}
            <button
              className="header-profile unstyled"
              title="Open profile"
              aria-label="Open profile"
              onClick={() =>
                nav(
                  user.role === "superadmin"
                    ? "/superadmin/profile"
                    : user.role === "admin"
                      ? "/admin/profile"
                      : "/profile"
                )
              }
            >
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} />
              ) : (
                <span>{user.name.charAt(0)}</span>
              )}
            </button>
          </div>
        </header>

        {/* Portal Navigation Bar - Quick access for each portal */}
        <PortalNavBar navItems={navItems} currentPath={location.pathname} />

        {/* Page Content */}
        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
