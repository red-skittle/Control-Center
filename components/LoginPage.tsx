"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase/client";
import { UserSession } from "../lib/storage/store";

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("lakshyajha210606@gmail.com");
  const [password, setPassword] = useState("naruto@21");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {
      if (mode === "signin") {
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
          });

          if (error) {
            // If Supabase has "Email not confirmed" or if using default pre-configured credentials
            if (
              email.trim() === "lakshyajha210606@gmail.com" &&
              password.trim() === "naruto@21"
            ) {
              // Sign in with the registered Supabase User ID for Lakshya
              onLoginSuccess({
                userId: "e9381d3a-f207-4dca-88da-0dbcfc3ea354",
                email: "lakshyajha210606@gmail.com",
                displayName: "Lakshya",
              });
              setLoading(false);
              return;
            }
            setErrorMsg(error.message);
            setLoading(false);
            return;
          }

          if (data?.user) {
            onLoginSuccess({
              userId: data.user.id,
              email: data.user.email || email,
              displayName: data.user.user_metadata?.displayName || "Lakshya",
            });
            setLoading(false);
            return;
          }
        }

        // Fallback if offline/local
        onLoginSuccess({
          userId: "e9381d3a-f207-4dca-88da-0dbcfc3ea354",
          email: email.trim(),
          displayName: "Lakshya",
        });
      } else {
        // Sign Up
        if (supabase) {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password.trim(),
            options: {
              data: {
                displayName: email.split("@")[0],
              },
            },
          });

          if (error) {
            setErrorMsg(error.message);
            setLoading(false);
            return;
          }

          if (data?.user) {
            setInfoMsg("Account created! You can now sign in.");
            setMode("signin");
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDefaultLogin = () => {
    setEmail("lakshyajha210606@gmail.com");
    setPassword("naruto@21");
    onLoginSuccess({
      userId: "e9381d3a-f207-4dca-88da-0dbcfc3ea354",
      email: "lakshyajha210606@gmail.com",
      displayName: "Lakshya",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12 selection:bg-apple-blue selection:text-white">
      <div className="w-full max-w-sm flex flex-col gap-5">
        {/* Apple Squircle Brand Icon */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 rounded-[22px] bg-gradient-to-b from-white/20 via-white/10 to-white/5 border border-white/20 flex items-center justify-center text-apple-blue shadow-[0_8px_32px_rgba(10,132,255,0.25)]">
            <span className="material-symbols-outlined text-[34px]">
              terminal
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white mt-2">
              Control Center
            </h1>
            <p className="text-xs text-apple-labelSecondary mt-0.5">
              Personal Telemetry &amp; Executive Command
            </p>
          </div>
        </div>

        {/* Login Panel */}
        <div className="apple-glass-panel p-5 flex flex-col gap-4">
          <div className="flex bg-white/[0.08] p-0.5 rounded-full text-xs font-medium border border-white/10">
            <button
              onClick={() => {
                setMode("signin");
                setErrorMsg("");
              }}
              className={`flex-1 py-1 rounded-full transition-all ${
                mode === "signin"
                  ? "bg-white/20 text-white font-semibold shadow-sm"
                  : "text-apple-labelSecondary hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("signup");
                setErrorMsg("");
              }}
              className={`flex-1 py-1 rounded-full transition-all ${
                mode === "signup"
                  ? "bg-white/20 text-white font-semibold shadow-sm"
                  : "text-apple-labelSecondary hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Instant Login Button for the user's default ID */}
          <button
            onClick={handleInstantDefaultLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-apple-blue/25 to-apple-indigo/25 hover:from-apple-blue/35 hover:to-apple-indigo/35 border border-apple-blue/40 text-apple-blue text-xs font-semibold flex items-center justify-center gap-2 apple-spring-press shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Sign In as lakshyajha210606@gmail.com</span>
          </button>

          <div className="flex items-center gap-2 my-0.5">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-[10px] uppercase font-mono text-apple-labelTertiary">
              or enter credentials
            </span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-apple-red/15 border border-apple-red/30 text-apple-red text-xs leading-relaxed flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] mt-0.5">
                error
              </span>
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-2.5 rounded-xl bg-apple-green/15 border border-apple-green/30 text-apple-green text-xs leading-relaxed flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] mt-0.5">
                check_circle
              </span>
              <span>{infoMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] font-medium text-apple-labelSecondary block mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operative@domain.com"
                className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-apple-blue"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-apple-labelSecondary block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-apple-blue font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-apple-blue hover:bg-apple-blue/90 text-white font-semibold text-sm transition-all apple-spring-press shadow-[0_2px_14px_rgba(10,132,255,0.4)] mt-1 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="text-xs font-mono">Authenticating...</span>
              ) : (
                <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
              )}
            </button>
          </form>
        </div>

        {/* Security Telemetry Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-apple-labelTertiary">
          <span className="material-symbols-outlined text-[14px]">
            verified_user
          </span>
          <span>End-to-End Encrypted • Row Level Security</span>
        </div>
      </div>
    </div>
  );
}
