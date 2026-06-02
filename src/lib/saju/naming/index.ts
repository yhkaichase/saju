/**
 * 성명학(姓名學) 통합 — 한 이름에 대해 발음오행·오격·81수리·음양·자원오행·사주조화를
 * 한 번에 조립합니다(순수).
 *
 * ## 우아한 폴백
 *   - 발음오행·음양(발음)은 **한글만으로** 항상 산출.
 *   - 오격·81수리·획수음양·자원오행은 **한자 원획수가 필요**합니다. 한자가 없거나
 *     일부가 미수록(시드 한자표에 없음)이면 해당 레이어는 생략하고 사유를 남깁니다.
 *
 * 학파 분기(발음오행 술가/해례, 초·종성)는 옵션으로 노출합니다.
 */

import type { FiveElement } from "@/types/saju";
import type { SajuChart } from "../saju-chart";
import { calculateFiveGrids, type FiveGrids } from "./five-grids";
import { lookupHanja, type HanjaInfo } from "./hanja-data";
import { analyzeHarmony, type HarmonyAnalysis } from "./harmony";
import { numerologyOf, type NumerologyMeaning } from "./numerology";
import {
  analyzeSoundElements,
  type SoundElementAnalysis,
  type SoundElementOptions,
} from "./sound-element";
import { analyzeYinYang, type YinYangAnalysis } from "./yin-yang";

export interface NameInput {
  /** 성 한글(예: "황"). 복성은 두 글자(예: "남궁"). */
  surnameHangul: string;
  /** 이름 한글(예: "연정"). */
  givenHangul: string;
  /** 성 한자(선택, 한글과 길이 일치). */
  surnameHanja?: string;
  /** 이름 한자(선택, 한글과 길이 일치). */
  givenHanja?: string;
}

/** 한자 기반(획수) 분석 — 모든 한자가 수록됐을 때만 채워집니다. */
export interface StrokeAnalysis {
  /** 글자별 원획수(성→이름 순). */
  strokes: number[];
  grids: FiveGrids;
  /** 오격별 81수리 길흉. */
  numerology: {
    cheon: NumerologyMeaning;
    in: NumerologyMeaning;
    ji: NumerologyMeaning;
    oe: NumerologyMeaning;
    chong: NumerologyMeaning;
  };
  yinYang: YinYangAnalysis;
  /** 글자별 자원오행(아는 것만, 없으면 null). */
  resourceElements: Array<FiveElement | null>;
}

export interface NameAnalysis {
  surnameHangul: string;
  givenHangul: string;
  /** 발음오행(한글 기반, 항상 존재). */
  sound: SoundElementAnalysis;
  /** 한자 기반 분석. 한자 미입력/일부 미수록이면 null. */
  strokeAnalysis: StrokeAnalysis | null;
  /** 사주 조화. chart와 한자 정보가 있을 때. */
  harmony: HarmonyAnalysis | null;
  /** strokeAnalysis가 null인 사유(있으면). */
  fallbackReason?: string;
}

export interface NameAnalysisOptions extends SoundElementOptions {
  /** 사주 명식 — 주면 오행 조화까지 분석. */
  chart?: SajuChart;
}

/** 한자 문자열의 각 글자 정보(미수록 1개라도 있으면 null 포함). */
function infosFor(hanja: string): Array<HanjaInfo | null> {
  return [...hanja].map(lookupHanja);
}

/**
 * 이름 하나에 대한 성명학 종합 분석을 조립합니다.
 */
export function buildNameAnalysis(
  input: NameInput,
  options: NameAnalysisOptions = {},
): NameAnalysis {
  const { surnameHangul, givenHangul, surnameHanja, givenHanja } = input;

  const sound = analyzeSoundElements(surnameHangul + givenHangul, options);

  const base: NameAnalysis = {
    surnameHangul,
    givenHangul,
    sound,
    strokeAnalysis: null,
    harmony: null,
  };

  // 한자 기반 분석 가능 여부 확인.
  if (!surnameHanja || !givenHanja) {
    return { ...base, fallbackReason: "한자를 입력하면 오격·81수리·자원오행을 분석합니다." };
  }

  const surnameInfos = infosFor(surnameHanja);
  const givenInfos = infosFor(givenHanja);
  const allInfos = [...surnameInfos, ...givenInfos];
  if (allInfos.some((i) => i === null)) {
    return {
      ...base,
      fallbackReason: "한자표에 없는 글자가 있어 획수 기반 분석을 생략했습니다(시드 한자표).",
    };
  }

  const surnameStrokes = surnameInfos.map((i) => i!.strokes);
  const givenStrokes = givenInfos.map((i) => i!.strokes);
  const grids = calculateFiveGrids(surnameStrokes, givenStrokes);
  const resourceElements = allInfos.map((i) => i!.element ?? null);

  const strokeAnalysis: StrokeAnalysis = {
    strokes: [...surnameStrokes, ...givenStrokes],
    grids,
    numerology: {
      cheon: numerologyOf(grids.cheon),
      in: numerologyOf(grids.in),
      ji: numerologyOf(grids.ji),
      oe: numerologyOf(grids.oe),
      chong: numerologyOf(grids.chong),
    },
    yinYang: analyzeYinYang([...surnameStrokes, ...givenStrokes]),
    resourceElements,
  };

  const harmony = options.chart
    ? analyzeHarmony(
        options.chart,
        resourceElements.filter((e): e is FiveElement => e !== null),
        sound.elements,
      )
    : null;

  return { ...base, strokeAnalysis, harmony };
}

export type { SoundElementAnalysis, SoundElementSystem } from "./sound-element";
export type { FiveGrids } from "./five-grids";
export type { NumerologyMeaning } from "./numerology";
export type { HarmonyAnalysis } from "./harmony";
