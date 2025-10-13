import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import services from "../api/services"; // centralized services
import "./Signup.css";
import useFlash from "../hooks/useFlash";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); // optional name field
  const [accessCode, setAccessCode] = useState(""); // optional apartment access code
  const [flat, setFlat] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { show, Render } = useFlash();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validations
    if (password !== confirmPassword) {
      show("Passwords do not match!", "warn");
      return;
    }
    if (password.length < 8) {
      show("Password must be at least 8 characters long!", "warn");
      return;
    }

    try {
      // Call backend signup (include access_code if provided)
      const payload = { email, name, password };
      if (accessCode) payload.access_code = accessCode;
      if (flat) payload.flat = flat;
      const res = await services.signup(payload);

      // res.data contains the newly created user object
      show(`Account created for ${res.data.email}. You can now login.`, "success");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      console.error(err);
      show(err.response?.data?.detail || "Signup failed", "error");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
  <Render />
        <button className="back-btn" onClick={() => navigate("/login")}>
          ← Back to sign in
        </button>

        <h2 className="signup-title">Create your account</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Full name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Apartment Access Code (optional)</label>
            <input
              type="text"
              placeholder="Enter apartment access code to join"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Flat (Block-Number)</label>
            <input
              type="text"
              placeholder="Block-Flat (e.g., B-402)"
              value={flat}
              onChange={(e) => setFlat(e.target.value)}
            />
          </div>

          <button type="submit" className="signup-btn">
            Create account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
