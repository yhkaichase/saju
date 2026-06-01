/**
 * 표시용 사주 명식(命式) 조립 — 4기둥 + 파생(오행·십신·대운)을 UI/API가 바로
 * 쓸 수 있는 형태로 묶습니다.
 *
 * 계산 자체는 각 코어 모듈이 수행하며, 이 모듈은 라벨링·조립만 담당합니다(순수).
 */

import { EARTHLY_BRANCH_ELEMENT, HEAVENLY_STEM_ELEMENT } from "./five-elements";
import { calculateFourPillars, type FourPillarsInput } from "./four-pillars";
import { calculateMajorFortune, type MajorFortuneResult } from "./major-fortune";
import { tenGodOfBranch, tenGodOfStem } from "./ten-gods";
import type {
  EarthlyBranch,
  FiveElement,
  Gender,
  HeavenlyStem,
  SexagenaryPair,
  TenGod,
} from "@/types/saju";

/** 천간 한 칸의 표시 정보. */
export interface StemCell {
  value: HeavenlyStem;
  element: FiveElement;
  /** 일간 기준 십신. 일간 자신은 null(주체이므로). */
  tenGod: TenGod | null;
}

/** 지지 한 칸의 표시 정보. */
export interface BranchCell {
  value: EarthlyBranch;
  element: FiveElement;
  /** 일간 기준 (지지 본기) 십신. */
  tenGod: TenGod;
}

/** 표시용 기둥 하나 — 천간/지지 셀. */
export interface PillarView {
  stem: StemCell;
  branch: BranchCell;
}

/** 명식 4기둥(표시용). */
export interface SajuChart {
  year: PillarView;
  month: PillarView;
  day: PillarView;
  hour: PillarView;
  /** 일간(日干) — 십신·대운의 기준 주체. */
  dayMaster: HeavenlyStem;
  majorFortune: MajorFortuneResult;
}

/** 명식 조립 입력 — 코어 입력 + 성별. */
export interface SajuChartInput extends FourPillarsInput {
  gender: Gender;
}

/** 한 기둥(천간+지지)을 일간 기준으로 라벨링합니다. */
function toPillarView(
  pillar: SexagenaryPair,
  dayMaster: HeavenlyStem,
  isDayPillar: boolean,
): PillarView {
  return {
    stem: {
      value: pillar.heavenlyStem,
      element: HEAVENLY_STEM_ELEMENT[pillar.heavenlyStem],
      // 일주의 천간(일간)은 주체이므로 십신을 매기지 않는다.
      tenGod: isDayPillar ? null : tenGodOfStem(dayMaster, pillar.heavenlyStem),
    },
    branch: {
      value: pillar.earthlyBranch,
      element: EARTHLY_BRANCH_ELEMENT[pillar.earthlyBranch],
      tenGod: tenGodOfBranch(dayMaster, pillar.earthlyBranch),
    },
  };
}

/**
 * 생년월일시·성별로부터 표시용 사주 명식을 조립합니다.
 * 입력은 **KST 표준시 벽시계**(연·월·일·시·분).
 *
 * 시각은 한국 표준시(동경 135°) 그대로 사용합니다(KASI·다수 만세력과 동일 기준).
 * 진태양시(경도·균시차) 보정은 적용하지 않습니다.
 */
export function buildSajuChart(input: SajuChartInput): SajuChart {
  const pillars = calculateFourPillars(input);
  const dayMaster = pillars.dayPillar.heavenlyStem;

  return {
    year: toPillarView(pillars.yearPillar, dayMaster, false),
    month: toPillarView(pillars.monthPillar, dayMaster, false),
    day: toPillarView(pillars.dayPillar, dayMaster, true),
    hour: toPillarView(pillars.hourPillar, dayMaster, false),
    dayMaster,
    majorFortune: calculateMajorFortune(input),
  };
}
