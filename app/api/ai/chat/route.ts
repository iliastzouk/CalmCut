import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message, context } = await req.json();

  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  // Fallback built-in responses (no API key needed)
  const responses: Record<string, string> = {
    default: `Based on your data, here's my take: consistency is your biggest lever right now. One logged day builds a habit. One honest entry prevents a spiral. What specifically would you like help with today?`,
  };

  await new Promise((r) => setTimeout(r, 600));
  return NextResponse.json({ response: responses.default });
}
