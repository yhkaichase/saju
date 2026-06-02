/**
 * 발음오행(發音五行, 소리오행) — 한글 이름의 자음을 오행으로 보고 글자 간 상생/상극을
 * 따지는 성명학 기법.
 *
 * ## 자음 → 오행 (조음위치 기준)
 *   牙音(어금닛소리) ㄱㅋㄲ = 木
 *   舌音(혓소리)     ㄴㄷㄹㅌㄸ = 火
 *   脣音(입술소리)   ㅁㅂㅍㅃ = **학파 갈림**
 *   齒音(잇소리)     ㅅㅈㅊㅆㅉ = 金
 *   喉音(목구멍소리) ㅇㅎ = **학파 갈림**
 *
 *   - "sulga"(술가/운해본, 신경준 訓民正音韻解 1750 계열): 脣=水, 喉=土.
 *     **현행 작명 실무 주류(약 70~80%)** — 기본값.
 *   - "haerye"(훈민정음 해례본 1446 원전): 脣=土, 喉=水. 원전 충실 학파(소수).
 *   牙·舌·齒(木·火·金)는 두 체계가 동일하고, 脣·喉만 土↔水로 갈립니다.
 *
 * ## 길흉
 *   성→이름1→이름2 순으로 인접 글자의 오행이 상생(相生)이면 길, 상극(相剋)이면 흉,
 *   같으면(比和) 무난으로 봅니다. 기본은 **초성**만 보되 종성(받침)까지 포함하는
 *   옵션을 둡니다(학파차).
 *
 * 근거: general-purpose 리서치(KCI 논문·실무 다수 교차검증). 학파 분기는 토글로 노출.
 *   - 발음오행 주류 술가체계: miso.co.kr/Resource/Theory/20254, irum.com 발음오행
 *   - 脣·喉 土水 논쟁: KCI 「한글 순음·후음의 오행배속에 대한 성명학적 고찰」
 */

import { generates, overcomes } from "../five-elements";
import type { FiveElement } from "@/types/saju";
import { decomposeName, type DecomposedSyllable } from "./hangul";

/** 발음오행 학파. 기본 "sulga"(주류). */
export type SoundElementSystem = "sulga" | "haerye";

/** 자음(초성/종성 단자) → 오행. 겹받침은 분석 시 첫 자음으로 환원합니다. */
const BASE_ELEMENT: Readonly<Record<string, FiveElement>> = {
  // 牙音(木)
  ㄱ: "木",
  ㅋ: "木",
  ㄲ: "木",
  // 舌音(火)
  ㄴ: "火",
  ㄷ: "火",
  ㄹ: "火",
  ㅌ: "火",
  ㄸ: "火",
  // 齒音(金)
  ㅅ: "金",
  ㅈ: "金",
  ㅊ: "金",
  ㅆ: "金",
  ㅉ: "金",
};

/** 脣音·喉音만 학파별로 다른 오행. */
const VARIABLE_ELEMENT: Readonly<Record<SoundElementSystem, Record<string, FiveElement>>> = {
  sulga: { ㅁ: "水", ㅂ: "水", ㅍ: "水", ㅃ: "水", ㅇ: "土", ㅎ: "土" },
  haerye: { ㅁ: "土", ㅂ: "土", ㅍ: "土", ㅃ: "土", ㅇ: "水", ㅎ: "水" },
};

/** 겹받침 → 대표(첫) 자음. 발음오행 판정용. */
const COMPOUND_FINAL_HEAD: Readonly<Record<string, string>> = {
  ㄳ: "ㄱ",
  ㄵ: "ㄴ",
  ㄶ: "ㄴ",
  ㄺ: "ㄹ",
  ㄻ: "ㄹ",
  ㄼ: "ㄹ",
  ㄽ: "ㄹ",
  ㄾ: "ㄹ",
  ㄿ: "ㄹ",
  ㅀ: "ㄹ",
  ㅄ: "ㅂ",
};

/** 단일 자음(초성 또는 종성)의 발음오행. */
export function soundElementOf(
  consonant: string,
  system: SoundElementSystem = "sulga",
): FiveElement {
  const head = COMPOUND_FINAL_HEAD[consonant] ?? consonant;
  const element = BASE_ELEMENT[head] ?? VARIABLE_ELEMENT[system][head];
  if (!element) throw new Error(`발음오행을 알 수 없는 자음: ${consonant}`);
  return element;
}

/** 인접 두 오행의 관계. */
export type ElementRelation = "생" | "극" | "비화";

/** a(앞 글자) → b(뒤 글자)의 상생/상극/비화 관계. */
export function relationBetween(a: FiveElement, b: FiveElement): ElementRelation {
  if (a === b) return "비화";
  if (generates(a, b) || generates(b, a)) return "생";
  if (overcomes(a, b) || overcomes(b, a)) return "극";
  return "비화"; // 오행은 닫혀 있어 도달하지 않음(방어).
}

export interface SoundElementAnalysis {
  system: SoundElementSystem;
  includeJongseong: boolean;
  /** 분석에 쓰인 음절별 오행 흐름(초성, 옵션 시 종성 포함, 글자 순서대로). */
  elements: FiveElement[];
  /** 인접 쌍의 관계(elements.length − 1 개). */
  relations: ElementRelation[];
  /** 인접 관계에 상극(剋)이 없으면 길(吉). */
  isAuspicious: boolean;
}

export interface SoundElementOptions {
  system?: SoundElementSystem;
  /** 종성(받침)까지 흐름에 포함할지. 기본 false(초성만). */
  includeJongseong?: boolean;
}

/**
 * 한글 이름(성+이름)의 발음오행 흐름과 길흉을 분석합니다.
 * 인접 글자(또는 초·종성)의 상생/상극으로 판정합니다.
 */
export function analyzeSoundElements(
  name: string,
  options: SoundElementOptions = {},
): SoundElementAnalysis {
  const system = options.system ?? "sulga";
  const includeJongseong = options.includeJongseong ?? false;
  const syllables = decomposeName(name);

  const elements: FiveElement[] = [];
  for (const syl of syllables as DecomposedSyllable[]) {
    elements.push(soundElementOf(syl.choseong, system));
    if (includeJongseong && syl.jongseong) {
      elements.push(soundElementOf(syl.jongseong, system));
    }
  }

  const relations: ElementRelation[] = [];
  for (let i = 0; i + 1 < elements.length; i++) {
    relations.push(relationBetween(elements[i], elements[i + 1]));
  }
  const isAuspicious = relations.length > 0 && !relations.includes("극");

  return { system, includeJongseong, elements, relations, isAuspicious };
}
