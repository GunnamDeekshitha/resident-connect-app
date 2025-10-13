import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";
import useFlash from "../hooks/useFlash";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { show, Render } = useFlash();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await (await import("../api/services")).default.login({ email, password });

  localStorage.setItem("token", res.data.access_token);
  localStorage.setItem("role", res.data.role);
  // store user display name (prefer server-provided name)
  const displayName = res.data.name || email;
  localStorage.setItem("user_name", displayName);
  if (res.data.flat) {
    localStorage.setItem("flat", res.data.flat);
  }

  if (res.data.role === "admin") navigate("/admin");
  else navigate("/app");
    } catch (err) {
      console.error(err);
      show(err.response?.data?.detail || "Invalid credentials", "error");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
  <Render />
        <div className="login-logo">🏢</div>
        <h2 className="login-title">Welcome to ResidentConnect</h2>
        <p className="login-subtitle">Sign in to continue</p>

        <div>
          <button className="register-apt-btn" onClick={() => navigate('/register-apartment')}>
            Register Apartment
          </button>
          <div className="divider">
            <span>OR</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="text"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="signin-btn">
            Sign in
          </button>
        </form>

        <div className="login-footer">
          <span>
            Need an account? <Link to="/signup">Sign up</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;

