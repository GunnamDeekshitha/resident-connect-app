import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";  // <-- import
import services from "../api/services";
import "./AdminDashboard.css";

const Dashboard = () => {
  const navigate = useNavigate(); // <-- hook to navigate
  const [summary, setSummary] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  useEffect(() => {
    const loadRecent = async () => {
      setLoadingRecent(true);
      try {
        const res = await services.listApartmentRecent();
        setRecentComplaints(res.data || []);
      } catch (err) {
        console.error('failed to load recent apartment complaints', err);
      } finally {
        setLoadingRecent(false);
      }
    };
    loadRecent();
    // load counts
    const loadCounts = async () => {
      try {
        const r = await services.listApartmentCounts();
        const data = r.data || { total: 0, pending: 0, inprogress: 0, resolved: 0 };
        setSummary({ total: data.total || 0, pending: data.pending || 0, inProgress: data.inprogress || 0, resolved: data.resolved || 0 });
      } catch (err) {
        console.error('failed to load apartment counts', err);
      }
    };
    loadCounts();

    const onCountsUpdated = () => {
      loadCounts();
    };
    window.addEventListener('apartmentCountsUpdated', onCountsUpdated);
    return () => {
      window.removeEventListener('apartmentCountsUpdated', onCountsUpdated);
    };
  }, []);

  return (
    <div>
      <div className="main-header">
        <div>
          {/* read display name from localStorage (set at login) */}
          <h1 className="welcome-text">{`Welcome, ${localStorage.getItem("user_name") || ""}`}</h1>
          <p className="summary-text">Here's a summary of your complaint activity.</p>
        </div>
        
        {/* Button navigates to /new */}
        <button 
          className="submit-button"
          onClick={() => navigate("/app/new")}
        >
          + Submit New Complaint
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        {["Total Complaints", "Pending", "In Progress", "Resolved"].map((title, idx) => (
          <div key={idx} className="summary-card">
            <p className="card-title">{title}</p>
            <p className="card-value">{Object.values(summary)[idx]}</p>
          </div>
        ))}
      </div>

      {/* Recent Complaints (Apartment-level) - use Admin style */}
      <section className="complaints">
        <h2>Recent Complaints</h2>
        <p className="recent-subtext">Here are the 5 most recent complaints in your apartment.</p>
        {loadingRecent ? (
          <p>Loading recent complaints...</p>
        ) : recentComplaints.length === 0 ? (
          <p className="no-complaints">No recent complaints in your apartment.</p>
        ) : (
          <ul>
            {recentComplaints.map((c) => (
              <li key={c.id} className="complaint">
                <div className="complaint-left">
                  <div className="complaint-top">
                    <strong>{c.title}</strong>
                    <span className={`status ${String(c.status).toLowerCase().replace(/\s+/g, "-")}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="complaint-meta">From: {(c.user && (c.user.name || c.user.email)) || c.user_email || "Unknown"}{c.user && c.user.flat ? ` • ${c.user.flat}` : ''} • {c.category}</p>
                  

                </div>
                <div className="complaint-actions">
                  
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
