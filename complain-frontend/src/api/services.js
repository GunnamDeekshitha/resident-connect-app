import api from "./axios";

// --- Auth ---
export const signup = (payload) => api.post("/auth/signup", payload);
export const registerAdmin = (payload) => api.post("/auth/register-admin", payload);
// login uses form-url-encoded
export const login = ({ email, password }) =>
  api.post(
    "/auth/token",
    new URLSearchParams({ username: email, password }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

export const forgotPassword = (email) => api.post("/auth/forgot-password", { email });
export const resetPassword = (payload) => api.post("/auth/reset-password", payload);

// --- Apartments ---
export const registerApartment = (payload) => api.post("/apartments/register", payload);
export const joinApartment = (userPayload, access_code) =>
  api.post(`/apartments/join?access_code=${encodeURIComponent(access_code)}`, userPayload);

// --- Complaints ---
export const createComplaint = (payload) => api.post("/complaints/", payload);
export const listMyComplaints = () => api.get("/complaints/me");
export const listApartmentRecent = () => api.get("/complaints/apartment/recent");
export const listApartmentCounts = () => api.get("/complaints/apartment/counts");
export const listAllComplaints = (params) => api.get("/complaints/", { params });
export const getComplaint = (id) => api.get(`/complaints/${id}`);
export const updateComplaint = (id, payload) => api.put(`/complaints/${id}`, payload);
export const deleteComplaint = (id) => api.delete(`/complaints/${id}`);

// --- Users (admin) ---
export const listUsers = (params) => api.get("/users/", { params });
export const changeUserRole = (userId, role) => api.put(`/users/${userId}/role`, null, { params: { role } });
export const inviteUser = (payload) => api.post(`/users/invite`, payload);
export const getUser = (userId) => api.get(`/users/${userId}`);
export const changeUserFlat = (userId, flat) => api.put(`/users/${userId}/flat`, { flat });

// --- Users (self) ---
export const getMyProfile = () => api.get("/users/me");
export const updateMyProfile = (payload) => api.put("/users/me", payload);

export default {
  signup,
  registerAdmin,
  login,
  registerApartment,
  joinApartment,
  createComplaint,
  listMyComplaints,
  listApartmentRecent,
  listApartmentCounts,
  listAllComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  listUsers,
  changeUserRole,
  inviteUser,
  getUser,
  changeUserFlat,
  forgotPassword,
  resetPassword,
  getMyProfile,
  updateMyProfile,
};
