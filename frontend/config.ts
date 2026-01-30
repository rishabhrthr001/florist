const isDev = import.meta.env.DEV;

const API = isDev ? "http://localhost:3001" : import.meta.env.VITE_API_BASE_URL;

export default API;
