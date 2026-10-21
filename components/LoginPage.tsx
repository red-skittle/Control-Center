"use client";

import React, { useState } from "react";
import { useAuth } from "../lib/auth/auth-context";
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("lakshyajha210606@gmail.com");
  const [password, setPassword] = useState("naruto@21");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.error || "Authentication failed.");
      }
    } catch {
      setErrorMessage("An unexpected authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseDefault = () => {
    setEmail("lakshyajha210606@gmail.com");
    setPassword("naruto@21");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Subtle atmospheric ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm z-10">
        {/* Terminal Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 mb-4 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-apple-blue" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Control Center
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Personal Telemetry & Executive Command Console
          </p>
        </div>

        {/* Login Card */}
        <div className="apple-glass-panel p-6 border border-white/10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                Operator Email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  autoComplete="email"
                  required
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-apple-blue transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-medium text-neutral-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-apple-blue transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-neutral-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-apple-blue text-white font-semibold text-xs tracking-wide hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helper */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>Default Operator:</span>
              <button
                type="button"
                onClick={handleUseDefault}
                className="text-apple-blue hover:underline font-mono text-[11px]"
              >
                Autofill Credentials
              </button>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 font-mono text-[11px] text-neutral-300 flex flex-col gap-0.5">
              <div className="truncate">lakshyajha210606@gmail.com</div>
              <div className="text-neutral-500">Pass: naruto@21</div>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <p className="text-center text-[11px] text-neutral-500 mt-6">
          Encrypted Session Gate · Local Persistent Vault
        </p>
      </div>
    </div>
  );
}
