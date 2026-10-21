"use client";

import React, { useState, useEffect } from "react";
import { CodingProblemEntry } from "../lib/storage/store";
import { Terminal, RefreshCw, Plus, ExternalLink, Trophy, Flame } from "lucide-react";

interface CodeforcesWidgetProps {
  problems: CodingProblemEntry[];
  onAddProblem: (problem: Omit<CodingProblemEntry, "id">) => void;
  savedHandle?: string;
  onUpdateHandle?: (handle: string) => void;
}

export function CodeforcesWidget({
  problems,
  onAddProblem,
  savedHandle = "",
  onUpdateHandle,
}: CodeforcesWidgetProps) {
  const [handle, setHandle] = useState(savedHandle || "tourist");
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [liveInfo, setLiveInfo] = useState<{
    handle: string;
    rating: number;
    maxRating: number;
    rank: string;
    maxRank: string;
    avatar?: string;
  } | null>(null);

  // Manual Log Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formProblemId, setFormProblemId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formRating, setFormRating] = useState("1600");
  const [formTags, setFormTags] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const cfProblems = problems.filter((p) => p.platform === "codeforces");

  const fetchTelemetry = async (handleToFetch: string) => {
    if (!handleToFetch.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/telemetry/codeforces?handle=${encodeURIComponent(handleToFetch.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Profile unreachable");
      } else {
        setLiveInfo({
          handle: data.handle,
          rating: data.rating,
          maxRating: data.maxRating,
          rank: data.rank,
          maxRank: data.maxRank,
          avatar: data.avatar,
        });
        if (onUpdateHandle) onUpdateHandle(handleToFetch.trim());
      }
    } catch {
      setErrorMsg("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (savedHandle) {
      setHandle(savedHandle);
      fetchTelemetry(savedHandle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedHandle]);

  const handleSaveHandle = () => {
    setIsEditingHandle(false);
    fetchTelemetry(handle);
  };

  const handleCreateSolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const ratingNum = parseInt(formRating) || 1600;
    const diffLabel = ratingNum >= 2000 ? "Hard" : ratingNum >= 1400 ? "Medium" : "Easy";

    onAddProblem({
      platform: "codeforces",
      problemId: formProblemId.trim() || String(Date.now()).slice(-4),
      title: formTitle.trim(),
      difficulty: diffLabel,
      rating: ratingNum,
      topicTags: formTags ? formTags.split(",").map((t) => t.trim()).filter(Boolean) : ["Competitive"],
      dateSolved: new Date().toISOString().slice(0, 10),
      language: "C++20",
      status: "independent",
      notes: formNotes.trim() || undefined,
      url: formProblemId ? `https://codeforces.com/problemset/problem/${formProblemId.replace(/[A-Za-z]+$/, "")}/${formProblemId.replace(/^[0-9]+/, "")}` : undefined,
    });

    setFormProblemId("");
    setFormTitle("");
    setFormNotes("");
    setFormTags("");
    setIsModalOpen(false);
  };

  const getRankColor = (rankName: string) => {
    const r = rankName.toLowerCase();
    if (r.includes("legendary") || r.includes("grandmaster")) return "text-red-500";
    if (r.includes("master")) return "text-amber-500";
    if (r.includes("candidate")) return "text-violet-400";
    if (r.includes("expert")) return "text-blue-400";
    if (r.includes("specialist")) return "text-cyan-400";
    if (r.includes("pupil")) return "text-emerald-400";
    return "text-neutral-400";
  };

  return (
    <div className="apple-glass-panel p-5 flex flex-col gap-4 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
              Codeforces Telemetry
              {liveInfo?.rank ? (
                <span className={`text-[10px] font-mono capitalize font-medium ${getRankColor(liveInfo.rank)}`}>
                  {liveInfo.rank}
                </span>
              ) : null}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
              {isEditingHandle ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="Codeforces handle"
                    className="bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-xs text-white outline-none font-mono"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveHandle}
                    className="text-apple-blue hover:text-white px-1 text-xs"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingHandle(true)}
                  className="hover:text-white transition-colors underline decoration-dotted font-mono text-[11px]"
                >
                  @{handle || "set_handle"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTelemetry(handle)}
            disabled={isLoading || !handle}
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
          <span className="text-[10px] text-neutral-400">Manual tracking active</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="apple-glass-card p-2.5 flex flex-col justify-center">
          <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Current Rating</span>
          <span className="text-xl font-bold font-mono text-apple-blue tabular-nums mt-0.5">
            {liveInfo ? liveInfo.rating : "--"}
          </span>
          <span className="text-[9px] text-neutral-500 mt-0.5">Live Contests</span>
        </div>
        <div className="apple-glass-card p-2.5 flex flex-col justify-center">
          <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">Peak Rating</span>
          <span className="text-xl font-bold font-mono text-amber-400 tabular-nums mt-0.5">
            {liveInfo ? liveInfo.maxRating : "--"}
          </span>
          <span className="text-[9px] text-neutral-500 mt-0.5">All-Time High</span>
        </div>
        <div className="apple-glass-card p-2.5 flex flex-col justify-center">
          <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Vault Solves</span>
          <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
            {cfProblems.length}
          </span>
          <span className="text-[9px] text-neutral-500 mt-0.5">Verified Logs</span>
        </div>
      </div>

      {/* Recent CF Problems */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
            Verified Problems ({cfProblems.length})
          </span>
        </div>

        {cfProblems.length === 0 ? (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center">
            <p className="text-xs text-neutral-400">No Codeforces problems logged yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-apple-blue hover:underline text-xs mt-1 font-medium inline-block"
            >
              Log your latest round solution
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
            {cfProblems.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="apple-glass-card p-2 flex items-center justify-between text-xs hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-400/10 text-blue-400">
                    {p.problemId}
                  </span>
                  <span className="text-white truncate font-medium">{p.title}</span>
                  {p.rating && (
                    <span className="text-[10px] font-mono text-neutral-400">
                      ★{p.rating}
                    </span>
                  )}
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
              <Trophy className="w-4 h-4 text-apple-blue" />
              Log Solved Codeforces Problem
            </h3>
            <form onSubmit={handleCreateSolve} className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] uppercase text-neutral-400 block mb-1">Index (e.g. 1941E)</label>
                  <input
                    type="text"
                    placeholder="1941E"
                    value={formProblemId}
                    onChange={(e) => setFormProblemId(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-apple-blue"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] uppercase text-neutral-400 block mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Rudolf and the Ball Game"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-apple-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase text-neutral-400 block mb-1">Rating</label>
                  <input
                    type="number"
                    step="100"
                    placeholder="1600"
                    value={formRating}
                    onChange={(e) => setFormRating(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-apple-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-neutral-400 block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="DP, Bitsets, Graphs"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-apple-blue"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-neutral-400 block mb-1">Approach / Invariant</label>
                <textarea
                  placeholder="e.g. Bitset bit shift with wrap-around using bitwise OR."
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
