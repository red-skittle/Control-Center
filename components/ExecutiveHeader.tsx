"use client";

import { UserProfile } from "../lib/storage/store";

interface ExecutiveHeaderProps {
  profile: UserProfile;
}

export function ExecutiveHeader({ profile }: ExecutiveHeaderProps) {
  const currentXpInLevel = profile.xp % 10000;
  const progressPct = Math.min(100, (currentXpInLevel / 10000) * 100);
  const xpNeeded = 10000 - currentXpInLevel;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const hour = now.getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : "Good evening";

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between pt-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-apple-labelSecondary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-apple-blue shadow-[0_0_6px_rgba(10,132,255,0.8)]"></span>
            {dateFormatted}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white mt-0.5">
            {greeting}, {profile.displayName}
          </h1>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-apple-labelTertiary">
            Synchrony
          </span>
          <span className="text-xs font-mono font-semibold text-apple-blue flex items-center gap-0.5 bg-apple-blue/10 px-2 py-0.5 rounded-full border border-apple-blue/20 mt-0.5">
            <span className="material-symbols-outlined text-[13px]">bolt</span>
            {profile.synchronyMultiplier}x
          </span>
        </div>
      </div>

      {/* Level & XP Capsule */}
      <div className="apple-glass-panel p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[11px] font-mono font-semibold text-white border border-white/10">
              LVL {profile.level}
            </span>
            <span className="text-[13px] font-medium text-apple-labelSecondary">
              {profile.disciplineTitle}
            </span>
          </div>
          <div className="text-[11px] font-mono text-apple-labelSecondary">
            <span className="text-white font-semibold">{currentXpInLevel.toLocaleString()}</span>{" "}
            <span className="text-apple-labelTertiary">/ 10,000 XP</span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-apple-blue via-apple-indigo to-apple-purple rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(10,132,255,0.5)]"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-apple-labelTertiary">
          <span>Tier II Special Operative</span>
          <span className="text-apple-blue font-semibold font-mono text-[10px]">
            +{xpNeeded} XP to LVL {profile.level + 1}
          </span>
        </div>
      </div>
    </section>
  );
}
