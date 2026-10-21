"use client";

import { useState } from "react";
import Link from "next/link";
import { useControlCenterStore, TaskItem } from "../../lib/storage/store";
import { TopHeader } from "../../components/TopHeader";
import { VisionDock } from "../../components/VisionDock";

export default function TasksPage() {
  const { profile, tasks, toggleTask, addTask, deleteTask } = useControlCenterStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // New task form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("FITNESS");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [scheduledTime, setScheduledTime] = useState("10:00 AM");

  const filteredTasks = tasks.filter((t) => {
    // Status
    if (statusFilter === "pending" && t.isCompleted) return false;
    if (statusFilter === "completed" && !t.isCompleted) return false;

    // Priority
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask(title.trim(), priority, category);
    setTitle("");
    setDescription("");
    setShowAddForm(false);
  };

  return (
    <>
      <TopHeader profile={profile} />

      <main className="flex-col relative w-full pt-16 pb-28 bg-[#000000]">
        <div className="flex flex-col w-full max-w-lg mx-auto text-white px-4 pt-3 pb-8 gap-4">
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
                Execution Task Engine
              </h1>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-full bg-apple-blue text-white text-xs font-semibold apple-spring-press flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              {showAddForm ? "Close" : "New Task"}
            </button>
          </div>

          {/* Detailed Add Task Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateTask}
              className="apple-glass-panel p-4 flex flex-col gap-3 border-apple-blue/50 animate-in fade-in"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-apple-labelSecondary">
                Create Actionable Objective
              </span>
              <input
                type="text"
                placeholder="Objective title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-apple-blue"
                autoFocus
              />
              <textarea
                placeholder="Context or notes (optional)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-apple-blue"
              />

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="FITNESS" className="bg-black">FITNESS</option>
                    <option value="ALGO" className="bg-black">ALGO</option>
                    <option value="HABIT" className="bg-black">HABIT</option>
                    <option value="HIGH PRIORITY" className="bg-black">HIGH PRIORITY</option>
                    <option value="COMPETITIVE" className="bg-black">COMPETITIVE</option>
                    <option value="GENERAL" className="bg-black">GENERAL</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="low" className="bg-black">Low</option>
                    <option value="medium" className="bg-black">Medium</option>
                    <option value="high" className="bg-black">High</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                    Schedule
                  </label>
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2 py-1.5 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-apple-green text-black font-semibold text-xs apple-spring-press mt-1"
              >
                Deploy Task (+60 XP)
              </button>
            </form>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col gap-2">
            <div className="apple-glass-card px-3 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-apple-labelTertiary">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search objectives, tags, categories..."
                className="bg-transparent text-xs text-white outline-none w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-apple-labelTertiary hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              {/* Status Segment */}
              <div className="flex bg-white/[0.08] p-0.5 rounded-full text-xs border border-white/10">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] transition-all ${
                    statusFilter === "all" ? "bg-white/20 text-white font-medium" : "text-apple-labelSecondary"
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] transition-all ${
                    statusFilter === "pending" ? "bg-white/20 text-white font-medium" : "text-apple-labelSecondary"
                  }`}
                >
                  Pending ({tasks.filter((t) => !t.isCompleted).length})
                </button>
                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] transition-all ${
                    statusFilter === "completed" ? "bg-white/20 text-white font-medium" : "text-apple-labelSecondary"
                  }`}
                >
                  Done ({tasks.filter((t) => t.isCompleted).length})
                </button>
              </div>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-white/[0.08] border border-white/10 rounded-full px-2.5 py-1 text-[11px] text-apple-labelSecondary focus:outline-none"
              >
                <option value="all" className="bg-black">All Priorities</option>
                <option value="high" className="bg-black">High</option>
                <option value="medium" className="bg-black">Medium</option>
                <option value="low" className="bg-black">Low</option>
              </select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="flex flex-col gap-2 mt-1">
            {filteredTasks.length === 0 ? (
              <div className="apple-glass-card p-6 text-center text-apple-labelTertiary text-xs">
                No matching objectives found.
              </div>
            ) : (
              filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="apple-glass-card p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleTask(t.id)}
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all apple-spring-press ${
                          t.isCompleted
                            ? "bg-apple-green text-black font-bold shadow-sm"
                            : "border border-white/30 text-transparent hover:border-apple-blue"
                        }`}
                      >
                        ✓
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium truncate ${
                            t.isCompleted
                              ? "text-apple-labelSecondary line-through font-normal"
                              : "text-white"
                          }`}
                        >
                          {t.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                          <span className="px-1.5 py-0.2 rounded bg-apple-blue/15 text-apple-blue font-medium">
                            {t.category}
                          </span>
                          {t.scheduledTime && (
                            <span className="font-mono text-apple-labelTertiary">
                              {t.scheduledTime}
                            </span>
                          )}
                          <span className="font-mono text-apple-labelTertiary">
                            +{t.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="text-apple-labelTertiary hover:text-apple-red transition-colors p-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>

                  {t.description && (
                    <p className="text-xs text-apple-labelSecondary ml-8 pl-0.5 leading-relaxed">
                      {t.description}
                    </p>
                  )}

                  {t.subtasks && t.subtasks.length > 0 && (
                    <div className="flex flex-col gap-1 ml-8 pl-0.5 mt-1 border-t border-white/10 pt-1.5">
                      {t.subtasks.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center gap-2 text-xs text-apple-labelSecondary"
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                              st.completed
                                ? "bg-apple-green text-black"
                                : "border border-white/20 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                          <span className={st.completed ? "line-through" : ""}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <VisionDock />
    </>
  );
}
