import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "editor";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check for existing session
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check both localStorage and sessionStorage
      const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");

      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr);
        setUser(user);
        setIsAuthenticated(true);
        scheduleTokenRefresh();
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleTokenRefresh = () => {
    // Clear existing timeout
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    // Schedule refresh 1 minute before token expires (14 minutes)
    const timeout = setTimeout(refreshToken, 14 * 60 * 1000);
    setRefreshTimeout(timeout);
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      const { accessToken } = data;

      // Update access token in storage
      if (localStorage.getItem("refreshToken")) {
        localStorage.setItem("accessToken", accessToken);
      } else {
        sessionStorage.setItem("accessToken", accessToken);
      }

      // Schedule next refresh
      scheduleTokenRefresh();
    } catch (error) {
      console.error("Token refresh error:", error);
      logout();
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      console.log("Attempting login with:", { email, rememberMe });
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response:", { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const { accessToken, refreshToken, user } = data;
      console.log("Login successful, storing tokens and user data");

      // Store tokens and user data
      if (rememberMe) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("refreshToken", refreshToken);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      setUser(user);
      setIsAuthenticated(true);
      scheduleTokenRefresh();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear refresh timeout
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
        setRefreshTimeout(null);
      }

      // Clear both localStorage and sessionStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Add authorization header to all fetch requests
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (accessToken && input.toString().startsWith("/api/")) {
        init = init || {};
        init.headers = {
          ...init.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      }
      
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [refreshTimeout]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 