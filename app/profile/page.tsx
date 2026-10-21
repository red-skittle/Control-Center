"use client";

import { useState } from "react";
import Link from "next/link";
import { useControlCenterStore } from "../../lib/storage/store";
import { TopHeader } from "../../components/TopHeader";
import { VisionDock } from "../../components/VisionDock";

export default function ProfilePage() {
  const { profile, updateProfile, bodyweightLogs, addBodyweightLog, deleteBodyweightLog } =
    useControlCenterStore();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [heightCm, setHeightCm] = useState(profile.heightCm);
  const [currentBw, setCurrentBw] = useState(profile.currentBodyweightKg);
  const [preferredUnits, setPreferredUnits] = useState(profile.preferredUnits);
  const [age, setAge] = useState(profile.age || 24);
  const [biologicalSex, setBiologicalSex] = useState(profile.biologicalSex || "male");
  const [bodyFatPct, setBodyFatPct] = useState(profile.bodyFatPct || 13.5);
  const [restingHr, setRestingHr] = useState(profile.restingHr || 52);
  const [trainingExperience, setTrainingExperience] = useState(profile.trainingExperience);
  const [weeklyWorkoutTarget, setWeeklyWorkoutTarget] = useState(profile.weeklyWorkoutTarget);
  const [weeklyRunningTargetKm, setWeeklyRunningTargetKm] = useState(profile.weeklyRunningTargetKm);
  const [timezone, setTimezone] = useState(profile.timezone);
  const [weekStartDay, setWeekStartDay] = useState(profile.weekStartDay);
  const [notes, setNotes] = useState(profile.notes || "");

  // New weight log form
  const [newLogWeight, setNewLogWeight] = useState(profile.currentBodyweightKg.toString());
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [newLogNote, setNewLogNote] = useState("");
  const [saveNotification, setSaveNotification] = useState(false);

  // Calculate descriptive BMI: weight (kg) / (height (m) ^ 2)
  const heightM = heightCm > 0 ? heightCm / 100 : 0;
  const bmi = heightM > 0 ? (currentBw / (heightM * heightM)).toFixed(1) : "--";

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName,
      avatarInitials: displayName.slice(0, 2).toUpperCase(),
      heightCm: Number(heightCm),
      currentBodyweightKg: Number(currentBw),
      preferredUnits,
      age: Number(age),
      biologicalSex,
      bodyFatPct: Number(bodyFatPct),
      restingHr: Number(restingHr),
      trainingExperience,
      weeklyWorkoutTarget: Number(weeklyWorkoutTarget),
      weeklyRunningTargetKm: Number(weeklyRunningTargetKm),
      timezone,
      weekStartDay: Number(weekStartDay),
      notes,
    });
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 2500);
  };

  const handleAddWeightLog = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newLogWeight);
    if (w > 0 && newLogDate) {
      addBodyweightLog(w, newLogDate, newLogNote);
      setCurrentBw(w);
      setNewLogNote("");
    }
  };

  return (
    <>
      <TopHeader profile={profile} />

      <main className="flex-col relative w-full pt-16 pb-28 bg-[#000000]">
        <div className="flex flex-col w-full max-w-lg mx-auto text-white px-4 pt-3 pb-8 gap-5">
          {/* Header Title */}
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
                Profile & Bio-Telemetry
              </h1>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-apple-blue/15 text-apple-blue text-xs font-mono font-semibold border border-apple-blue/30">
              OPERATIVE #{profile.level}
            </span>
          </div>

          {saveNotification && (
            <div className="apple-glass-card p-3 border-apple-green/50 bg-apple-green/10 text-apple-green text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Profile and measurement configuration saved successfully.
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="apple-glass-card p-3 text-center">
              <span className="text-[10px] text-apple-labelTertiary block uppercase">Bodyweight</span>
              <span className="text-lg font-mono font-semibold text-white">
                {currentBw} <span className="text-xs font-normal text-apple-labelSecondary">kg</span>
              </span>
              <span className="text-[9px] text-apple-labelTertiary block mt-0.5">Primary Anchor</span>
            </div>
            <div className="apple-glass-card p-3 text-center">
              <span className="text-[10px] text-apple-labelTertiary block uppercase">Height</span>
              <span className="text-lg font-mono font-semibold text-white">
                {heightCm} <span className="text-xs font-normal text-apple-labelSecondary">cm</span>
              </span>
              <span className="text-[9px] text-apple-labelTertiary block mt-0.5">Stable</span>
            </div>
            <div className="apple-glass-card p-3 text-center">
              <span className="text-[10px] text-apple-labelTertiary block uppercase">BMI (Descriptive)</span>
              <span className="text-lg font-mono font-semibold text-apple-blue">{bmi}</span>
              <span className="text-[9px] text-apple-labelTertiary block mt-0.5">Non-diagnostic</span>
            </div>
          </div>

          {/* Core Profile Form */}
          <form onSubmit={handleSaveProfile} className="apple-glass-panel p-4 flex flex-col gap-3.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-apple-labelSecondary border-b border-white/10 pb-2">
              Identity & Anthropometrics
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-apple-labelSecondary block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-apple-blue"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-apple-labelSecondary block mb-1">
                  Preferred Units
                </label>
                <select
                  value={preferredUnits}
                  onChange={(e) => setPreferredUnits(e.target.value as "metric" | "imperial")}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-apple-blue"
                >
                  <option value="metric" className="bg-black">Metric (kg, cm, km)</option>
                  <option value="imperial" className="bg-black">Imperial (lbs, in, mi)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-apple-labelSecondary block mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-apple-blue font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-apple-labelSecondary block mb-1">
                  Current Bodyweight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentBw}
                  onChange={(e) => setCurrentBw(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-apple-blue font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-apple-labelSecondary block mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-apple-blue font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-apple-labelSecondary block mb-1">
                  Sex (Standards)
                </label>
                <select
                  value={biologicalSex}
                  onChange={(e) => setBiologicalSex(e.target.value as any)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-apple-blue"
                >
                  <option value="male" className="bg-black">Male</option>
                  <option value="female" className="bg-black">Female</option>
                  <option value="unspecified" className="bg-black">Unspecified</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-apple-labelSecondary block mb-1">
                  Body Fat %
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={bodyFatPct}
                  onChange={(e) => setBodyFatPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-apple-blue font-mono"
                />
              </div>
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-apple-labelSecondary border-b border-white/10 pb-2 pt-2">
              Discipline & Training Targets
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-apple-labelSecondary block mb-1">
                  Training Experience
                </label>
                <select
                  value={trainingExperience}
                  onChange={(e) => setTrainingExperience(e.target.value as any)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-apple-blue"
                >
                  <option value="beginner" className="bg-black">Beginner (&lt;1 yr)</option>
                  <option value="intermediate" className="bg-black">Intermediate (1-3 yrs)</option>
                  <option value="advanced" className="bg-black">Advanced (3-5+ yrs)</option>
                  <option value="custom" className="bg-black">Custom Protocol</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-apple-labelSecondary block mb-1">
                  Workouts Target (d/wk)
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={weeklyWorkoutTarget}
                  onChange={(e) => setWeeklyWorkoutTarget(parseInt(e.target.value) || 4)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-apple-blue font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-apple-labelSecondary block mb-1">
                  Weekly Running Target (km)
                </label>
                <input
                  type="number"
                  step="1"
                  value={weeklyRunningTargetKm}
                  onChange={(e) => setWeeklyRunningTargetKm(parseFloat(e.target.value) || 15)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-apple-blue font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-apple-labelSecondary block mb-1">
                  Resting Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={restingHr}
                  onChange={(e) => setRestingHr(parseInt(e.target.value) || 50)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-apple-blue font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-apple-labelSecondary block mb-1">
                Training Limitations & Custom Directives
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-apple-blue leading-relaxed"
                placeholder="Specific protocols, current deload cycle, or notes..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-apple-blue hover:bg-apple-blue/90 text-white font-semibold text-sm transition-all apple-spring-press shadow-[0_2px_12px_rgba(10,132,255,0.4)]"
            >
              Save Profile & Recalculate Metrics
            </button>
          </form>

          {/* Bodyweight History & Log Manager */}
          <section className="apple-glass-panel p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-apple-labelSecondary">
                Bodyweight Progression History
              </span>
              <span className="text-[11px] font-mono text-apple-blue">
                {bodyweightLogs.length} Records Logged
              </span>
            </div>

            {/* Quick Log Row */}
            <form onSubmit={handleAddWeightLog} className="flex gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="Weight kg"
                value={newLogWeight}
                onChange={(e) => setNewLogWeight(e.target.value)}
                className="w-28 bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-apple-blue"
              />
              <input
                type="date"
                value={newLogDate}
                onChange={(e) => setNewLogDate(e.target.value)}
                className="w-36 bg-white/[0.08] border border-white/15 rounded-xl px-2 py-2 text-xs font-mono text-white focus:outline-none focus:border-apple-blue"
              />
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-apple-green text-black font-semibold text-xs apple-spring-press"
              >
                + Log
              </button>
            </form>

            {/* Historical Entries */}
            <div className="flex flex-col gap-2 mt-1">
              {bodyweightLogs.map((log) => (
                <div
                  key={log.id}
                  className="apple-glass-card p-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-white">
                      {log.weightKg} kg
                    </span>
                    <span className="text-[11px] text-apple-labelTertiary font-mono">
                      {log.recordedDate}
                    </span>
                    {log.notes && (
                      <span className="text-[11px] text-apple-labelSecondary">
                        • {log.notes}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteBodyweightLog(log.id)}
                    className="text-apple-labelTertiary hover:text-apple-red transition-colors"
                    title="Delete entry"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
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
