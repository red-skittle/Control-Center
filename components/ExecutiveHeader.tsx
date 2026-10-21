"use client";

import { UserProfile } from "../lib/storage/store";

interface ExecutiveHeaderProps {
  profile: UserProfile;
}

export function ExecutiveHeader({ profile }: ExecutiveHeaderProps) {
  const currentXpInLevel = profile.xp % 1000;
  const progressPct = Math.min(100, (currentXpInLevel / 1000) * 100);
  const xpNeeded = 1000 - currentXpInLevel;

  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between pt-1">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
            {todayStr}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white mt-0.5">
            Welcome back, {profile.displayName}
          </h1>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-medium tracking-wider uppercase text-neutral-400">
            Current Tier
          </span>
          <span className="text-xs font-mono font-semibold text-apple-blue mt-0.5">
            LVL {profile.level} · {profile.disciplineTitle}
          </span>
        </div>
      </div>

      {/* Level & XP Capsule */}
      <div className="apple-glass-panel p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-white">
              Total XP Earned
            </span>
          </div>
          <div className="text-[11px] font-mono text-neutral-300">
            <span className="text-white font-semibold">{profile.xp.toLocaleString()} XP</span>
            <span className="text-neutral-500"> ({currentXpInLevel} / 1,000 in Level {profile.level})</span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-apple-blue to-apple-green rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.max(4, progressPct)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>Real Telemetry Verified</span>
          <span className="text-apple-blue font-medium font-mono text-[10px]">
            +{xpNeeded} XP to Next Level
          </span>
        </div>
      </div>
    </section>
  );
}
