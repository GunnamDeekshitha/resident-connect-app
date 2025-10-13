import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyComplaints.css";
import services from "../api/services";
import useFlash from "../hooks/useFlash";

const MyComplaints = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const { show, Render } = useFlash();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await services.listMyComplaints();
        setComplaints(res.data || []);
      } catch (err) {
        console.error(err);
        show(err.response?.data?.detail || "Failed to load complaints", 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [show]);


  // Filter logic
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = c.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      status === "All" || (c.status && c.status.toLowerCase() === status.toLowerCase().replace(/ /g, ""));
    const matchesCategory = category === "All" || c.category === category;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // navigate and formatDate removed (unused) to satisfy lint rules

  const statusClass = (s) => {
    if (!s) return "badge unknown";
    const key = String(s).toLowerCase().replace(/\s+/g, "");
    if (key.includes("pending")) return "badge pending";
    if (key.includes("inprogress") || key.includes("in-progress") || key.includes("inprogress")) return "badge inprogress";
    if (key.includes("resolved") || key.includes("completed")) return "badge resolved";
    return "badge unknown";
  };

  return (
    <div className="complaints-container">
      <Render />
      {/* Header */}
      <div className="complaints-header">
        <div>
          <h1 className="page-title">My Complaints</h1>
          <p className="subtitle">Track and manage your submitted complaints.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Categories</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Complaints List */}
      <div className="complaints-list">
        {loading ? (
          <p>Loading...</p>
        ) : filteredComplaints.length === 0 ? (
          <p className="no-complaints">No complaints found.</p>
        ) : (
          <div className="cards">
            {filteredComplaints.map((c) => (
              <div key={c.id} className="complaint-card">
                <div className="card-left">
                  <h3 className="card-title">{c.title}</h3>
                  <div className="card-meta">
                    <span className="meta-item">{c.category || "General"}</span>
                    <span className="meta-sep">•</span>
                    {/* <span className="meta-item">From: {(c.user && (c.user.name || c.user.email)) || c.user_email || "You"}{c.user && c.user.flat ? ` • ${c.user.flat}` : ''}</span> */}
                    {/* <span className="meta-sep">•</span> */}
                    {/* <span className="meta-item">{formatDate(c)}</span> */}
                  </div>
                  {c.description ? <p className="card-desc">{c.description.length > 220 ? c.description.slice(0, 220) + '…' : c.description}</p> : null}
                </div>
                <div className="card-right">
                  <div className={statusClass(c.status)}>{c.status || 'Unknown'}</div>
                  <div className="card-actions">
                    {/* <button className="view-btn" onClick={() => navigate(`/app/complaints/${c.id}`)}>View</button>
                    <button className="secondary-btn" onClick={() => navigate(`/app/new?replyTo=${c.id}`)}>Follow Up</button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaints;
