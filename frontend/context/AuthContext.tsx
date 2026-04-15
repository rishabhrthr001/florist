import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import API from "../config";


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
  // 🔥 hydrate instantly
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const [loading, setLoading] = useState(true);

  /* ---------------- AUTO LOGOUT ---------------- */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete axios.defaults.headers.common["Authorization"];



    setUser(null);
    setToken(null);
  };

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

  /* ---------------- RESTORE SESSION ---------------- */

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }



    refreshUser().finally(() => setLoading(false));
  }, []);

  /* ---------------- LOGIN ---------------- */

  const login = (jwt: string, userData: User) => {
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(userData));

    axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;



    setToken(jwt);
    setUser(userData);
  };

  /* ---------------- AXIOS INTERCEPTOR (AUTO LOGOUT) ---------------- */

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          console.warn("Token expired → logging out");
          logout();
        }

        return Promise.reject(err);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

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
