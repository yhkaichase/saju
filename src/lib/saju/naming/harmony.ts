/**
 * 사주-이름 오행 조화 — 명식에서 부족/약한 오행을 이름의 오행이 보완하는지 봅니다.
 *
 * ## 단순화 (명시)
 *   정식 용신론(억부·조후·통관·병약)은 학파차가 크고 복잡하므로, 여기서는
 *   **명식 8글자 오행 분포에서 가장 부족한(없거나 적은) 오행을 "보완 대상"**으로
 *   삼는 단순 기준을 씁니다. 정밀 용신 도입 시 이 기준을 교체하세요.
 *
 * ## 보완 기준 — 자원오행 우선
 *   실무 통설상 사주 보완은 **자원오행(字源五行)을 주(主)**로, 발음오행을 보조로
 *   봅니다(리서치). 이름이 부족 오행을 자원오행으로 채우면 보완으로 판정합니다.
 *
 * 근거: general-purpose 리서치(용신 보완·자원오행 우선 통설).
 */

import type { FiveElement } from "@/types/saju";
import type { SajuChart } from "../saju-chart";

const FIVE_ELEMENTS: readonly FiveElement[] = ["木", "火", "土", "金", "水"];

/** 명식 8글자(천간4+지지4)의 오행 개수. */
export function chartElementCounts(chart: SajuChart): Record<FiveElement, number> {
  const counts = Object.fromEntries(FIVE_ELEMENTS.map((e) => [e, 0])) as Record<
    FiveElement,
    number
  >;
  for (const p of [chart.year, chart.month, chart.day, chart.hour]) {
    counts[p.stem.element] += 1;
    counts[p.branch.element] += 1;
  }
  return counts;
}

export interface HarmonyAnalysis {
  /** 명식 오행 분포. */
  counts: Record<FiveElement, number>;
  /** 보완이 필요한 오행(없는 오행. 없으면 최소 개수 오행). */
  needed: FiveElement[];
  /** 이름의 자원오행이 채워준 부족 오행. */
  filledByResource: FiveElement[];
  /** 이름의 발음오행이 채워준 부족 오행(보조). */
  filledBySound: FiveElement[];
  /** 부족 오행이 (자원 또는 발음으로) 하나라도 채워지면 true. */
  complements: boolean;
}

/**
 * 명식의 부족 오행을 이름 오행이 보완하는지 분석합니다.
 * @param resourceElements 이름 글자들의 자원오행(아는 것만).
 * @param soundElements 이름 글자들의 발음오행.
 */
export function analyzeHarmony(
  chart: SajuChart,
  resourceElements: FiveElement[],
  soundElements: FiveElement[],
): HarmonyAnalysis {
  const counts = chartElementCounts(chart);
  const min = Math.min(...FIVE_ELEMENTS.map((e) => counts[e]));
  const needed = FIVE_ELEMENTS.filter((e) => counts[e] === min);

  const resourceSet = new Set(resourceElements);
  const soundSet = new Set(soundElements);
  const filledByResource = needed.filter((e) => resourceSet.has(e));
  const filledBySound = needed.filter((e) => soundSet.has(e));

  return {
    counts,
    needed,
    filledByResource,
    filledBySound,
    complements: filledByResource.length > 0 || filledBySound.length > 0,
  };
}
