/**
 * 표시용 사주 명식(命式) 조립 — 4기둥 + 파생(오행·십신·대운)을 UI/API가 바로
 * 쓸 수 있는 형태로 묶습니다.
 *
 * 계산 자체는 각 코어 모듈이 수행하며, 이 모듈은 라벨링·조립만 담당합니다(순수).
 */

import { kstWallClockToUtc, type KstWallClock } from "@/lib/calendar/timezone";
import {
  SEOUL_LONGITUDE,
  toTrueSolarWallClock,
  trueSolarOffsetMinutes,
} from "@/lib/calendar/true-solar-time";
import { calculateDayPillar } from "./day-pillar";
import { EARTHLY_BRANCH_ELEMENT, HEAVENLY_STEM_ELEMENT } from "./five-elements";
import { type FourPillarsInput } from "./four-pillars";
import { calculateHourPillar } from "./hour-pillar";
import { calculateMajorFortune, type MajorFortuneResult } from "./major-fortune";
import { calculateMonthPillar } from "./month-pillar";
import { tenGodOfBranch, tenGodOfStem } from "./ten-gods";
import { calculateYearPillar } from "./year-pillar";
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

/** 진태양시(眞太陽時) 보정 내역 — 표시·검증용. */
export interface SolarTimeInfo {
  /** 보정 기준 경도(동경, 도). 기본 서울. */
  longitude: number;
  /** 총 보정량(분, 반올림). 경도보정 + 균시차. 서울은 대략 −30분 부근. */
  offsetMinutes: number;
  /** 입력한 표준시(KST) 시·분. */
  standard: { hour: number; minute: number };
  /** 보정된 진태양시 시·분(일주·시주는 이 시각 기준). */
  corrected: { hour: number; minute: number };
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
  /** 진태양시 보정 내역(시주·일주 경계에 적용됨). */
  solarTime: SolarTimeInfo;
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
 * 입력은 KST 표준시 벽시계(연·월·일·시·분).
 *
 * ## 진태양시(眞太陽時) 보정 — 항상 적용(서울 기준)
 *   표준시(동경 135°)와 출생지 실제 태양시의 차이를 보정합니다(→ true-solar-time.ts).
 *   - **시주(時支)·일주(자시/자정 경계)**: 보정된 진태양시 벽시계로 계산.
 *   - **연주(입춘)·월주(절기)·대운**: 절입 "절대시각(UTC)"과 출생 절대시각을 직접
 *     비교하므로 보정하지 않습니다(보정 시 이중보정 오류). → 원본 입력 그대로 사용.
 *   출생지 경도는 서울(126.978°E)로 고정합니다(다수 사용자 근사). 끄는 옵션은 없습니다.
 *
 *   ⚠️ 한계: 1908–1911, 1954–1961 한국 표준시(UTC+8:30, 기준 127.5°) 구간은
 *   반영하지 않습니다(현 사용 대상 밖). 그 시기 출생은 경도보정 기준이 달라집니다.
 *
 * 근거: saju-domain-expert 검증. .claude/rules/saju-domain.md(시주 — 진태양시 명시).
 */
export function buildSajuChart(input: SajuChartInput): SajuChart {
  const standard: KstWallClock = {
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour ?? 0,
    minute: input.minute ?? 0,
  };

  // 진태양시 보정량(분)과 보정된 벽시계(서울 기준).
  const longitude = SEOUL_LONGITUDE;
  const birthUtc = kstWallClockToUtc(
    standard.year,
    standard.month,
    standard.day,
    standard.hour,
    standard.minute,
  );
  const offsetMinutes = trueSolarOffsetMinutes(birthUtc, longitude);
  const corrected = toTrueSolarWallClock(standard, longitude);

  // 일주·시주는 진태양시 벽시계, 연·월주·대운은 원본(절대시각) 입력.
  const correctedInput: FourPillarsInput = { ...input, ...corrected };

  const yearPillar = calculateYearPillar(input);
  const monthPillar = calculateMonthPillar(input);
  const dayPillar = calculateDayPillar(correctedInput);
  const hourPillar = calculateHourPillar(correctedInput);
  const dayMaster = dayPillar.heavenlyStem;

  return {
    year: toPillarView(yearPillar, dayMaster, false),
    month: toPillarView(monthPillar, dayMaster, false),
    day: toPillarView(dayPillar, dayMaster, true),
    hour: toPillarView(hourPillar, dayMaster, false),
    dayMaster,
    majorFortune: calculateMajorFortune(input),
    solarTime: {
      longitude,
      offsetMinutes: Math.round(offsetMinutes),
      standard: { hour: standard.hour, minute: standard.minute },
      corrected: { hour: corrected.hour, minute: corrected.minute },
    },
  };
}
