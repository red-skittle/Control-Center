"use client";

import { CalendarEventItem } from "../lib/storage/store";

interface ChronologicalProtocolProps {
  events: CalendarEventItem[];
}

export function ChronologicalProtocol({ events }: ChronologicalProtocolProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-labelSecondary">
          Chronological Protocol
        </span>
        <span className="text-[10px] font-mono text-apple-labelTertiary">UTC-4</span>
      </div>

      <div className="apple-glass-panel p-4 flex flex-col gap-3 relative">
        {/* Timeline Vertical Track */}
        <div className="absolute left-6 top-6 bottom-6 w-px bg-white/10 pointer-events-none"></div>

        {events.map((evt, idx) => {
          const isDone = evt.isCompleted;
          const isFocus = evt.eventType === "personal" && !isDone;
          const isContest = evt.eventType === "contest";

          return (
            <div key={evt.id || idx} className="flex items-start gap-3 relative">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 z-10 mt-1 shadow-sm ${
                  isDone
                    ? "bg-apple-green text-black"
                    : isFocus
                    ? "bg-apple-blue text-white shadow-[0_0_8px_rgba(10,132,255,0.8)]"
                    : "bg-white/10 border border-white/20 text-apple-labelSecondary"
                }`}
              >
                <span className="material-symbols-outlined text-[10px] font-bold">
                  {isDone ? "check" : isFocus ? "play_arrow" : isContest ? "code" : "menu_book"}
                </span>
              </div>
              <div
                className={`flex-1 min-w-0 apple-glass-card p-2.5 ${
                  isFocus ? "border-apple-blue/40" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-medium ${
                      isFocus ? "text-apple-blue" : "text-white"
                    }`}
                  >
                    {new Date(evt.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                      isDone
                        ? "bg-apple-green/15 text-apple-green"
                        : isFocus
                        ? "bg-apple-blue/20 text-apple-blue"
                        : isContest
                        ? "bg-apple-purple/15 text-apple-purple"
                        : "bg-white/10 text-apple-labelSecondary"
                    }`}
                  >
                    {isDone
                      ? "COMPLETED"
                      : isFocus
                      ? "FOCUS BLOCK"
                      : isContest
                      ? "CONTEST"
                      : "HABIT"}
                  </span>
                </div>
                <p className="text-xs font-medium text-white mt-1">{evt.title}</p>
                {evt.description && (
                  <span className="text-[11px] text-apple-labelSecondary block mt-0.5">
                    {evt.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
