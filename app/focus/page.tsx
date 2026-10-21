"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useControlCenterStore } from "../../lib/storage/store";
import { TopHeader } from "../../components/TopHeader";
import { VisionDock } from "../../components/VisionDock";
import { calculatePomodoroRemaining } from "../../lib/fitness-calc";

interface CompletedSessionLog {
  id: string;
  subject: string;
  durationMinutes: number;
  completedAt: string;
}

export default function FocusPage() {
  const { profile, tasks } = useControlCenterStore();

  const [durationMinutes, setDurationMinutes] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [subject, setSubject] = useState("Distributed Cache Replication Spec");
  const [associatedTaskId, setAssociatedTaskId] = useState<string>("");
  const [completedSessions, setCompletedSessions] = useState<CompletedSessionLog[]>([
    {
      id: "cs-1",
      subject: "Red-Black Tree Amortized Proof",
      durationMinutes: 25,
      completedAt: "09:30 AM",
    },
    {
      id: "cs-2",
      subject: "LC #295 Data Stream Heap Rebalance",
      durationMinutes: 25,
      completedAt: "08:30 AM",
    },
  ]);

  const startTimestampRef = useRef<number | null>(null);
  const accumulatedPausedMsRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);

  const durationSeconds = durationMinutes * 60;

  useEffect(() => {
    if (!isRunning) return;

    if (!startTimestampRef.current) {
      startTimestampRef.current = Date.now();
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const calc = calculatePomodoroRemaining(
        startTimestampRef.current!,
        durationSeconds,
        now,
        accumulatedPausedMsRef.current
      );

      setRemainingSeconds(calc.remainingSeconds);

      if (calc.isCompleted) {
        setIsRunning(false);
        clearInterval(interval);
        setCompletedSessions((prev) => [
          {
            id: "cs-" + Date.now(),
            subject,
            durationMinutes,
            completedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          ...prev,
        ]);
        alert(`Session complete! +100 XP gained for focused execution on '${subject}'.`);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, durationSeconds, subject, durationMinutes]);

  const toggleTimer = () => {
    if (isRunning) {
      pauseStartRef.current = Date.now();
      setIsRunning(false);
    } else {
      if (pauseStartRef.current) {
        accumulatedPausedMsRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
      if (remainingSeconds <= 0) {
        setRemainingSeconds(durationSeconds);
        startTimestampRef.current = Date.now();
        accumulatedPausedMsRef.current = 0;
      }
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(durationSeconds);
    startTimestampRef.current = null;
    accumulatedPausedMsRef.current = 0;
    pauseStartRef.current = null;
  };

  const handleSelectPreset = (mins: number) => {
    setIsRunning(false);
    setDurationMinutes(mins);
    setRemainingSeconds(mins * 60);
    startTimestampRef.current = null;
    accumulatedPausedMsRef.current = 0;
  };

  const m = Math.floor(remainingSeconds / 60).toString().padStart(2, "0");
  const s = (remainingSeconds % 60).toString().padStart(2, "0");

  const progressFraction = durationSeconds > 0 ? remainingSeconds / durationSeconds : 0;
  const circumference = 440;
  const strokeOffset = circumference * (1 - progressFraction);

  return (
    <>
      <TopHeader profile={profile} />

      <main className="flex-col relative w-full pt-16 pb-28 bg-[#000000]">
        <div className="flex flex-col w-full max-w-lg mx-auto text-white px-4 pt-3 pb-8 gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-[11px] font-semibold uppercase tracking-wider text-apple-blue flex items-center gap-1 mb-1"
              >
                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                Dashboard
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Neural Focus Chamber
              </h1>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-apple-blue/15 text-apple-blue text-xs font-mono font-semibold border border-apple-blue/30">
              {completedSessions.length * 25}m Today
            </span>
          </div>

          {/* Large Radial Focus Ring HUD */}
          <section className="apple-glass-panel p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
            {/* Preset Selector */}
            <div className="flex bg-white/[0.08] p-1 rounded-full text-xs font-medium border border-white/10 gap-1">
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSelectPreset(mins)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    durationMinutes === mins
                      ? "bg-apple-blue text-white font-semibold shadow-sm"
                      : "text-apple-labelSecondary hover:text-white"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Circular Ring */}
            <div className="relative w-56 h-56 flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  className="text-white/10 fill-none"
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <circle
                  className={`fill-none transition-all duration-300 ${
                    isRunning ? "text-apple-blue" : "text-apple-labelSecondary"
                  }`}
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-mono text-4xl font-bold text-white tracking-tight">
                  {m}:{s}
                </span>
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider mt-1 ${
                    isRunning ? "text-apple-blue animate-pulse" : "text-apple-labelSecondary"
                  }`}
                >
                  {isRunning ? "DEEP FOCUS FLOW" : "STANDBY"}
                </span>
              </div>
            </div>

            {/* Focus Subject Input */}
            <div className="w-full max-w-sm flex flex-col gap-2">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What is your focus mission?"
                className="bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-center text-xs text-white font-medium focus:outline-none focus:border-apple-blue"
              />

              {/* Associate with Task */}
              <select
                value={associatedTaskId}
                onChange={(e) => setAssociatedTaskId(e.target.value)}
                className="bg-white/[0.08] border border-white/15 rounded-xl px-3 py-1.5 text-center text-xs text-apple-labelSecondary focus:outline-none"
              >
                <option value="" className="bg-black">Link to Task Objective (Optional)</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-black">
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Controls */}
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={toggleTimer}
                className="px-6 py-2.5 rounded-full bg-apple-blue text-white text-sm font-semibold flex items-center gap-2 apple-spring-press shadow-[0_2px_16px_rgba(10,132,255,0.5)]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isRunning ? "pause" : "play_arrow"}
                </span>
                <span>{isRunning ? "Pause Session" : "Enter Deep Focus"}</span>
              </button>
              <button
                onClick={resetTimer}
                className="w-10 h-10 rounded-full apple-glass-pill apple-spring-press text-apple-labelSecondary hover:text-white flex items-center justify-center"
                title="Reset timer"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              </button>
            </div>
          </section>

          {/* Focus Sessions History */}
          <section className="apple-glass-panel p-4 flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-apple-labelSecondary">
              Completed Focus Blocks Today ({completedSessions.length})
            </span>
            <div className="flex flex-col gap-2">
              {completedSessions.map((cs) => (
                <div
                  key={cs.id}
                  className="apple-glass-card p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-apple-blue/15 text-apple-blue flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{cs.subject}</p>
                      <span className="text-[10px] text-apple-labelSecondary font-mono">
                        {cs.durationMinutes} minutes • Logged {cs.completedAt}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-apple-green font-medium">
                    +100 XP
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <VisionDock />
    </>
  );
}
