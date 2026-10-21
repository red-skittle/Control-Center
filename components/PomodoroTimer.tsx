"use client";

import { useState, useEffect, useRef } from "react";
import { calculatePomodoroRemaining } from "../lib/fitness-calc";

export function PomodoroTimer() {
  const [mode, setMode] = useState<"focus" | "short" | "long">("focus");
  const [durationSeconds, setDurationSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(21 * 60 + 33); // Initial Stitch baseline: 21:33
  const [subject, setSubject] = useState("Red-Black Tree in C++");
  const [subtopic, setSubtopic] = useState("Module 4: Rebalancing rotations & amortized proof");
  const [statusText, setStatusText] = useState<"ACTIVE" | "PAUSED" | "DONE" | "SKIPPED">("PAUSED");

  const startTimestampRef = useRef<number | null>(null);
  const accumulatedPausedMsRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);

  // Switch modes
  const handleSetMode = (newMode: "focus" | "short" | "long") => {
    setMode(newMode);
    let dur = 25 * 60;
    if (newMode === "short") dur = 5 * 60;
    if (newMode === "long") dur = 15 * 60;
    setDurationSeconds(dur);
    setRemainingSeconds(dur);
    setIsRunning(false);
    setStatusText("PAUSED");
    startTimestampRef.current = null;
    accumulatedPausedMsRef.current = 0;
  };

  // Timer tick effect using requestAnimationFrame or 500ms intervals
  useEffect(() => {
    if (!isRunning) return;

    if (!startTimestampRef.current) {
      // Start time calculated so current remaining time is preserved
      const elapsedSoFar = durationSeconds - remainingSeconds;
      startTimestampRef.current = Date.now() - elapsedSoFar * 1000;
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
        setStatusText("DONE");
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, durationSeconds, remainingSeconds]);

  const togglePlay = () => {
    if (isRunning) {
      // Pause
      pauseStartRef.current = Date.now();
      setIsRunning(false);
      setStatusText("PAUSED");
    } else {
      // Resume / Start
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
      setStatusText("ACTIVE");
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(durationSeconds);
    setStatusText("PAUSED");
    startTimestampRef.current = null;
    accumulatedPausedMsRef.current = 0;
    pauseStartRef.current = null;
  };

  const skipTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(0);
    setStatusText("SKIPPED");
  };

  // Progress circle geometry
  const circumference = 264;
  const progressRatio = durationSeconds > 0 ? remainingSeconds / durationSeconds : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const formatMinutes = Math.floor(remainingSeconds / 60).toString().padStart(2, "0");
  const formatSecs = (remainingSeconds % 60).toString().padStart(2, "0");

  return (
    <section className="apple-glass-panel p-4 flex flex-col gap-3 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-apple-blue shadow-[0_0_8px_rgba(10,132,255,0.9)]"></span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-labelSecondary">
            Neural Focus Engine
          </span>
        </div>
        {/* Mode Tabs Segmented Control */}
        <div className="flex bg-white/[0.08] p-0.5 rounded-full text-xs font-medium border border-white/10">
          <button
            onClick={() => handleSetMode("focus")}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              mode === "focus"
                ? "bg-white/20 text-white shadow-sm font-semibold"
                : "text-apple-labelSecondary hover:text-white"
            }`}
          >
            25m
          </button>
          <button
            onClick={() => handleSetMode("short")}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              mode === "short"
                ? "bg-white/20 text-white shadow-sm font-semibold"
                : "text-apple-labelSecondary hover:text-white"
            }`}
          >
            5m
          </button>
          <button
            onClick={() => handleSetMode("long")}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              mode === "long"
                ? "bg-white/20 text-white shadow-sm font-semibold"
                : "text-apple-labelSecondary hover:text-white"
            }`}
          >
            15m
          </button>
        </div>
      </div>

      {/* Radial Apple Watch Ring + Info */}
      <div className="flex items-center gap-4 py-1">
        {/* Apple Watch Ring */}
        <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
          <svg
            className={`w-full h-full -rotate-90 ${isRunning ? "pomo-ring-active" : ""}`}
            viewBox="0 0 100 100"
          >
            <circle
              className="text-white/10 fill-none"
              cx="50"
              cy="50"
              r="42"
              stroke="currentColor"
              strokeWidth="5.5"
            />
            <circle
              className="fill-none transition-all duration-300"
              cx="50"
              cy="50"
              r="42"
              stroke="#0A84FF"
              strokeDasharray="264"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="5.5"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-mono text-[17px] font-bold text-white tracking-tight">
              {formatMinutes}:{formatSecs}
            </span>
            <span
              className={`text-[9px] font-semibold uppercase tracking-wider ${
                statusText === "ACTIVE"
                  ? "text-apple-blue"
                  : statusText === "DONE"
                  ? "text-apple-green"
                  : "text-apple-labelSecondary"
              }`}
            >
              {statusText}
            </span>
          </div>
        </div>

        {/* Current Subject & Controls */}
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-apple-labelTertiary">
            Current Focus Subject
          </span>
          <h2 className="text-sm font-semibold text-white truncate mt-0.5">
            {subject}
          </h2>
          <p className="text-xs text-apple-labelSecondary truncate mt-0.5">
            {subtopic}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={togglePlay}
              className="px-3.5 py-1.5 rounded-full bg-apple-blue text-white text-xs font-semibold flex items-center gap-1.5 apple-spring-press shadow-[0_2px_12px_rgba(10,132,255,0.4)]"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isRunning ? "pause" : "play_arrow"}
              </span>
              <span>{isRunning ? "Pause" : remainingSeconds < durationSeconds ? "Resume" : "Start"}</span>
            </button>
            <button
              aria-label="Reset Timer"
              onClick={resetTimer}
              className="w-7 h-7 rounded-full apple-glass-pill apple-spring-press text-apple-labelSecondary hover:text-white flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[15px]">
                restart_alt
              </span>
            </button>
            <button
              aria-label="Skip Session"
              onClick={skipTimer}
              className="w-7 h-7 rounded-full apple-glass-pill apple-spring-press text-apple-labelSecondary hover:text-white flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[15px]">
                skip_next
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
