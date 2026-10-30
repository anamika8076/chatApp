import axios from "axios";

// In local development, use Vite's /api proxy. In production, set
// VITE_BACKEND_URL to the deployed backend origin (for example, Render).
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL?.trim() || "";

export default axios;
