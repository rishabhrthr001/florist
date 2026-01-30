const isDev = import.meta.env.DEV;

const API_BASE_URL = isDev
  ? "http://localhost:3001"
  : import.meta.env.VITE_API_URL;

export default API_BASE_URL;
