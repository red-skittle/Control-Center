"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface AuthUser {
  email: string;
  name: string;
  initials: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const DEFAULT_CREDENTIALS = {
  email: "lakshyajha210606@gmail.com",
  password: "naruto@21",
  name: "Lakshya Jha",
  initials: "LJ",
};

const AUTH_STORAGE_KEY = "control_center_auth_session_v1";
const USERS_REGISTRY_KEY = "control_center_registered_users_v1";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = emailInput.trim().toLowerCase();
    const trimmedPass = passwordInput.trim();

    // Check default configured administrator account
    if (
      trimmedEmail === DEFAULT_CREDENTIALS.email.toLowerCase() &&
      trimmedPass === DEFAULT_CREDENTIALS.password
    ) {
      const authUser: AuthUser = {
        email: DEFAULT_CREDENTIALS.email,
        name: DEFAULT_CREDENTIALS.name,
        initials: DEFAULT_CREDENTIALS.initials,
      };
      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      return { success: true };
    }

    // Check dynamically registered user accounts
    try {
      const rawUsers = localStorage.getItem(USERS_REGISTRY_KEY);
      const registry = rawUsers ? JSON.parse(rawUsers) : {};
      if (registry[trimmedEmail] && registry[trimmedEmail].password === trimmedPass) {
        const authUser: AuthUser = {
          email: trimmedEmail,
          name: registry[trimmedEmail].name || trimmedEmail.split("@")[0],
          initials: (registry[trimmedEmail].name || trimmedEmail).slice(0, 2).toUpperCase(),
        };
        setUser(authUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        return { success: true };
      }
    } catch (err) {
      console.error("Auth registry error:", err);
    }

    return {
      success: false,
      error: "Invalid email or password. Use default account or register below.",
    };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn("Could not clear auth session:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
