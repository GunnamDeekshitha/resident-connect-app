import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.css"; // reuse your styles

const AdminLayout = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("user_name") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("flat");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-header">ResidentConnect</div>

          <nav className="sidebar-nav">
            <Link to="/admin">Admin Dashboard</Link>
            <Link to="/admin/all-complaints">All Complaints</Link>
            <Link to="/admin/manage-users">Manage Users</Link>
            <Link to="/admin/profile">Profile</Link>
          </nav>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar"></div>
          <div>
            <p className="user-name">{adminName}</p>
            {/* Admins do not have a flat number; omit the flat line */}
          </div>
        </div>

        <div style={{ padding: 16 }}>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
