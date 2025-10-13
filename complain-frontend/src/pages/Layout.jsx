import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "./Dashboard.css"; // reuse your styles

const Layout = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("user_name") || null;
  const userFlat = localStorage.getItem("flat") || null;
  const role = localStorage.getItem("role") || null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_email");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-header">ResidentConnect</div>
          <nav className="sidebar-nav">
            <Link to="/app">Dashboard</Link>
            <Link to="/app/new">New Complaint</Link>
            <Link to="/app/my">My Complaints</Link>
            <Link to="/app/profile">Profile</Link>
          </nav>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar" aria-hidden="true">
            <img src="/images/logo.png" alt="logo" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
          </div>
          <div className="user-info">
            <p className="user-name">{userName ? `Welcome, ${userName}` : "Welcome"}</p>
            {userFlat && role !== 'admin' ? <p className="user-flat-no">Flat No: {userFlat}</p> : <p className="user-flat-no">&nbsp;</p>}
          </div>
        </div>

        <div style={{ padding: 16 }}>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </aside>

      {/* Main content area (this changes when route changes) */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
