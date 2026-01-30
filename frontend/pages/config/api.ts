const isProd = import.meta.env.PROD;

const DEV_API = "http://localhost:3001";

export const API_BASE_URL = isProd
  ? import.meta.env.VITE_API_BASE_URL
  : DEV_API;

if (!API_BASE_URL) {
  console.warn(
    "⚠️ API base URL is missing. Check your .env production config.",
  );
}
