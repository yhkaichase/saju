/**
 * 오행(五行) — 천간·지지의 목화토금수 분류, 음양, 생극(生剋) 관계.
 *
 * 이 매핑은 명리학에서 확정된 도메인 상수입니다(천문 계산 불필요).
 * (참고: .claude/rules/saju-domain.md — 파생 계산)
 */

import { EARTHLY_BRANCH_PRIMARY_STEM, EARTHLY_BRANCHES } from "./constants";
import type { EarthlyBranch, FiveElement, HeavenlyStem, YinYang } from "@/types/saju";

/**
 * 천간(天干)의 오행. 甲乙=木, 丙丁=火, 戊己=土, 庚辛=金, 壬癸=水.
 * HEAVENLY_STEMS 순서와 1:1 대응.
 */
export const HEAVENLY_STEM_ELEMENT: Readonly<Record<HeavenlyStem, FiveElement>> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

/** 천간의 음양. 순서대로 陽陰 교대(甲=陽, 乙=陰, …). */
export const HEAVENLY_STEM_YIN_YANG: Readonly<Record<HeavenlyStem, YinYang>> = {
  甲: "陽",
  乙: "陰",
  丙: "陽",
  丁: "陰",
  戊: "陽",
  己: "陰",
  庚: "陽",
  辛: "陰",
  壬: "陽",
  癸: "陰",
};

/**
 * 지지(地支)의 오행 — **본기(本氣) 천간에서 파생**(SSOT).
 * 결과: 寅卯=木, 巳午=火, 申酉=金, 亥子=水, 辰戌丑未=土.
 */
export const EARTHLY_BRANCH_ELEMENT: Readonly<Record<EarthlyBranch, FiveElement>> =
  Object.fromEntries(
    EARTHLY_BRANCHES.map((b) => [b, HEAVENLY_STEM_ELEMENT[EARTHLY_BRANCH_PRIMARY_STEM[b]]]),
  ) as Record<EarthlyBranch, FiveElement>;

/**
 * 지지의 음양 — **본기 천간의 음양(용用)**. 십신(十神) 계산에는 이 값을 쓰세요.
 *
 * ⚠️ 자리 순서(체體, idx%2)와는 子午巳亥에서 갈립니다:
 *   子=陰水, 午=陰火, 巳=陽火, 亥=陽水 (체로 보면 반대).
 * 십신 음양 비교에 체를 쓰면 이 네 글자에서 오답이 나므로 반드시 본기를 사용합니다.
 */
export const EARTHLY_BRANCH_YIN_YANG: Readonly<Record<EarthlyBranch, YinYang>> = Object.fromEntries(
  EARTHLY_BRANCHES.map((b) => [b, HEAVENLY_STEM_YIN_YANG[EARTHLY_BRANCH_PRIMARY_STEM[b]]]),
) as Record<EarthlyBranch, YinYang>;

/** 오행 상생(相生): 木→火→土→金→水→木. key가 value를 생(生)함. */
export const FIVE_ELEMENT_GENERATES: Readonly<Record<FiveElement, FiveElement>> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

/** 오행 상극(相剋): 木→土→水→火→金→木. key가 value를 극(剋)함. */
export const FIVE_ELEMENT_OVERCOMES: Readonly<Record<FiveElement, FiveElement>> = {
  木: "土",
  土: "水",
  水: "火",
  火: "金",
  金: "木",
};

/** a가 b를 생(生)하는가. */
export function generates(a: FiveElement, b: FiveElement): boolean {
  return FIVE_ELEMENT_GENERATES[a] === b;
}

/** a가 b를 극(剋)하는가. */
export function overcomes(a: FiveElement, b: FiveElement): boolean {
  return FIVE_ELEMENT_OVERCOMES[a] === b;
}
