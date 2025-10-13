import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InviteUser.css";
import services from "../api/services";
import useFlash from "../hooks/useFlash";

const InviteUser = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");

  const handleCancel = () => {
    navigate("/admin/manage-users"); // go back to Manage Users
  };

  const { show, Render } = useFlash();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { email, name, role };
      const res = await services.inviteUser(payload);
  show(res.data.msg || "User invited", 'success');
      navigate("/admin/manage-users");
    } catch (err) {
      console.error(err);
  show(err.response?.data?.detail || "Failed to invite user", 'error');
    }
  };

  return (
    <div className="app-container">
      <main className="main-content">
        {/* Page Header */}
  <Render />
  <div className="invite-header">
          <h1>Invite New User</h1>
          <p className="subtitle">
            Send an invitation to a new resident or admin.
          </p>
        </div>

        {/* Form Card */}
        <div className="form-card">
          <h2 className="form-title">👤 User Information</h2>
          <form className="invite-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" placeholder="John Doe" value={name} onChange={(e)=>setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" placeholder="john@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Building</label>
                <select>
                  <option>Select building</option>
                  <option>A Block</option>
                  <option>B Block</option>
                  <option>C Block</option>
                </select>
              </div>
              <div className="form-group">
                <label>Flat Number *</label>
                <input type="text" placeholder="A-101" required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" placeholder="+1 234 567 890" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>User Role</label>
                <select value={role} onChange={(e)=>setRole(e.target.value)}>
                  <option value="user">Resident</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="role-note">
                  Residents can submit and view their own complaints. Admins can
                  manage all complaints and users.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                ➤ Send Invitation
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default InviteUser;
