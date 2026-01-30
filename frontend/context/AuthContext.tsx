import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import API from "../config";
import { socket } from "../lib/Socket";

/* ---------------- TYPES ---------------- */

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";

  phone?: string;
  address?: Address;

  createdAt: string;

  totalOrders?: number;
  totalSpent?: number;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;

  refreshUser: () => Promise<void>;
};

/* ---------------- CONTEXT ---------------- */

const AuthContext = createContext<AuthContextType | null>(null);

/* ---------------- PROVIDER ---------------- */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- RESTORE SESSION ---------------- */

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;

    // 🔥 SOCKET CONNECT ON REFRESH
    socket.auth = { token: savedToken };
    socket.connect();

    // fetch fresh user
    refreshUser().finally(() => setLoading(false));
  }, []);

  /* ---------------- REFRESH USER ---------------- */

  const refreshUser = async () => {
    try {
      const { data } = await axios.get(`${API}/user/me`);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (err) {
      console.error("Failed to refresh user", err);
      logout();
    }
  };

  /* ---------------- LOGIN ---------------- */

  const login = (jwt: string, userData: User) => {
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(userData));

    axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;

    // 🔥 SOCKET CONNECT ON LOGIN
    socket.auth = { token: jwt };
    socket.connect();

    setToken(jwt);
    setUser(userData);
  };

  /* ---------------- LOGOUT ---------------- */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete axios.defaults.headers.common["Authorization"];

    // 🔥 SOCKET DISCONNECT
    socket.disconnect();

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
