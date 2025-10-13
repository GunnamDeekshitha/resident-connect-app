import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import services from "../api/services";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await services.listAllComplaints();
        if (!mounted) return;
        // services returns { data: [...] } from axios
        setComplaints(res.data || []);
        // fetch users count for the admin (number of users)
        try {
          const ures = await services.listUsers();
          if (mounted) setTotalUsers((ures.data || []).length);
        } catch (uerr) {
          console.debug('failed to load users count', uerr);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.detail || "Failed to load complaints");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="admin-container">

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h1>Admin Dashboard</h1>
          <p>Overview of building complaints and management</p>
        </header>

        {/* Stats Section */}
        <section className="stats">
          <div className="card">
            <p className="card-title">Total Complaints</p>
            <p className="card-value">{complaints.length}</p>
          </div>
          <div className="card">
            <p className="card-title">Pending</p>
            <p className="card-value">{complaints.filter(c => c.status === "pending" || c.status === "Pending").length}</p>
          </div>
          <div className="card">
            <p className="card-title">In Progress</p>
            <p className="card-value">{complaints.filter(c => c.status === "inprogress" || c.status === "In Progress").length}</p>
          </div>
          <div className="card">
            <p className="card-title">Resolved</p>
            <p className="card-value">{complaints.filter(c => c.status === "resolved" || c.status === "Resolved").length}</p>
          </div>
          <div className="card">
            <p className="card-title">Total Users</p>
            <p className="card-value">{totalUsers}</p>
          </div>
        </section>

        {/* Recent Complaints */}
        <section className="complaints">
          <h2>Recent Complaints</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: "#b91c1c" }}>{error}</p>
          ) : complaints.length === 0 ? (
            <p>No complaints found</p>
          ) : (
            <ul>
              {complaints.map((c) => (
                <li key={c.id} className="complaint">
                  <div className="complaint-left">
                    <div className="complaint-top">
                      <strong>{c.title}</strong>
                      <span className={`status ${String(c.status).toLowerCase().replace(/\s+/g, "-")}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="complaint-meta">From: {(c.user && (c.user.name || c.user.email)) || c.reporter_name || c.user_email || "Unknown"}{c.user && c.user.flat ? ` • ${c.user.flat}` : ''} • {c.category}</p>
                  </div>
                  <div className="complaint-actions">
                    
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
