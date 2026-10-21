"use client";

import React from "react";
import { useAuth } from "../lib/auth/auth-context";
import { LoginPage } from "./LoginPage";

export function AuthBarrier({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 rounded-full border-2 border-apple-blue border-t-transparent animate-spin" />
        <span className="text-xs text-neutral-400 font-mono mt-3">Initializing Vault...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
