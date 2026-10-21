"use client";

import { CodingProblemEntry } from "../lib/storage/store";

interface AlgoLogProps {
  problems: CodingProblemEntry[];
}

export function AlgoLog({ problems }: AlgoLogProps) {
  const leetcodeProblems = problems.filter((p) => p.platform === "leetcode");
  const codeforcesProblems = problems.filter((p) => p.platform === "codeforces");

  const easyCount = leetcodeProblems.filter((p) => p.difficulty.toLowerCase() === "easy").length + 110;
  const medCount = leetcodeProblems.filter((p) => p.difficulty.toLowerCase() === "medium").length + 184;
  const hardCount = leetcodeProblems.filter((p) => p.difficulty.toLowerCase() === "hard").length + 48;
  const totalSolved = easyCount + medCount + hardCount;

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-labelSecondary">
          Algorithmic Log
        </span>
        <span className="text-xs font-mono text-apple-purple font-semibold flex items-center gap-1 bg-apple-purple/10 px-2 py-0.5 rounded-full border border-apple-purple/20">
          <span className="material-symbols-outlined text-[14px]">psychology</span>
          Rating: 1,642
        </span>
      </div>

      {/* LeetCode & Codeforces Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* LeetCode Card */}
        <div className="apple-glass-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-apple-labelSecondary uppercase tracking-wider">
              LeetCode Progress
            </span>
            <span className="text-xs font-mono font-semibold text-white">
              {totalSolved} Solved
            </span>
          </div>

          {/* Segmented breakdown bar */}
          <div className="flex items-center gap-1 my-2.5">
            <div
              className="h-1.5 rounded-full bg-apple-green"
              style={{ flex: easyCount }}
              title={`Easy: ${easyCount}`}
            />
            <div
              className="h-1.5 rounded-full bg-apple-orange"
              style={{ flex: medCount }}
              title={`Medium: ${medCount}`}
            />
            <div
              className="h-1.5 rounded-full bg-apple-red"
              style={{ flex: hardCount }}
              title={`Hard: ${hardCount}`}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-apple-labelSecondary">
            <span className="text-apple-green">Easy: {easyCount}</span>
            <span className="text-apple-orange">Med: {medCount}</span>
            <span className="text-apple-red">Hard: {hardCount}</span>
          </div>
        </div>

        {/* Codeforces Card */}
        <div className="apple-glass-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-apple-labelSecondary uppercase tracking-wider">
              Codeforces
            </span>
            <span className="px-2 py-0.5 rounded-full bg-apple-purple/15 text-apple-purple text-[10px] font-mono font-semibold">
              Candidate Master
            </span>
          </div>
          <div className="flex items-baseline justify-between my-1">
            <span className="text-xl font-mono font-semibold text-white">
              1,642 <span className="text-xs text-apple-green font-normal">(+48)</span>
            </span>
            <span className="text-[11px] text-apple-labelSecondary">28 Contests</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-apple-labelSecondary font-mono">
            <span>Max: 1,675</span>
            <span className="text-apple-blue flex items-center gap-1">● Next: 18:00</span>
          </div>
        </div>
      </div>

      {/* Problem Dispatch Feed */}
      <div className="apple-glass-panel p-3 flex flex-col gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-apple-labelTertiary px-1">
          Recent Problem Dispatch
        </span>
        {problems.slice(0, 4).map((prob) => {
          const isHard = prob.difficulty.toLowerCase().includes("hard");
          const isMed = prob.difficulty.toLowerCase().includes("medium");
          const isCf = prob.platform === "codeforces";

          return (
            <div
              key={prob.id}
              className="flex items-center justify-between p-2.5 rounded-xl apple-glass-card"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${
                    isHard
                      ? "bg-apple-red/15 text-apple-red"
                      : isMed
                      ? "bg-apple-orange/15 text-apple-orange"
                      : "bg-apple-purple/15 text-apple-purple"
                  }`}
                >
                  {prob.difficulty.toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {prob.problemId}. {prob.title}
                  </p>
                  <span className="text-[10px] text-apple-labelSecondary">
                    {prob.topicTags.join(" • ")} {prob.language ? `• ${prob.language}` : ""}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-apple-labelTertiary flex-shrink-0">
                {prob.dateSolved}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
