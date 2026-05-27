import { NextRequest, NextResponse } from "next/server";
import { estimateCalories } from "@/lib/utils/calories";

export async function POST(req: NextRequest) {
  const { mealName } = await req.json();

  if (!mealName) {
    return NextResponse.json({ error: "Meal name required" }, { status: 400 });
  }

  const estimate = estimateCalories(mealName);
  return NextResponse.json(estimate);
}
