import React, { useState } from "react";
import services from "../api/services"; // use centralized services
import "./NewComplaint.css";
import useFlash from "../hooks/useFlash";

const NewComplaint = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    priority: "Medium",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { show, Render } = useFlash();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
  // POST complaint via services
  const res = await services.createComplaint(formData);

      show("Complaint submitted successfully!", 'success');
      console.log(res.data);

      // Reset form
      setFormData({
        title: "",
        category: "",
        description: "",
        priority: "Medium",
      });
    } catch (err) {
      console.error(err);
      show(err.response?.data?.detail || "Something went wrong while submitting complaint", 'error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <Render />
      <div className="main-header">
        <h1>Submit a Complaint</h1>
        <p>Provide details about the issue you are facing.</p>
      </div>

      <form className="complaint-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option>Plumbing</option>
            <option>Electrical</option>
            <option>Cleaning</option>
            <option>Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </div>
  );
};

export default NewComplaint;
