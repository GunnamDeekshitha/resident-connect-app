import React, { useState, useEffect } from "react";
import "./AllComplaints.css";
import services from "../api/services";
import useFlash from "../hooks/useFlash";

const ComplaintsManagement = () => {
  const { show, Render } = useFlash();
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [search, setSearch] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async (params = {}) => {
    try {
      setLoading(true);
      const res = await services.listAllComplaints(params);
      setComplaints(res.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  // small inner component for status control
  const StatusControl = ({ complaint, onChange }) => {
    const [value, setValue] = useState(complaint.status || "pending");
    const options = ["pending", "inprogress", "resolved"];
    return (
      <select
        value={value}
        onChange={(e) => { setValue(e.target.value); onChange(e.target.value); }}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  };

  useEffect(() => {
    // initial load
    load();
  }, []);
  // auto-apply filters when search or status changes (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      const params = {};
      if (search) params.search = search;
      if (statusFilter && statusFilter !== "All Statuses") {
        const s = statusFilter.toLowerCase();
        if (s === "in progress") params.status = "inprogress";
        else if (s === "resolved") params.status = "resolved";
        else if (s === "pending") params.status = "pending";
        else params.status = s.replace(/\s+/g, "");
      }
      load(params);
    }, 350);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  return (
    <div className="app-container">
      {/* Main Content */}
      <main className="main-content">
        <Render />
        <h1>Complaints Management</h1>
        <p className="subtitle">View, update, and manage all resident complaints.</p>

        {/* Search & Filter */}
        <div className="controls">
          <input
            type="text"
            placeholder="Search by user, title..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-dropdown"
          >
            <option>All Statuses</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          {/* Apply is removed; filters auto-apply */}
        </div>

        {/* Complaints Table */}
        <table className="complaints-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Complaint</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" style={{ color: "#b91c1c" }}>{error}</td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-message">No complaints found.</td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr key={c.id}>
                  <td>{(c.user && (c.user.name || c.user.email)) || c.user_name || c.user_email || "-"}
                    {c.user && c.user.flat ? <div className="small-muted">Flat: {c.user.flat}</div> : null}
                  </td>
                  <td>{c.title}</td>
                  <td>{c.category || "-"}</td>
                  <td>{c.priority || "-"}</td>
                  <td>
                    {/* If admin, allow status change */}
                    {localStorage.getItem("role") === "admin" ? (
                      <StatusControl complaint={c} onChange={(newStatus) => {
                        // optimistic update
                        const prev = complaints.slice();
                        const next = complaints.map(x => x.id === c.id ? { ...x, status: newStatus } : x);
                        setComplaints(next);
                        services.updateComplaint(c.id, { status: newStatus })
                          .then(() => {
                            // notify other parts of the app (dashboard counts) that statuses changed
                            try { window.dispatchEvent(new Event('apartmentCountsUpdated')); } catch (e) { console.debug('dispatch failed', e); }
                          })
                          .catch(err => {
                            console.error(err);
                            setComplaints(prev);
                            show("Failed to update status", 'error');
                          });
                      }} />
                    ) : (
                      c.status
                    )}
                  </td>
                  <td>{new Date(c.created_at || c.created || Date.now()).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default ComplaintsManagement;
