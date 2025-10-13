import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageUsers.css";
import services from "../api/services";
import useFlash from "../hooks/useFlash";

const UserManagement = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const handleInviteClick = () => {
    navigate("/admin/invite-user"); // 👈 route for invite page
  };

  const { show, Render } = useFlash();

  useEffect(() => {
    const load = async () => {
      try {
  const res = await services.listUsers();
  let list = res.data || [];
  console.debug('listUsers response', list);

        // For non-admin users missing flat, fetch their full profile in parallel
        const toFetch = list.filter(u => {
          if (!u || !u.id) return false;
          const role = (u.role || (u.user && u.user.role) || "").toString().toLowerCase();
          const isAdmin = role === "admin";
          const hasFlat = !!(u.flat || u.flat_number || u.flatNumber || (u.user && (u.user.flat || u.user.flat_number || u.user.flatNumber)));
          return !isAdmin && !hasFlat;
        });
        console.debug('users needing fetch for flat', toFetch.map(u => ({ id: u.id, email: u.email, role: u.role, flat: u.flat })));
        if (toFetch.length > 0) {
          try {
            const results = await Promise.allSettled(toFetch.map(u => services.getUser(u.id)));
            // merge results into list
            const updatedMap = {};
            results.forEach((r, idx) => {
              if (r.status === 'fulfilled' && r.value && r.value.data) {
                  // preserve original role from list if present; fill missing flat only
                  const fetched = r.value.data;
                  const orig = toFetch[idx] || {};
                  const merged = { ...fetched };
                  // if original had a role but fetched doesn't, keep it
                  if (orig.role && !merged.role) merged.role = orig.role;
                  // ensure flat fields prefer fetched but fall back to originals
                  if (!merged.flat && orig.flat) merged.flat = orig.flat;
                  if (!merged.flat && orig.user && orig.user.flat) merged.flat = orig.user.flat;
                  updatedMap[merged.id] = merged;
                  console.debug('fetched user merged', merged.id, merged);
                }
            });
              list = list.map(u => updatedMap[u.id] ? { ...u, ...updatedMap[u.id] } : u);
              console.debug('final users list after merge', list.map(u => ({ id: u.id, email: u.email, flat: u.flat, nestedFlat: u.user && u.user.flat })));
          } catch (err) {
            console.debug('batch fetch failed', err);
          }
        }

        setUsers(list);
      } catch (err) {
        console.error(err);
        show(err.response?.data?.detail || "Failed to load users", 'error');
      }
    };
    load();
  }, [show]);

  const changeRole = async (userId, role) => {
    try {
      await services.changeUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    } catch (err) {
      console.error(err);
  show(err.response?.data?.detail || "Failed to change role", 'error');
    }
  };

  const [editingId, setEditingId] = useState(null);
  const [editingFlat, setEditingFlat] = useState("");

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditingFlat(getFlat(u) === '-' ? '' : getFlat(u));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingFlat("");
  };

  const saveFlat = async (userId) => {
    try {
      await services.changeUserFlat(userId, editingFlat);
      setUsers((prev) => prev.map(u => u.id === userId ? { ...u, flat: editingFlat } : u));
      setEditingId(null);
      setEditingFlat("");
    } catch (err) {
      console.error(err);
    show(err.response?.data?.detail || "Failed to save flat", 'error');
    }
  };

  const getFlat = (u) => {
    if (!u) return "-";
    const candidates = [u.flat, u.flat_number, u.flatNumber, u.flatNo, u.user && u.user.flat, u.user && u.user.flat_number, u.user && u.user.flatNumber];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim() !== '') return c;
      if (typeof c === 'number') return String(c);
    }
    return "-";
  };

  return (
    <div className="app-container">
  <Render />
      {/* Main Content */}
      <main className="main-content">
        {/* Recent Complaints panel (matches Admin Dashboard style) */}
        

        <div className="header">
          <div>
            <h1>User Management</h1>
            <p className="subtitle">
              Manage residents and administrators.
            </p>
          </div>
        </div>

        {/* Users Table */}
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Flat Number</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.name || u.email}</strong></td>
                  <td>
                    {editingId === u.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input value={editingFlat} onChange={(e) => setEditingFlat(e.target.value)} placeholder="Flat" />
                        <button className="action-btn" onClick={() => saveFlat(u.id)}>Save</button>
                        <button className="action-btn" onClick={cancelEdit}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span>{getFlat(u)}</span>
                        {String((u.role || '').toLowerCase()) !== 'admin' && (
                          <button className="action-btn" onClick={() => startEdit(u)}>Edit</button>
                        )}
                      </div>
                    )}
                  </td>
                <td>{u.email}</td>
                <td>
                  <span className="role-badge">{u.role}</span>
                </td>
                <td>
                  {u.role === "admin" ? (
                    <button className="action-btn" onClick={() => changeRole(u.id, "user")}>Make Resident</button>
                  ) : (
                    <button className="action-btn" onClick={() => changeRole(u.id, "admin")}>Make Admin</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Note */}
        <p className="note">
          <strong>Note:</strong> User creation and deletion is managed through
          the platform's main user dashboard. You can promote or demote users
          to/from Admin status here.
        </p>
      </main>
    </div>
  );
};

// RecentComplaintsPreview removed (unused) to silence lint warnings. If needed, re-add as a separate component.

export default UserManagement;
