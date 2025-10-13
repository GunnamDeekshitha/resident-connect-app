import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import NewComplaint from "./pages/NewComplaint";
import MyComplaints from "./pages/MyComplaints";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Signup from "./pages/Signup";
import RegisterApartment from "./pages/RegisterApartment";
import AllComplaints from "./pages/AllComplaints";
import ManageUsers from "./pages/ManageUsers";
import AdminLayout from "./pages/AdminLayout";
import InviteUser from "./pages/InviteUser";
import Profile from "./pages/Profile";
// import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register-apartment" element={<RegisterApartment />} />

        {/* User routes (moved under /app) */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="new" element={<NewComplaint />} />
          <Route path="my" element={<MyComplaints />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="all-complaints" element={<AllComplaints />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="invite-user" element={<InviteUser />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Fallback: redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Layout from "./pages/Layout";
// import Dashboard from "./pages/Dashboard";
// import NewComplaint from "./pages/NewComplaint";
// import MyComplaints from "./pages/MyComplaints";
// import Login from "./pages/Login";
// import AdminDashboard from "./pages/AdminDashboard";
// import ForgotPassword from "./pages/ForgotPassword";
// import Signup from "./pages/Signup";
// import AllComplaints from "./pages/AllComplaints";
// import ManageUsers from "./pages/ManageUsers";
// import AdminLayout from "./pages/AdminLayout";
// import InviteUser from "./pages/InviteUser";
// import ProtectedRoute from "./pages/ProtectedRoute";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Public routes */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/signup" element={<Signup />} />

//         {/* User routes */}
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute roleRequired="user">
//               <Layout />
//             </ProtectedRoute>
//           }
//         >
//           <Route index element={<Dashboard />} />
//           <Route path="new" element={<NewComplaint />} />
//           <Route path="my" element={<MyComplaints />} />
//         </Route>

//         {/* Admin routes */}
//         <Route
//           path="/admin"
//           element={
//             <ProtectedRoute roleRequired="admin">
//               <AdminLayout />
//             </ProtectedRoute>
//           }
//         >
//           <Route index element={<AdminDashboard />} />
//           <Route path="all-complaints" element={<AllComplaints />} />
//           <Route path="manage-users" element={<ManageUsers />} />
//           <Route path="invite-user" element={<InviteUser />} />
//         </Route>

//         {/* Catch all: redirect unknown paths to login */}
//         <Route path="*" element={<Navigate to="/login" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
