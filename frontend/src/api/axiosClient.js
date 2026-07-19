import axios from "axios";

// Single axios instance for the whole app — base URL from env, timeout guard
// so a hung Gemini call never leaves the UI stuck without feedback.
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
