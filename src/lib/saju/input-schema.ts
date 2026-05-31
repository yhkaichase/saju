/**
 * 사주 계산 입력 검증 — 외부 입력(폼/API)을 경계에서 zod로 검증합니다.
 * (참고: .claude/rules/coding-style.md — 외부 입력은 경계에서 검증)
 *
 * 입력은 **KST 벽시계** 기준 양력 연·월·일·시·분 + 성별입니다.
 */

import { z } from "zod";

import type { SajuChartInput } from "./saju-chart";

/**
 * 천문 계산(astronomy-engine) 신뢰 구간 + KST 표준시 안정 구간을 고려한 연도 범위.
 * (1908년 대한제국 표준시 도입 이전·미래 과도 입력 방지)
 */
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

export const sajuInputSchema = z.object({
  year: z.number().int().min(MIN_YEAR).max(MAX_YEAR),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  gender: z.enum(["male", "female"]),
});

/** 검증된 입력 타입. SajuChartInput과 호환됩니다. */
export type SajuInput = z.infer<typeof sajuInputSchema>;

// 컴파일 타임 호환성 보장: 검증 결과가 코어 입력으로 그대로 쓰일 수 있어야 함.
const _typeCheck: SajuChartInput = {} as SajuInput;
void _typeCheck;

/**
 * 실존하지 않는 날짜(예: 2/30, 4/31)를 거릅니다.
 * zod 1차 검증(범위) 이후 호출하세요.
 */
export function isRealCalendarDate(year: number, month: number, day: number): boolean {
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

/**
 * 입력을 검증해 코어가 쓸 수 있는 형태로 반환합니다.
 * 범위/타입 오류 또는 비실존 날짜면 메시지와 함께 실패합니다.
 */
export function parseSajuInput(
  raw: unknown,
): { ok: true; value: SajuInput } | { ok: false; error: string } {
  const parsed = sajuInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  const { year, month, day } = parsed.data;
  if (!isRealCalendarDate(year, month, day)) {
    return { ok: false, error: `존재하지 않는 날짜입니다: ${year}-${month}-${day}` };
  }
  return { ok: true, value: parsed.data };
}
