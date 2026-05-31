/**
 * POST /api/saju — 생년월일시·성별을 받아 사주 명식을 계산해 반환합니다.
 *
 * 입력(JSON, KST 벽시계): { year, month, day, hour, minute, gender }
 * 출력: SajuChart (4기둥 + 오행·십신 라벨 + 대운)
 */

import { NextResponse } from "next/server";

import { parseSajuInput } from "@/lib/saju/input-schema";
import { buildSajuChart } from "@/lib/saju/saju-chart";

export async function POST(request: Request): Promise<NextResponse> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "유효한 JSON 본문이 필요합니다." }, { status: 400 });
  }

  const parsed = parseSajuInput(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const chart = buildSajuChart(parsed.value);
  return NextResponse.json({ chart });
}
