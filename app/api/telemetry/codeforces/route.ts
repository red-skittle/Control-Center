import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle")?.trim();

  if (!handle) {
    return NextResponse.json({ error: "Handle parameter is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`,
      {
        headers: {
          "User-Agent": "ControlCenterApp/1.0",
        },
        next: { revalidate: 120 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Codeforces API responded with status ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    if (data.status !== "OK" || !data.result || data.result.length === 0) {
      return NextResponse.json(
        { error: `Codeforces user '${handle}' not found` },
        { status: 404 }
      );
    }

    const user = data.result[0];

    return NextResponse.json({
      handle: user.handle,
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || "unrated",
      maxRank: user.maxRank || "unrated",
      contribution: user.contribution || 0,
      organization: user.organization || "",
      avatar: user.titlePhoto || user.avatar || "",
    });
  } catch (error: any) {
    console.error("Codeforces telemetry fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to connect to Codeforces API service." },
      { status: 500 }
    );
  }
}
