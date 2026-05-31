/**
 * 정적 뜻풀이(A) 조립 — 계산된 명식(SajuChart)에서 근거가 분명한 해석을 만듭니다.
 *
 * 이 모듈은 **순수**합니다(부수효과·I/O 없음). 오행 분포·십신 분포처럼 명식에서
 * 기계적으로 도출되는 사실과, 그에 대응하는 고정 통설 텍스트만 결합합니다.
 * AI 종합해석(B)과 달리 결과가 결정론적이라 골든 테스트로 고정할 수 있습니다.
 */

import { HEAVENLY_STEM_YIN_YANG } from "../five-elements";
import type { SajuChart } from "../saju-chart";
import type { FiveElement, HeavenlyStem, TenGod, YinYang } from "@/types/saju";
import { DAY_MASTER_TEXT, type DayMasterText } from "./day-master";
import { FIVE_ELEMENT_TEXT, type FiveElementText } from "./five-elements";
import { TEN_GOD_TEXT, type TenGodText } from "./ten-gods";

const FIVE_ELEMENTS: readonly FiveElement[] = ["木", "火", "土", "金", "水"];

/** 일간 해석 — 본질(나). */
export interface DayMasterReading extends DayMasterText {
  stem: HeavenlyStem;
  yinYang: YinYang;
}

/** 오행 분포·강약 분석. */
export interface FiveElementBalance {
  /** 8글자(천간 4 + 지지 4) 기준 오행별 개수. */
  counts: Record<FiveElement, number>;
  /** 가장 많은 오행(동률이면 복수). */
  dominant: FiveElement[];
  /** 명식에 전혀 없는 오행. */
  lacking: FiveElement[];
  /** 분포에서 도출한 한 줄 요약. */
  summary: string;
  /** 분포에 나타난 오행별 상징 텍스트(개수 내림차순). */
  present: Array<{ element: FiveElement; count: number; info: FiveElementText }>;
}

/** 십신 분포 — 두드러진 십신 중심. */
export interface TenGodReading {
  /** 명식에 나타난 십신별 개수(일간 자신 제외). */
  counts: Partial<Record<TenGod, number>>;
  /** 개수 내림차순으로 정렬한, 나타난 십신과 설명. */
  highlights: Array<{ tenGod: TenGod; count: number; info: TenGodText }>;
}

/** 정적 뜻풀이 전체. */
export interface SajuInterpretation {
  dayMaster: DayMasterReading;
  fiveElements: FiveElementBalance;
  tenGods: TenGodReading;
  majorFortune: { isForward: boolean; startAge: number; summary: string };
}

/** 명식 4기둥에서 오행 8글자를 모읍니다(천간·지지). */
function collectElements(chart: SajuChart): FiveElement[] {
  return [chart.year, chart.month, chart.day, chart.hour].flatMap((p) => [
    p.stem.element,
    p.branch.element,
  ]);
}

/** 명식 4기둥에서 십신을 모읍니다(일간 천간은 null이므로 제외). */
function collectTenGods(chart: SajuChart): TenGod[] {
  return [chart.year, chart.month, chart.day, chart.hour].flatMap((p) =>
    p.stem.tenGod ? [p.stem.tenGod, p.branch.tenGod] : [p.branch.tenGod],
  );
}

function analyzeFiveElements(chart: SajuChart): FiveElementBalance {
  const counts = Object.fromEntries(FIVE_ELEMENTS.map((e) => [e, 0])) as Record<
    FiveElement,
    number
  >;
  for (const element of collectElements(chart)) counts[element] += 1;

  const max = Math.max(...FIVE_ELEMENTS.map((e) => counts[e]));
  const dominant = FIVE_ELEMENTS.filter((e) => counts[e] === max);
  const lacking = FIVE_ELEMENTS.filter((e) => counts[e] === 0);

  const present = FIVE_ELEMENTS.filter((e) => counts[e] > 0)
    .sort((a, b) => counts[b] - counts[a])
    .map((element) => ({ element, count: counts[element], info: FIVE_ELEMENT_TEXT[element] }));

  const dominantLabels = dominant.map((e) => FIVE_ELEMENT_TEXT[e].label).join("·");
  const lackingLabels = lacking.map((e) => FIVE_ELEMENT_TEXT[e].label).join("·");
  const summary =
    `오행은 ${dominantLabels} 기운이 가장 강합니다.` +
    (lacking.length > 0
      ? ` ${lackingLabels} 기운은 명식에 드러나지 않아, 그 덕목은 의식적으로 보완하면 좋습니다.`
      : " 다섯 기운이 고루 갖춰져 균형이 좋은 편입니다.");

  return { counts, dominant, lacking, summary, present };
}

function analyzeTenGods(chart: SajuChart): TenGodReading {
  const counts: Partial<Record<TenGod, number>> = {};
  for (const tenGod of collectTenGods(chart)) {
    counts[tenGod] = (counts[tenGod] ?? 0) + 1;
  }

  const highlights = (Object.entries(counts) as Array<[TenGod, number]>)
    .sort(([, a], [, b]) => b - a)
    .map(([tenGod, count]) => ({ tenGod, count, info: TEN_GOD_TEXT[tenGod] }));

  return { counts, highlights };
}

/**
 * 계산된 명식으로부터 정적 뜻풀이를 만듭니다.
 * 결정론적이므로 동일 입력 → 동일 출력입니다.
 */
export function buildInterpretation(chart: SajuChart): SajuInterpretation {
  const stem = chart.dayMaster;
  const { direction, fortuneStartAge } = chart.majorFortune;
  const isForward = direction === "forward";

  return {
    dayMaster: {
      stem,
      yinYang: HEAVENLY_STEM_YIN_YANG[stem],
      ...DAY_MASTER_TEXT[stem],
    },
    fiveElements: analyzeFiveElements(chart),
    tenGods: analyzeTenGods(chart),
    majorFortune: {
      isForward,
      startAge: fortuneStartAge,
      summary:
        `대운은 ${isForward ? "순행(順行)" : "역행(逆行)"}하며 약 ${fortuneStartAge}세부터 ` +
        "10년 주기로 새 기둥의 기운이 들어옵니다. 각 대운의 천간·지지가 일간과 맺는 " +
        "관계(십신)에 따라 그 시기의 색채가 달라집니다.",
    },
  };
}

export { DAY_MASTER_TEXT, FIVE_ELEMENT_TEXT, TEN_GOD_TEXT };
export type { DayMasterText, FiveElementText, TenGodText };
