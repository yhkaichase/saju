/**
 * POST /api/saju/interpret — 계산된 명식(SajuChart)에 대한 AI 종합해석을 스트리밍합니다.
 *
 * 입력(JSON): { chart: SajuChart }  — /api/saju 가 반환한 명식 그대로.
 * 출력: text/plain 스트림(토큰이 도착하는 대로 흘려보냄).
 *
 * 명식 계산(정확성 최우선)은 결정론적 코어가 담당하고, 이 라우트는 그 결과 위에서
 * 자연어 해석만 생성합니다. 사실 수치는 프롬프트에서 고정합니다(→ prompt.ts).
 *
 * 모델 제공자: Google Gemini API (AI Studio). 무료 티어로도 동작합니다.
 * 환경변수: GEMINI_API_KEY(필수), GEMINI_MODEL(선택, 기본 gemini-2.5-flash).
 */

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { buildInterpretationPrompt } from "@/lib/saju/interpretation/prompt";
import type { SajuChart } from "@/lib/saju/saju-chart";

export const runtime = "nodejs";

const DEFAULT_MODEL = "gemini-2.5-flash";
const MAX_OUTPUT_TOKENS = 2048;

export async function POST(request: Request): Promise<Response> {
  // GOOGLE_API_KEY 도 함께 허용(둘 다 Gemini API 키 관례명).
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI 해석이 설정되지 않았습니다. 서버에 GEMINI_API_KEY가 필요합니다." },
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
  const ai = new GoogleGenAI({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const result = await ai.models.generateContentStream({
          model: process.env.GEMINI_MODEL ?? DEFAULT_MODEL,
          contents: user,
          config: {
            systemInstruction: system,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            // 사고(thinking) 토큰을 끄면 응답이 빠르고 출력 토큰 잘림을 예방한다.
            thinkingConfig: { thinkingBudget: 0 },
          },
        });
        for await (const chunk of result) {
          const text = chunk.text;
          if (text) controller.enqueue(encoder.encode(text));
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
