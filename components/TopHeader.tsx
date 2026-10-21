"use client";

import Link from "next/link";
import { UserProfile } from "../lib/storage/store";
import { useAuth } from "../lib/auth/auth-context";
import { LogOut, Dumbbell, User } from "lucide-react";

interface TopHeaderProps {
  profile: UserProfile;
  onQuickAdd?: () => void;
  onOpenCommandMenu?: () => void;
}

export function TopHeader({
  profile,
}: TopHeaderProps) {
  const { logout, user } = useAuth();

  return (
    <header className="fixed top-0 w-full z-50 apple-glass-header pt-safe transition-all">
      <div className="h-14 px-4 flex items-center justify-between max-w-lg mx-auto">
        <Link href="/profile" className="flex items-center gap-2.5 apple-spring-press">
          {/* Apple Squircle Avatar */}
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-b from-white/20 to-white/5 border border-white/20 flex items-center justify-center text-white shadow-sm font-semibold text-[13px] tracking-tight">
            {profile.avatarInitials || user?.initials || "LJ"}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[13px] font-semibold text-white tracking-tight">
                {profile.displayName || user?.name || "Lakshya"}
              </span>
              <span className="text-neutral-500 font-normal">·</span>
              <span className="text-[11px] font-mono text-apple-blue font-medium">
                LVL {profile.level}
              </span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 mt-0.5 truncate max-w-[170px]">
              {user?.email || "lakshyajha210606@gmail.com"}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/fitness"
            title="Exercises & Workouts"
            className="h-8 px-2.5 rounded-xl apple-glass-pill apple-spring-press text-neutral-300 hover:text-white flex items-center gap-1.5 text-xs border border-white/10"
          >
            <Dumbbell className="w-3.5 h-3.5 text-apple-green" />
            <span className="hidden sm:inline font-medium">Exercises</span>
          </Link>

          <Link
            href="/profile"
            title="Profile & Bio-Telemetry"
            className="w-8 h-8 rounded-xl apple-glass-pill apple-spring-press text-neutral-300 hover:text-white flex items-center justify-center border border-white/10"
          >
            <User className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={logout}
            title="Log Out"
            className="w-8 h-8 rounded-xl apple-glass-pill apple-spring-press text-neutral-400 hover:text-red-400 flex items-center justify-center border border-white/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
