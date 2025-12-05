import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Base URL for the backend API
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3001/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  position?: string;
  avatar?: string;
  // Frontend roles (mapped from backend roles)
  role: "admin" | "employee";
  phone?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  startDate?: string;
  employeeId?: string;
  notificationSettings?: any;
  appSettings?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: SignupData) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  department?: string;
  position?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem("rushcorp_user");
      const token = localStorage.getItem("rushcorp_token");

      if (savedUser && token) {
        try {
          // Start by trusting localStorage (simple for beginners)
          const userData = JSON.parse(savedUser) as User;
          setUser(userData);
        } catch (error) {
          console.error("Error parsing saved user data:", error);
          localStorage.removeItem("rushcorp_user");
          localStorage.removeItem("rushcorp_token");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error("Login failed with status:", response.status);
        setIsLoading(false);
        return false;
      }

      const json = await response.json();
      const apiUser = json.data?.user;
      const accessToken = json.data?.accessToken as string | undefined;

      if (!apiUser || !accessToken) {
        console.error("Unexpected login response shape:", json);
        setIsLoading(false);
        return false;
      }

      // Map backend user (ADMIN/MANAGER/EMPLOYEE) to frontend roles (admin/employee)
      const mappedUser: User = {
        id: apiUser.id,
        email: apiUser.email,
        firstName: apiUser.firstName,
        lastName: apiUser.lastName,
        department: apiUser.department ?? undefined,
        position: apiUser.position ?? undefined,
        role: apiUser.role === "ADMIN" ? "admin" : "employee",
        phone: apiUser.phone ?? undefined,
        bio: apiUser.bio ?? undefined,
        location: apiUser.location ?? undefined,
        timezone: apiUser.timezone ?? undefined,
        startDate: apiUser.startDate ?? undefined,
        employeeId: apiUser.employeeId ?? undefined,
        notificationSettings: apiUser.notificationSettings ?? undefined,
        appSettings: apiUser.appSettings ?? undefined,
      };

      // Persist session in localStorage
      localStorage.setItem("rushcorp_user", JSON.stringify(mappedUser));
      localStorage.setItem("rushcorp_token", accessToken);

      setUser(mappedUser);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          department: userData.department,
          position: userData.position,
          phone: userData.phone,
        }),
      });

      if (!response.ok) {
        console.error("Signup failed with status:", response.status);
        setIsLoading(false);
        return false;
      }

      const json = await response.json();
      const apiUser = json.data?.user;
      const accessToken = json.data?.accessToken as string | undefined;

      if (!apiUser || !accessToken) {
        console.error("Unexpected signup response shape:", json);
        setIsLoading(false);
        return false;
      }

      const mappedUser: User = {
        id: apiUser.id,
        email: apiUser.email,
        firstName: apiUser.firstName,
        lastName: apiUser.lastName,
        department: apiUser.department ?? undefined,
        position: apiUser.position ?? undefined,
        role: apiUser.role === "ADMIN" ? "admin" : "employee",
        phone: apiUser.phone ?? undefined,
        bio: apiUser.bio ?? undefined,
        location: apiUser.location ?? undefined,
        timezone: apiUser.timezone ?? undefined,
        startDate: apiUser.startDate ?? undefined,
        employeeId: apiUser.employeeId ?? undefined,
        notificationSettings: apiUser.notificationSettings ?? undefined,
        appSettings: apiUser.appSettings ?? undefined,
      };

      localStorage.setItem("rushcorp_user", JSON.stringify(mappedUser));
      localStorage.setItem("rushcorp_token", accessToken);

      setUser(mappedUser);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("rushcorp_token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const json = await response.json();
        const apiUser = json.data?.user;

        if (apiUser) {
          const mappedUser: User = {
            id: apiUser.id,
            email: apiUser.email,
            firstName: apiUser.firstName,
            lastName: apiUser.lastName,
            department: apiUser.department ?? undefined,
            position: apiUser.position ?? undefined,
            role: apiUser.role === "ADMIN" ? "admin" : "employee",
            phone: apiUser.phone ?? undefined,
            bio: apiUser.bio ?? undefined,
            location: apiUser.location ?? undefined,
            timezone: apiUser.timezone ?? undefined,
            startDate: apiUser.startDate ?? undefined,
            employeeId: apiUser.employeeId ?? undefined,
            notificationSettings: apiUser.notificationSettings ?? undefined,
            appSettings: apiUser.appSettings ?? undefined,
          };

          localStorage.setItem("rushcorp_user", JSON.stringify(mappedUser));
          setUser(mappedUser);
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("rushcorp_user");
    localStorage.removeItem("rushcorp_token");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
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

// Protected Route Component
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login will be handled by the router
    return null;
  }

  return <>{children}</>;
}