"use client";

import { useState } from "react";
import { TaskItem } from "../lib/storage/store";

interface ExecutionEngineProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, priority?: "low" | "medium" | "high", category?: string) => void;
  onDeleteTask?: (id: string) => void;
}

export function ExecutionEngine({
  tasks,
  onToggleTask,
  onAddTask,
}: ExecutionEngineProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [newTitle, setNewTitle] = useState("");

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.isCompleted;
    if (filter === "completed") return t.isCompleted;
    return true;
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTitle.trim()) {
      onAddTask(newTitle.trim());
      setNewTitle("");
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category.toUpperCase()) {
      case "FITNESS":
        return "bg-apple-green/15 text-apple-green";
      case "ALGO":
        return "bg-apple-purple/15 text-apple-purple";
      case "HABIT":
        return "bg-apple-blue/15 text-apple-blue";
      case "HIGH PRIORITY":
      case "URGENT":
        return "bg-apple-red/15 text-apple-red";
      case "COMPETITIVE":
        return "bg-apple-orange/15 text-apple-orange";
      default:
        return "bg-white/15 text-apple-labelSecondary";
    }
  };

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-labelSecondary">
            Execution Engine
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-apple-labelSecondary">
            {tasks.length}
          </span>
        </div>
        {/* Filter Tabs */}
        <div className="flex bg-white/[0.08] p-0.5 rounded-full text-xs border border-white/10">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              filter === "all"
                ? "bg-white/20 text-white font-medium shadow-sm"
                : "text-apple-labelSecondary hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              filter === "pending"
                ? "bg-white/20 text-white font-medium shadow-sm"
                : "text-apple-labelSecondary hover:text-white"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              filter === "completed"
                ? "bg-white/20 text-white font-medium shadow-sm"
                : "text-apple-labelSecondary hover:text-white"
            }`}
          >
            Done
          </button>
        </div>
      </div>

      {/* Quick Add Field */}
      <div className="apple-glass-card px-3.5 py-2.5 flex items-center gap-2.5 focus-within:border-apple-blue/70 transition-colors">
        <span className="material-symbols-outlined text-[18px] text-apple-labelTertiary">
          add
        </span>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add actionable micro-objective..."
          className="bg-transparent text-sm text-white placeholder-apple-labelTertiary outline-none w-full min-w-0 font-normal"
        />
        <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-apple-labelSecondary border border-white/10">
          ↵
        </kbd>
      </div>

      {/* Task List Items */}
      <div className="flex flex-col gap-2 mt-0.5">
        {filteredTasks.length === 0 ? (
          <div className="apple-glass-card p-4 text-center text-apple-labelTertiary text-xs">
            No tasks found in this view.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="apple-glass-card p-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all apple-spring-press ${
                    task.isCompleted
                      ? "bg-apple-green text-black shadow-sm"
                      : "border border-white/30 hover:border-apple-blue text-transparent hover:text-apple-blue"
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px] font-bold">
                    check
                  </span>
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[13px] truncate ${
                      task.isCompleted
                        ? "text-apple-labelSecondary line-through font-normal"
                        : "text-white font-normal"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                    <span
                      className={`px-1.5 py-0.2 rounded font-medium ${getCategoryBadgeClass(
                        task.category
                      )}`}
                    >
                      {task.category}
                    </span>
                    {task.scheduledTime && (
                      <span className="font-mono text-apple-labelTertiary">
                        {task.scheduledTime}
                      </span>
                    )}
                    <span className="font-mono text-apple-labelTertiary">
                      +{task.xpReward} XP
                    </span>
                    {task.subtasks.length > 0 && (
                      <span className="text-apple-labelTertiary">
                        {task.subtasks.filter((s) => s.completed).length}/
                        {task.subtasks.length} subtasks
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span
                className={`material-symbols-outlined text-[16px] flex-shrink-0 ${
                  task.isCompleted ? "text-apple-green" : "text-white/20"
                }`}
              >
                {task.isCompleted ? "check_circle" : "circle"}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
