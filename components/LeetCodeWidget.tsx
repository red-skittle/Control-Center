"use client";

import { useState } from "react";
import { CodingProblemEntry } from "../lib/storage/store";

interface LeetCodeWidgetProps {
  problems: CodingProblemEntry[];
  onAddProblem: (problem: Omit<CodingProblemEntry, "id">) => void;
  onDeleteProblem?: (id: string) => void;
}

export function LeetCodeWidget({
  problems,
  onAddProblem,
  onDeleteProblem,
}: LeetCodeWidgetProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [problemNumber, setProblemNumber] = useState("");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("C++20");
  const [notes, setNotes] = useState("");

  const lcProblems = problems.filter((p) => p.platform === "leetcode");

  const easyCount = lcProblems.filter((p) => p.difficulty.toLowerCase() === "easy").length;
  const medCount = lcProblems.filter((p) => p.difficulty.toLowerCase() === "medium").length;
  const hardCount = lcProblems.filter((p) => p.difficulty.toLowerCase() === "hard").length;
  const totalCount = easyCount + medCount + hardCount;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddProblem({
      platform: "leetcode",
      problemId: problemNumber.trim() || String(Date.now()).slice(-4),
      title: title.trim(),
      difficulty,
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
    setProblemNumber("");
    setTags("");
    setNotes("");
    setShowAddModal(false);
  };

  return (
    <section className="apple-glass-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-apple-orange shadow-[0_0_8px_rgba(255,159,10,0.8)]"></span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-labelSecondary">
            LeetCode Telemetry
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-white">
            {totalCount} <span className="text-apple-labelSecondary font-normal">Solved</span>
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-2.5 py-0.5 rounded-full bg-apple-blue/20 hover:bg-apple-blue/30 text-apple-blue text-[11px] font-medium border border-apple-blue/30 apple-spring-press flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">add</span>
            Log Problem
          </button>
        </div>
      </div>

      {/* Segmented Breakdown Bar */}
      <div className="apple-glass-card p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-apple-labelSecondary">
          <span className="text-apple-green font-medium">Easy: {easyCount}</span>
          <span className="text-apple-orange font-medium">Med: {medCount}</span>
          <span className="text-apple-red font-medium">Hard: {hardCount}</span>
        </div>
        <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-white/10 p-[1px]">
          {totalCount === 0 ? (
            <div className="w-full h-full bg-white/10 rounded-full" />
          ) : (
            <>
              {easyCount > 0 && (
                <div
                  className="h-full rounded-full bg-apple-green"
                  style={{ flex: easyCount }}
                />
              )}
              {medCount > 0 && (
                <div
                  className="h-full rounded-full bg-apple-orange"
                  style={{ flex: medCount }}
                />
              )}
              {hardCount > 0 && (
                <div
                  className="h-full rounded-full bg-apple-red"
                  style={{ flex: hardCount }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Real Problems Solved Feed */}
      <div className="flex flex-col gap-1.5 mt-0.5">
        {lcProblems.length === 0 ? (
          <div className="apple-glass-card p-4 text-center text-apple-labelTertiary text-xs flex flex-col items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-apple-labelTertiary">
              code
            </span>
            <span>No LeetCode problems logged yet. Click &quot;Log Problem&quot; to add your real solutions.</span>
          </div>
        ) : (
          lcProblems.slice(0, 5).map((prob) => {
            const isHard = prob.difficulty.toLowerCase() === "hard";
            const isMed = prob.difficulty.toLowerCase() === "medium";

            return (
              <div
                key={prob.id}
                className="apple-glass-card p-2.5 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold flex-shrink-0 ${
                      isHard
                        ? "bg-apple-red/15 text-apple-red"
                        : isMed
                        ? "bg-apple-orange/15 text-apple-orange"
                        : "bg-apple-green/15 text-apple-green"
                    }`}
                  >
                    {prob.difficulty.toUpperCase()}
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
            );
          })
        )}
      </div>

      {/* Add Problem Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="apple-glass-panel p-5 max-w-sm w-full flex flex-col gap-3.5 border-apple-blue/50"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                Log LeetCode Solution
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
              <div className="col-span-1">
                <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                  Problem #
                </label>
                <input
                  type="text"
                  placeholder="295"
                  value={problemNumber}
                  onChange={(e) => setProblemNumber(e.target.value)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-apple-blue"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                  Problem Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Find Median from Data Stream"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-apple-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="Easy" className="bg-black">Easy</option>
                  <option value="Medium" className="bg-black">Medium</option>
                  <option value="Hard" className="bg-black">Hard</option>
                </select>
              </div>
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
            </div>

            <div>
              <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                Topic Tags (comma-separated)
              </label>
              <input
                type="text"
                placeholder="Heaps, Two Pointers, Binary Search"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                Approach Notes
              </label>
              <textarea
                rows={2}
                placeholder="Max-heap for lower half, min-heap for upper half..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-apple-green text-black font-semibold text-xs apple-spring-press shadow-sm"
            >
              Save Problem Record (+100 XP)
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
