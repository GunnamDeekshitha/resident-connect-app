import React, { useState, useEffect } from 'react';
import services from '../api/services';
import useFlash from '../hooks/useFlash';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState({ name: '', email: '', flat: '' });
  const [isLoading, setIsLoading] = useState(true);
  const { show, Render } = useFlash();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await services.getMyProfile();
        setUser({
          name: response.data.name || '',
          email: response.data.email || '',
          flat: response.data.flat || '',
        });
      } catch (error) {
        show('Failed to fetch profile data.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: user.name, flat: user.flat };
      await services.updateMyProfile(payload);
      // Also update localStorage if the name changed
      localStorage.setItem('user_name', user.name);
      localStorage.setItem('flat', user.flat);
      show('Profile updated successfully!', 'success');
    } catch (error) {
      show('Failed to update profile.', 'error');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>
      <div className="profile-card">
        <Render />
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              disabled // Email is not editable
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={user.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="flat">Flat Number</label>
            <input
              type="text"
              id="flat"
              name="flat"
              value={user.flat}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="submit-btn">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
