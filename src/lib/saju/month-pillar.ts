/**
 * 월주(月柱, month pillar) 계산.
 *
 * ## 월지(月支) = 절기 기준
 *   월의 경계는 음력 초하루가 아니라 12절기(節)입니다. 절입 시각을 따로
 *   탐색하지 않고 **출생 시각의 태양황경**으로 즉시 구간을 판정합니다.
 *   입춘(315°)부터 30°씩: 寅(315°~)·卯(345°~)·辰(15°~)…
 *   (子월·丑월이 양력 연말~연초를 가로질러도 황경 기반이라 자연 처리됨)
 *
 * ## 월간(月干) = 오호둔(五虎遁)
 *   연간(年干)에 따라 寅月의 천간이 정해지고, 寅월부터 순행합니다.
 *     寅月천간index = (yearStemIndex * 2 + 2) % 10
 *     monthStemIndex = (寅月천간index + 寅부터의_개월수) % 10
 *   - 甲己년 寅=丙, 乙庚년 寅=戊, 丙辛년 寅=庚, 丁壬년 寅=壬, 戊癸년 寅=甲.
 *
 *   ⚠️ "寅부터의 개월수"는 **12지지 래핑**이 필요합니다. 子(index 0)·丑(index 1)월은
 *   寅 기준 각각 10·11번째 달이므로, 단순 `(yearStemIndex*2 + monthBranchIndex)`
 *   공식은 子·丑월에서 결과가 2만큼 어긋납니다(寅~亥월에서는 우연히 일치).
 *   예) 戊癸년 丑月 정답 乙丑(乙) — 단순식은 癸丑(癸)을 내던 과거 버그.
 *
 * ## 연간 SSOT
 *   월간의 기준 연간은 **입춘 경계로 확정된 연주(年柱)의 연간**입니다(역법 연도 Y
 *   아님). 입춘 직후 명식에서 연주가 바뀌면 월간도 새 연간을 따릅니다.
 *   (시주가 일주 일간을 SSOT로 쓰는 패턴과 동형 — 월주는 연주 연간을 SSOT로.)
 *
 * 근거: saju-domain-expert 에이전트 검증. .claude/rules/saju-domain.md
 */

import { IPCHUN_LONGITUDE, sunEclipticLongitude } from "@/lib/calendar/solar-terms";
import { kstWallClockToUtc } from "@/lib/calendar/timezone";
import {
  branchIndex,
  EARTHLY_BRANCH_COUNT,
  EARTHLY_BRANCHES,
  HEAVENLY_STEM_COUNT,
  HEAVENLY_STEMS,
  mod,
  stemIndex,
} from "./constants";
import type { DayPillarInput } from "./day-pillar";
import { calculateYearPillar, type YearPillarInput } from "./year-pillar";
import type { SexagenaryPair } from "@/types/saju";

/** 월주 계산 입력 — 일주 입력과 동일(KST 벽시계). */
export type MonthPillarInput = DayPillarInput;

/** 寅(인)의 지지 인덱스 — 입춘 직후 월지. */
const YIN_BRANCH_INDEX = branchIndex("寅");
/** 황경 한 칸(월) = 30도. */
const DEGREES_PER_MONTH = 30;
/** 한 바퀴 = 360도. */
const FULL_CIRCLE_DEGREES = 360;

/**
 * 태양황경(도)으로부터 월지(月支) index(0=子 … 11=亥)를 구합니다.
 * 입춘(315°)을 寅(인)의 시작으로 보고 30°씩 진행합니다.
 */
export function sunLongitudeToMonthBranchIndex(longitude: number): number {
  const fromIpchun = mod(longitude - IPCHUN_LONGITUDE, FULL_CIRCLE_DEGREES);
  const step = Math.floor(fromIpchun / DEGREES_PER_MONTH);
  return mod(YIN_BRANCH_INDEX + step, EARTHLY_BRANCH_COUNT);
}

/** 주어진 KST 출생 시각의 월주(月柱) 간지를 반환합니다. */
export function calculateMonthPillar(input: MonthPillarInput): SexagenaryPair {
  const { year, month, day, hour = 0, minute = 0 } = input;

  // 월지: 출생 시각의 태양황경으로 절기 구간 판정.
  const birthUtc = kstWallClockToUtc(year, month, day, hour, minute);
  const monthBranchIndex = sunLongitudeToMonthBranchIndex(sunEclipticLongitude(birthUtc));

  // 월간: 입춘 보정된 연주의 연간을 SSOT로 오호둔 적용.
  // 寅월 천간에서 寅부터의 개월수만큼 순행. 子·丑월(寅 기준 10·11번째)은 12지지
  // 래핑이 필요하므로 monthBranchIndex를 그대로 더하지 않는다.
  const yearPillar = calculateYearPillar(input as YearPillarInput);
  const yearStemIndex = stemIndex(yearPillar.heavenlyStem);
  const yinMonthStemIndex = mod(yearStemIndex * 2 + YIN_BRANCH_INDEX, HEAVENLY_STEM_COUNT);
  const monthsFromYin = mod(monthBranchIndex - YIN_BRANCH_INDEX, EARTHLY_BRANCH_COUNT);
  const monthStemIndex = mod(yinMonthStemIndex + monthsFromYin, HEAVENLY_STEM_COUNT);

  return {
    heavenlyStem: HEAVENLY_STEMS[monthStemIndex],
    earthlyBranch: EARTHLY_BRANCHES[monthBranchIndex],
  };
}
