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
 *   연간(年干)에 따라 寅月의 천간이 정해지고 순행합니다.
 *   닫힌 공식(전수 검증, hour-pillar와 동형):
 *     monthStemIndex = (yearStemIndex * 2 + monthBranchIndex) % 10
 *   - 甲己년 寅=丙, 乙庚년 寅=戊, 丙辛년 寅=庚, 丁壬년 寅=壬, 戊癸년 寅=甲.
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
import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from "./constants";
import type { DayPillarInput } from "./day-pillar";
import { calculateYearPillar, type YearPillarInput } from "./year-pillar";
import type { EarthlyBranch, SexagenaryPair } from "@/types/saju";

/** 월주 계산 입력 — 일주 입력과 동일(KST 벽시계). */
export type MonthPillarInput = DayPillarInput;

/** 寅(인)의 지지 인덱스 — 입춘 직후 월지. */
const YIN_BRANCH_INDEX = EARTHLY_BRANCHES.indexOf("寅" as EarthlyBranch);
/** 황경 한 칸(월) = 30도. */
const DEGREES_PER_MONTH = 30;
/** 천간 개수 — 오호둔 모듈러 연산용. */
const HEAVENLY_STEM_COUNT = 10;

/**
 * 태양황경(도)으로부터 월지(月支) index(0=子 … 11=亥)를 구합니다.
 * 입춘(315°)을 寅(인)의 시작으로 보고 30°씩 진행합니다.
 */
export function sunLongitudeToMonthBranchIndex(longitude: number): number {
  const fromIpchun = (((longitude - IPCHUN_LONGITUDE) % 360) + 360) % 360;
  const step = Math.floor(fromIpchun / DEGREES_PER_MONTH);
  return (YIN_BRANCH_INDEX + step) % 12;
}

/** 주어진 KST 출생 시각의 월주(月柱) 간지를 반환합니다. */
export function calculateMonthPillar(input: MonthPillarInput): SexagenaryPair {
  const { year, month, day, hour = 0, minute = 0 } = input;

  // 월지: 출생 시각의 태양황경으로 절기 구간 판정.
  const birthUtc = kstWallClockToUtc(year, month, day, hour, minute);
  const monthBranchIndex = sunLongitudeToMonthBranchIndex(sunEclipticLongitude(birthUtc));

  // 월간: 입춘 보정된 연주의 연간을 SSOT로 오호둔 적용.
  const yearPillar = calculateYearPillar(input as YearPillarInput);
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearPillar.heavenlyStem);
  const monthStemIndex = (yearStemIndex * 2 + monthBranchIndex) % HEAVENLY_STEM_COUNT;

  return {
    heavenlyStem: HEAVENLY_STEMS[monthStemIndex],
    earthlyBranch: EARTHLY_BRANCHES[monthBranchIndex],
  };
}
