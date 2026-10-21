"use client";

interface CommandLaunchpadProps {
  onTriggerAction: (action: "pomodoro" | "task" | "workout" | "code" | "note") => void;
}

export function CommandLaunchpad({ onTriggerAction }: CommandLaunchpadProps) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-labelSecondary">
          Quick Launchpad
        </span>
        <span className="text-[10px] font-mono text-apple-labelTertiary">⌘ + 1..5</span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        <button
          onClick={() => onTriggerAction("pomodoro")}
          className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full apple-glass-pill apple-spring-press text-white text-xs font-medium"
        >
          <span className="material-symbols-outlined text-[15px] text-apple-blue">
            timer
          </span>
          <span>Focus</span>
        </button>
        <button
          onClick={() => onTriggerAction("task")}
          className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full apple-glass-pill apple-spring-press text-white text-xs font-medium"
        >
          <span className="material-symbols-outlined text-[15px] text-apple-green">
            add_task
          </span>
          <span>Task</span>
        </button>
        <button
          onClick={() => onTriggerAction("workout")}
          className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full apple-glass-pill apple-spring-press text-white text-xs font-medium"
        >
          <span className="material-symbols-outlined text-[15px] text-apple-orange">
            exercise
          </span>
          <span>Workout</span>
        </button>
        <button
          onClick={() => onTriggerAction("code")}
          className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full apple-glass-pill apple-spring-press text-white text-xs font-medium"
        >
          <span className="material-symbols-outlined text-[15px] text-apple-purple">
            code
          </span>
          <span>Solve LC</span>
        </button>
        <button
          onClick={() => onTriggerAction("note")}
          className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full apple-glass-pill apple-spring-press text-white text-xs font-medium"
        >
          <span className="material-symbols-outlined text-[15px] text-apple-labelSecondary">
            edit_note
          </span>
          <span>Daily Note</span>
        </button>
      </div>
    </section>
  );
}
