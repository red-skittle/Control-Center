"use client";

import Link from "next/link";
import { UserProfile } from "../lib/storage/store";

interface TopHeaderProps {
  profile: UserProfile;
  onQuickAdd?: () => void;
  onOpenCommandMenu?: () => void;
  onLogout?: () => void;
}

export function TopHeader({
  profile,
  onQuickAdd,
  onOpenCommandMenu,
  onLogout,
}: TopHeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 apple-glass-header pt-safe transition-all">
      <div className="h-14 px-4 flex items-center justify-between max-w-lg mx-auto">
        <Link href="/profile" className="flex items-center gap-3 apple-spring-press">
          {/* Apple Squircle Avatar */}
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-b from-white/20 to-white/5 border border-white/20 flex items-center justify-center text-white shadow-sm font-semibold text-[13px] tracking-tight">
            {profile.avatarInitials}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[13px] font-semibold text-white tracking-tight">
                {profile.displayName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-apple-green shadow-[0_0_6px_rgba(48,209,88,0.8)]"></span>
              <span className="text-[11px] font-mono font-medium text-apple-green tracking-tight">
                {profile.disciplineRatio}%
              </span>
            </div>
            <span className="text-[10px] font-medium tracking-wider uppercase text-apple-labelTertiary mt-0.5">
              Tier II • {profile.disciplineTitle}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5">
          {onOpenCommandMenu && (
            <button
              aria-label="Command Menu"
              className="h-8 px-2.5 rounded-full apple-glass-pill apple-spring-press text-apple-labelSecondary hover:text-white flex items-center gap-1.5 text-xs"
              onClick={onOpenCommandMenu}
            >
              <span className="material-symbols-outlined text-[15px]">terminal</span>
              <kbd className="text-[9px] font-mono text-apple-labelTertiary">⌘K</kbd>
            </button>
          )}
          {onQuickAdd && (
            <button
              aria-label="Add Action"
              className="w-8 h-8 rounded-full apple-glass-pill apple-spring-press text-apple-blue flex items-center justify-center"
              onClick={onQuickAdd}
              title="Quick Log"
            >
              <span className="material-symbols-outlined text-[19px] font-medium">add</span>
            </button>
          )}
          {onLogout && (
            <button
              aria-label="Sign Out"
              className="w-8 h-8 rounded-full apple-glass-pill apple-spring-press text-apple-labelSecondary hover:text-apple-red flex items-center justify-center"
              onClick={onLogout}
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[17px]">logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
