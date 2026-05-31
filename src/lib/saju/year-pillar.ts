/**
 * 연주(年柱, year pillar) 계산.
 *
 * ## 경계 = 입춘(立春)
 *   사주의 새해는 양력 1/1도 음력 설날도 아닌 **입춘**입니다(태양황경 315°).
 *   출생 시각이 그 해 입춘 절입 시각 **이전이면 전년도(Y-1)** 간지를 씁니다.
 *   경계 동치(절입과 동일 시각)는 **이상(≥)이면 신년**으로 처리합니다.
 *
 * ## 연간지 닫힌 공식 (앵커: 1984 = 甲子)
 *   yearStemIndex   = ((Y - 4) % 10 + 10) % 10   // 0 = 甲
 *   yearBranchIndex = ((Y - 4) % 12 + 12) % 12   // 0 = 子
 *   서기 4년을 甲子년으로 보는 60갑자 기준((Y-4) mod 60).
 *
 * 근거: saju-domain-expert 에이전트 검증(astronomy-engine 절입 시각 ±1분 일치,
 *       1984/1924→甲子, 2024→甲辰 등 실측). .claude/rules/saju-domain.md
 */

import { ipchunInstantUtc } from "@/lib/calendar/solar-terms";
import { kstWallClockToUtc } from "@/lib/calendar/timezone";
import {
  EARTHLY_BRANCH_COUNT,
  EARTHLY_BRANCHES,
  HEAVENLY_STEM_COUNT,
  HEAVENLY_STEMS,
  mod,
} from "./constants";
import type { DayPillarInput } from "./day-pillar";
import type { SexagenaryPair } from "@/types/saju";

/** 연주 계산 입력 — 일주 입력과 동일(KST 벽시계). */
export type YearPillarInput = DayPillarInput;

/** 60갑자 앵커 보정: 서기 4년 = 甲子년 → (Y - 4). */
const YEAR_PILLAR_ANCHOR_OFFSET = 4;

/**
 * 입춘 경계를 반영해 사주상 "유효 연도"를 반환합니다.
 * 출생(KST)이 그 해 입춘 절입 이전이면 Y-1.
 */
export function effectiveSajuYear(input: YearPillarInput): number {
  const { year, month, day, hour = 0, minute = 0 } = input;
  const birthUtc = kstWallClockToUtc(year, month, day, hour, minute);
  const ipchunUtc = ipchunInstantUtc(year);
  // 절입 시각 이상이면 신년, 이전이면 전년.
  return birthUtc.getTime() < ipchunUtc.getTime() ? year - 1 : year;
}

/** 양력 연도(입춘 보정 완료)로부터 연주 간지를 구합니다. */
export function yearPillarFromSajuYear(sajuYear: number): SexagenaryPair {
  const n = sajuYear - YEAR_PILLAR_ANCHOR_OFFSET;
  return {
    heavenlyStem: HEAVENLY_STEMS[mod(n, HEAVENLY_STEM_COUNT)],
    earthlyBranch: EARTHLY_BRANCHES[mod(n, EARTHLY_BRANCH_COUNT)],
  };
}

/** 주어진 KST 출생 시각의 연주(年柱) 간지를 반환합니다. */
export function calculateYearPillar(input: YearPillarInput): SexagenaryPair {
  return yearPillarFromSajuYear(effectiveSajuYear(input));
}
