import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json({ error: "Username parameter is required" }, { status: 400 });
  }

  try {
    const query = `
      query getUserProfile($username: String!) {
        allQuestionsCount {
          difficulty
          count
        }
        matchedUser(username: $username) {
          username
          profile {
            ranking
            reputation
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
      }
    `;

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `LeetCode API responded with status ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const user = data?.data?.matchedUser;

    if (!user) {
      return NextResponse.json(
        { error: `LeetCode user '${username}' not found` },
        { status: 404 }
      );
    }

    const acStats = user.submitStatsGlobal?.acSubmissionNum || [];
    const all = acStats.find((s: any) => s.difficulty === "All")?.count || 0;
    const easy = acStats.find((s: any) => s.difficulty === "Easy")?.count || 0;
    const medium = acStats.find((s: any) => s.difficulty === "Medium")?.count || 0;
    const hard = acStats.find((s: any) => s.difficulty === "Hard")?.count || 0;

    return NextResponse.json({
      username: user.username,
      ranking: user.profile?.ranking || 0,
      totalSolved: all,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
    });
  } catch (error: any) {
    console.error("LeetCode telemetry fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to connect to LeetCode API service." },
      { status: 500 }
    );
  }
}
