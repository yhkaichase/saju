/**
 * POST /api/saju/interpret — 계산된 명식(SajuChart)에 대한 AI 종합해석을 스트리밍합니다.
 *
 * 입력(JSON): { chart: SajuChart }  — /api/saju 가 반환한 명식 그대로.
 * 출력: text/plain 스트림(토큰이 도착하는 대로 흘려보냄).
 *
 * 명식 계산(정확성 최우선)은 결정론적 코어가 담당하고, 이 라우트는 그 결과 위에서
 * 자연어 해석만 생성합니다. 사실 수치는 프롬프트에서 고정합니다(→ prompt.ts).
 *
 * 환경변수: ANTHROPIC_API_KEY(필수), ANTHROPIC_MODEL(선택, 기본 claude-sonnet-4-6).
 */

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import { buildInterpretationPrompt } from "@/lib/saju/interpretation/prompt";
import type { SajuChart } from "@/lib/saju/saju-chart";

export const runtime = "nodejs";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1500;

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI 해석이 설정되지 않았습니다. 서버에 ANTHROPIC_API_KEY가 필요합니다." },
      { status: 503 },
    );
  }

  let body: { chart?: SajuChart };
  try {
    body = (await request.json()) as { chart?: SajuChart };
  } catch {
    return NextResponse.json({ error: "유효한 JSON 본문이 필요합니다." }, { status: 400 });
  }
  if (!body.chart?.dayMaster) {
    return NextResponse.json({ error: "명식(chart)이 필요합니다." }, { status: 400 });
  }

  const { system, user } = buildInterpretationPrompt(body.chart);
  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const messageStream = client.messages.stream({
          model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
          max_tokens: MAX_TOKENS,
          system,
          messages: [{ role: "user", content: user }],
        });
        for await (const event of messageStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        // 스트림이 이미 시작된 뒤의 오류는 본문 끝에 메시지로 덧붙인다.
        const message = err instanceof Error ? err.message : "알 수 없는 오류";
        controller.enqueue(encoder.encode(`\n\n[해석 생성 중 오류가 발생했습니다: ${message}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
