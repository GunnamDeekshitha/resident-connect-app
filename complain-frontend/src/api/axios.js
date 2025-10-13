// // import axios from "axios";

// // const api = axios.create({
// //   baseURL: "http://localhost:8000", // backend URL
// // });

// // // Add token automatically if exists
// // api.interceptors.request.use((config) => {
// //   const token = localStorage.getItem("token");
// //   if (token) {
// //     config.headers.Authorization = `Bearer ${token}`;
// //   }
// //   return config;
// // });

// // export default api;

// import axios from "axios";

// const api = axios.create({
//   baseURL: process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/api", 
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default api;
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
