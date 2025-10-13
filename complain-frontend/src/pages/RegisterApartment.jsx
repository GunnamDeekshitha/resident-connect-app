import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import services from "../api/services";
import "./RegisterApartment.css"; // use new styles
import useFlash from "../hooks/useFlash";

const RegisterApartment = () => {
  const navigate = useNavigate();
  const [aptName, setAptName] = useState("");
  const [address, setAddress] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const { show, Render } = useFlash();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        apartment: { name: aptName, address },
        user_in: { email: adminEmail, name: adminName, password: adminPassword },
      };
      const res = await services.registerAdmin(payload);
      // show success box with access code
      const accessCode = res.data && (res.data.access_code || (res.data.apartment && res.data.apartment.access_code));
      const adminEmailResp = res.data && res.data.user && res.data.user.email;
      setSuccess({ ok: true, accessCode, adminEmail: adminEmailResp });
      show('Apartment registered', 'success');
    } catch (err) {
      console.error(err);
      show(err.response?.data?.detail || "Registration failed", 'error');
    }
  };

  const [success, setSuccess] = useState(null);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      show('Access code copied to clipboard', 'success');
    } catch (e) {
      show('Unable to copy', 'warn');
    }
  };

  return (
    <div className="register-apartment-container">
      <div className="register-apartment-header">
        <h1>Create Your Apartment Community</h1>
        <p className="subtitle">
          Register your apartment complex and create the first admin account.
        </p>
      </div>
      <div className="form-card">
        <Render />
        <h2 className="form-title">Apartment & Admin Details</h2>
        <form onSubmit={handleRegister} className="register-apartment-form">
          <div className="form-group">
            <label>Apartment Name</label>
            <input
              value={aptName}
              onChange={(e) => setAptName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Admin Name</label>
            <input
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Admin Password</label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Register Apartment
          </button>
        </form>
        {success && success.ok && (
          <div className="success-box">
            <h3>Apartment registered</h3>
            <p>Admin: {success.adminEmail}</p>
            <div className="access-code-row">
              <strong>Access Code:</strong>
              <span className="access-code">{success.accessCode}</span>
              <button
                className="copy-btn"
                onClick={() => copyCode(success.accessCode)}
              >
                Copy
              </button>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="submit-btn" onClick={() => navigate("/login")}>
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterApartment;
