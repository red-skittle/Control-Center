"use client";

import React, { useState, useEffect } from "react";
import { CodingProblemEntry } from "../lib/storage/store";
import { Code2, RefreshCw, Plus, ExternalLink, Check, Award } from "lucide-react";

interface LeetCodeWidgetProps {
  problems: CodingProblemEntry[];
  onAddProblem: (problem: Omit<CodingProblemEntry, "id">) => void;
  savedUsername?: string;
  onUpdateUsername?: (username: string) => void;
}

export function LeetCodeWidget({
  problems,
  onAddProblem,
  savedUsername = "",
  onUpdateUsername,
}: LeetCodeWidgetProps) {
  const [username, setUsername] = useState(savedUsername || "lakshyajha");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [liveStats, setLiveStats] = useState<{
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    ranking?: number;
  } | null>(null);

  // Manual Log Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formNumber, setFormNumber] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDifficulty, setFormDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [formTags, setFormTags] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const leetcodeProblems = problems.filter((p) => p.platform === "leetcode");
  const localTotal = leetcodeProblems.length;
  const localEasy = leetcodeProblems.filter((p) => p.difficulty === "Easy").length;
  const localMed = leetcodeProblems.filter((p) => p.difficulty === "Medium").length;
  const localHard = leetcodeProblems.filter((p) => p.difficulty === "Hard").length;

  // Fetch live stats when username is set
  const fetchTelemetry = async (userToFetch: string) => {
    if (!userToFetch.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/telemetry/leetcode?username=${encodeURIComponent(userToFetch.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Profile unreachable");
      } else {
        setLiveStats({
          totalSolved: data.totalSolved,
          easySolved: data.easySolved,
          mediumSolved: data.mediumSolved,
          hardSolved: data.hardSolved,
          ranking: data.ranking,
        });
        if (onUpdateUsername) onUpdateUsername(userToFetch.trim());
      }
    } catch {
      setErrorMsg("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (savedUsername) {
      setUsername(savedUsername);
      fetchTelemetry(savedUsername);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedUsername]);

  const handleSaveUsername = () => {
    setIsEditingUsername(false);
    fetchTelemetry(username);
  };

  const handleCreateSolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    onAddProblem({
      platform: "leetcode",
      problemId: formNumber.trim() || String(Date.now()).slice(-4),
      title: formTitle.trim(),
      difficulty: formDifficulty,
      topicTags: formTags ? formTags.split(",").map((t) => t.trim()).filter(Boolean) : ["Algorithms"],
      dateSolved: new Date().toISOString().slice(0, 10),
      language: "C++",
      status: "independent",
      notes: formNotes.trim() || undefined,
      url: formNumber ? `https://leetcode.com/problems/${formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/` : undefined,
    });

    setFormNumber("");
    setFormTitle("");
    setFormNotes("");
    setFormTags("");
    setIsModalOpen(false);
  };

  const displayTotal = liveStats ? liveStats.totalSolved : localTotal;
  const displayEasy = liveStats ? liveStats.easySolved : localEasy;
  const displayMed = liveStats ? liveStats.mediumSolved : localMed;
  const displayHard = liveStats ? liveStats.hardSolved : localHard;

  return (
    <div className="apple-glass-panel p-5 flex flex-col gap-4 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
              LeetCode Telemetry
              {liveStats?.ranking ? (
                <span className="text-[10px] font-mono text-neutral-400 font-normal">
                  Rank #{liveStats.ranking.toLocaleString()}
                </span>
              ) : null}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
              {isEditingUsername ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="LeetCode username"
                    className="bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-xs text-white outline-none font-mono"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveUsername}
                    className="text-apple-blue hover:text-white px-1 text-xs"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="hover:text-white transition-colors underline decoration-dotted font-mono text-[11px]"
                >
                  @{username || "set_handle"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTelemetry(username)}
            disabled={isLoading || !username}
            title="Fetch Live Stats"
            className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 flex items-center justify-center transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-apple-blue" : ""}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <Plus className="w-3.5 h-3.5 text-apple-blue" />
            <span>Log Solve</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="text-[11px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <span className="text-[10px] text-neutral-400">Using verified logs</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="apple-glass-card p-2.5 flex flex-col justify-center">
          <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Solved</span>
          <span className="text-xl font-bold font-mono text-white tabular-nums mt-0.5">
            {displayTotal}
          </span>
          <span className="text-[9px] text-neutral-500 mt-0.5">Problems</span>
        </div>
        <div className="apple-glass-card p-2.5 flex flex-col justify-center">
          <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Easy</span>
          <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
            {displayEasy}
          </span>
          <span className="text-[9px] text-neutral-500 mt-0.5">Fundamentals</span>
        </div>
        <div className="apple-glass-card p-2.5 flex flex-col justify-center">
          <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">Medium</span>
          <span className="text-xl font-bold font-mono text-amber-400 tabular-nums mt-0.5">
            {displayMed}
          </span>
          <span className="text-[9px] text-neutral-500 mt-0.5">Core DP/Graphs</span>
        </div>
        <div className="apple-glass-card p-2.5 flex flex-col justify-center">
          <span className="text-[10px] font-medium text-red-400 uppercase tracking-wider">Hard</span>
          <span className="text-xl font-bold font-mono text-red-400 tabular-nums mt-0.5">
            {displayHard}
          </span>
          <span className="text-[9px] text-neutral-500 mt-0.5">Competitive</span>
        </div>
      </div>

      {/* Recent Solves List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
            Verified Log History ({leetcodeProblems.length})
          </span>
        </div>

        {leetcodeProblems.length === 0 ? (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center">
            <p className="text-xs text-neutral-400">No problems logged in your vault yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-apple-blue hover:underline text-xs mt-1 font-medium inline-block"
            >
              Log your first solved problem
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
            {leetcodeProblems.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="apple-glass-card p-2 flex items-center justify-between text-xs hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      p.difficulty === "Hard"
                        ? "text-red-400 bg-red-400/10"
                        : p.difficulty === "Medium"
                        ? "text-amber-400 bg-amber-400/10"
                        : "text-emerald-400 bg-emerald-400/10"
                    }`}
                  >
                    #{p.problemId}
                  </span>
                  <span className="text-white truncate font-medium">{p.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] text-neutral-400">
                  <span>{p.dateSolved}</span>
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-white"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Problem Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="apple-glass-panel max-w-md w-full p-5 border border-white/20 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-apple-blue" />
              Log Solved LeetCode Problem
            </h3>
            <form onSubmit={handleCreateSolve} className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] uppercase text-neutral-400 block mb-1">Problem #</label>
                  <input
                    type="text"
                    placeholder="e.g. 295"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-apple-blue"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] uppercase text-neutral-400 block mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Find Median from Data Stream"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-apple-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase text-neutral-400 block mb-1">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-apple-blue"
                  >
                    <option value="Easy">Easy (+50 XP)</option>
                    <option value="Medium">Medium (+100 XP)</option>
                    <option value="Hard">Hard (+150 XP)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-neutral-400 block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Heap, Two Pointers"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-apple-blue"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-neutral-400 block mb-1">Key Takeaway / Invariant</label>
                <textarea
                  placeholder="e.g. Balanced max-heap on lower half, min-heap on upper half."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-apple-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-apple-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
                >
                  Record Solve (+XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
