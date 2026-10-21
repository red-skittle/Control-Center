"use client";

import { useState } from "react";
import { CodingProblemEntry } from "../lib/storage/store";

interface CodeforcesWidgetProps {
  problems: CodingProblemEntry[];
  onAddProblem: (problem: Omit<CodingProblemEntry, "id">) => void;
  onDeleteProblem?: (id: string) => void;
}

export function CodeforcesWidget({
  problems,
  onAddProblem,
  onDeleteProblem,
}: CodeforcesWidgetProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [contestId, setContestId] = useState("");
  const [problemIndex, setProblemIndex] = useState("C");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState("1600");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("C++20");
  const [notes, setNotes] = useState("");

  const cfProblems = problems.filter((p) => p.platform === "codeforces");

  // Determine current active rating from highest logged rating or fallback
  const highestRating = cfProblems.reduce(
    (max, p) => (p.rating && p.rating > max ? p.rating : max),
    1642
  );

  const getRankBadge = (r: number) => {
    if (r >= 2400) return { title: "Grandmaster", color: "text-apple-red bg-apple-red/15" };
    if (r >= 2100) return { title: "Master", color: "text-apple-orange bg-apple-orange/15" };
    if (r >= 1900) return { title: "Candidate Master", color: "text-apple-purple bg-apple-purple/15" };
    if (r >= 1600) return { title: "Expert", color: "text-apple-blue bg-apple-blue/15" };
    if (r >= 1400) return { title: "Specialist", color: "text-apple-green bg-apple-green/15" };
    return { title: "Pupil", color: "text-white/80 bg-white/10" };
  };

  const rank = getRankBadge(highestRating);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const fullProblemId = contestId.trim()
      ? `${contestId.trim()}${problemIndex.trim().toUpperCase()}`
      : problemIndex.trim().toUpperCase() || "CF";

    onAddProblem({
      platform: "codeforces",
      problemId: fullProblemId,
      title: title.trim(),
      difficulty: `CF ${rating}`,
      rating: parseInt(rating) || 1600,
      topicTags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      dateSolved: new Date().toISOString().slice(0, 10),
      language,
      notes: notes.trim(),
      status: "independent",
    });

    setTitle("");
    setContestId("");
    setTags("");
    setNotes("");
    setShowAddModal(false);
  };

  return (
    <section className="apple-glass-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-apple-purple shadow-[0_0_8px_rgba(191,90,242,0.8)]"></span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-labelSecondary">
            Codeforces Telemetry
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${rank.color}`}>
            {rank.title}
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-2.5 py-0.5 rounded-full bg-apple-purple/20 hover:bg-apple-purple/30 text-apple-purple text-[11px] font-medium border border-apple-purple/30 apple-spring-press flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">add</span>
            Log Problem
          </button>
        </div>
      </div>

      {/* Codeforces Rating & Stats Summary */}
      <div className="apple-glass-card p-3.5 flex flex-col justify-between">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white tracking-tight">
              {highestRating}
            </span>
            <span className="text-xs text-apple-green font-mono">(+48 delta)</span>
          </div>
          <span className="text-xs font-mono text-apple-labelSecondary">
            {cfProblems.length} Logged Solves
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-apple-labelTertiary font-mono mt-1 pt-1 border-t border-white/10">
          <span>Max Rating: {Math.max(highestRating, 1675)}</span>
          <span className="text-apple-blue flex items-center gap-1">● Div. 2 Virtual Cadence</span>
        </div>
      </div>

      {/* Solved Problems Feed */}
      <div className="flex flex-col gap-1.5 mt-0.5">
        {cfProblems.length === 0 ? (
          <div className="apple-glass-card p-4 text-center text-apple-labelTertiary text-xs flex flex-col items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-apple-labelTertiary">
              psychology
            </span>
            <span>No Codeforces problems logged yet. Click &quot;Log Problem&quot; to track your rounds.</span>
          </div>
        ) : (
          cfProblems.slice(0, 5).map((prob) => (
            <div
              key={prob.id}
              className="apple-glass-card p-2.5 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="px-1.5 py-0.5 rounded bg-apple-purple/15 text-apple-purple font-mono text-[9px] font-bold flex-shrink-0">
                  {prob.rating ? `CF ${prob.rating}` : prob.difficulty}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {prob.problemId ? `${prob.problemId}. ` : ""}
                    {prob.title}
                  </p>
                  <span className="text-[10px] text-apple-labelSecondary font-mono truncate block">
                    {prob.topicTags.join(" • ") || prob.language} • {prob.dateSolved}
                  </span>
                </div>
              </div>
              {onDeleteProblem && (
                <button
                  onClick={() => onDeleteProblem(prob.id)}
                  className="text-apple-labelTertiary hover:text-apple-red p-1"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Codeforces Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="apple-glass-panel p-5 max-w-sm w-full flex flex-col gap-3.5 border-apple-purple/50"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                Log Codeforces Problem
              </span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-apple-labelSecondary hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                  Contest #
                </label>
                <input
                  type="text"
                  placeholder="1941"
                  value={contestId}
                  onChange={(e) => setContestId(e.target.value)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-apple-purple"
                />
              </div>
              <div>
                <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                  Index
                </label>
                <input
                  type="text"
                  placeholder="E"
                  value={problemIndex}
                  onChange={(e) => setProblemIndex(e.target.value)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-apple-purple uppercase text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                  Rating
                </label>
                <input
                  type="number"
                  step="100"
                  placeholder="1600"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-apple-purple"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                Problem Title
              </label>
              <input
                type="text"
                required
                placeholder="Rudolf and the Ball Game"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-apple-purple"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                  Language
                </label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                  Topic Tags
                </label>
                <input
                  type="text"
                  placeholder="DP with Bitsets, Modulo"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                Solution Approach Notes
              </label>
              <textarea
                rows={2}
                placeholder="Bitset shift with circular modulo bitwise OR..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-apple-purple text-white font-semibold text-xs apple-spring-press shadow-sm"
            >
              Save Problem (+120 XP)
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
