/**
 * 엄선 한자 데이터 — 성명학용 강희(康熙) 원획수 + 자원오행(字源五行).
 *
 * ## 정책 (정확성 최우선)
 *   - **원획수(strokes)**: 강희자전 부수 원획법. 변형부수를 본래 글자로 복원해 셈
 *     (氵=水 4, 艹=艸 6, 阝우=邑 7/좌=阜 8, 月=肉 6, 扌=手 4 등).
 *   - **자원오행(element)**: 부수·자의가 명확한 글자만 채우고, 모호하면 비웁니다
 *     (자원오행은 부수만으로 일률 결정되지 않아 추정을 피함 — 리서치 경고 반영).
 *   - 미수록 한자는 lookup이 null을 반환 → 상위 레이어가 발음오행만 쓰거나 획수
 *     수동입력으로 우아하게 폴백합니다.
 *
 * ⚠️ 이 표는 **확장 가능한 엄선 시드**입니다. 값은 흔히 통용되는 강희원획 기준이며,
 *   권위 서적(예: 김기승 『자원오행 성명학』)과 표본 대조 후 확장하세요.
 *
 * 근거: general-purpose 리서치(강희 원획법·변형부수 표·자원오행 분류 교차검증).
 */

import type { FiveElement } from "@/types/saju";

export interface HanjaInfo {
  /** 한글 독음(후보 선택·표시용). */
  reading: string;
  /** 강희 원획수. */
  strokes: number;
  /** 자원오행. 부수·자의가 명확할 때만. 모호하면 생략. */
  element?: FiveElement;
}

/**
 * 한자 → 정보. 키는 단일 한자.
 * 성씨는 한국 인구 다수를 덮는 상위 성을 우선 수록. 이름 한자는 빈출자 위주.
 * (원획수는 [본래부수획 + 나머지획]으로 검산해 주석)
 */
export const HANJA_TABLE: Readonly<Record<string, HanjaInfo>> = {
  // ── 성씨(姓) ──
  金: { reading: "김", strokes: 8, element: "金" }, // 金 8
  李: { reading: "이", strokes: 7, element: "木" }, // 木4+子3
  朴: { reading: "박", strokes: 6, element: "木" }, // 木4+卜2
  林: { reading: "임", strokes: 8, element: "木" }, // 木4+木4
  崔: { reading: "최", strokes: 11, element: "土" }, // 山3+隹8
  姜: { reading: "강", strokes: 9 }, // 9
  尹: { reading: "윤", strokes: 4 }, // 4
  張: { reading: "장", strokes: 11 }, // 弓3+長8
  韓: { reading: "한", strokes: 17 }, // 17
  吳: { reading: "오", strokes: 7 }, // 7
  申: { reading: "신", strokes: 5 }, // 5
  徐: { reading: "서", strokes: 10 }, // 彳3+余7
  黃: { reading: "황", strokes: 12, element: "土" }, // 12 (누를 황)
  安: { reading: "안", strokes: 6 }, // 宀3+女3
  宋: { reading: "송", strokes: 7, element: "木" }, // 宀3+木4
  洪: { reading: "홍", strokes: 10, element: "水" }, // 氵4+共6
  全: { reading: "전", strokes: 6 }, // 入2+王4
  高: { reading: "고", strokes: 10 }, // 10
  文: { reading: "문", strokes: 4, element: "水" }, // 4
  孫: { reading: "손", strokes: 10 }, // 子3+系7? (孫 10)
  白: { reading: "백", strokes: 5, element: "金" }, // 5 (흰 백)
  南: { reading: "남", strokes: 9 }, // 9
  沈: { reading: "심", strokes: 8, element: "水" }, // 氵4+冘4
  柳: { reading: "유", strokes: 9, element: "木" }, // 木4+卯5
  河: { reading: "하", strokes: 9, element: "水" }, // 氵4+可5
  成: { reading: "성", strokes: 7 }, // 7
  車: { reading: "차", strokes: 7 }, // 7 (수레 차)
  朱: { reading: "주", strokes: 6, element: "木" }, // 6 (붉을 주, 木 자원)
  禹: { reading: "우", strokes: 9 }, // 9
  辛: { reading: "신", strokes: 7, element: "金" }, // 7 (매울 신, 金)

  // ── 이름(名) 빈출 한자 ──
  正: { reading: "정", strokes: 5 }, // 止4+一1
  武: { reading: "무", strokes: 8 }, // 8
  民: { reading: "민", strokes: 5 }, // 5
  秀: { reading: "수", strokes: 7, element: "木" }, // 禾5+乃2 (벼 화)
  英: { reading: "영", strokes: 11, element: "木" }, // 艹6+央5 (초두 6)
  浩: { reading: "호", strokes: 11, element: "水" }, // 氵4+告7
  俊: { reading: "준", strokes: 9 }, // 亻2+夋7
  賢: { reading: "현", strokes: 15 }, // 15
  智: { reading: "지", strokes: 12 }, // 知8+日4
  美: { reading: "미", strokes: 9 }, // 9
  珍: { reading: "진", strokes: 10, element: "金" }, // 王(玉)5+㐱5 (구슬옥변 5)
  瑞: { reading: "서", strokes: 14, element: "金" }, // 王(玉)5+耑9
  炫: { reading: "현", strokes: 9, element: "火" }, // 火4+玄5
  煐: { reading: "영", strokes: 13, element: "火" }, // 火4+英9
  宇: { reading: "우", strokes: 6 }, // 宀3+于3
  植: { reading: "식", strokes: 12, element: "木" }, // 木4+直8
  根: { reading: "근", strokes: 10, element: "木" }, // 木4+艮6
  泰: { reading: "태", strokes: 9, element: "水" }, // 9 (클 태, 水)
  恩: { reading: "은", strokes: 10 }, // 因6+心4
  娟: { reading: "연", strokes: 10 }, // 女3+肙7
  延: { reading: "연", strokes: 7 }, // 7 (늘일 연)
  贊: { reading: "찬", strokes: 19 }, // 19
  永: { reading: "영", strokes: 5, element: "水" }, // 5 (길 영, 水)
  夏: { reading: "하", strokes: 10, element: "火" }, // 10 (여름 하, 火)
  筵: { reading: "연", strokes: 13, element: "木" }, // 竹6+延7 (대자리 연, 竹→木)
  定: { reading: "정", strokes: 8 }, // 宀3+疋5 (정할 정, 자원 모호 → 비움)
};

/** 한자 한 글자의 정보를 찾습니다. 미수록이면 null. */
export function lookupHanja(ch: string): HanjaInfo | null {
  return HANJA_TABLE[ch] ?? null;
}

/** 한자 문자열의 각 글자 정보를 찾습니다(미수록은 null). */
export function lookupHanjaName(name: string): Array<HanjaInfo | null> {
  return [...name].map(lookupHanja);
}

/** 한 한자 후보(글자 + 정보). */
export interface HanjaCandidate extends HanjaInfo {
  char: string;
}

/** 독음(한글 한 글자)에 해당하는 한자 후보 목록(시드 한자표 기준, 획수 오름차순). */
export function hanjaCandidates(reading: string): HanjaCandidate[] {
  return Object.entries(HANJA_TABLE)
    .filter(([, info]) => info.reading === reading)
    .map(([char, info]) => ({ char, ...info }))
    .sort((a, b) => a.strokes - b.strokes);
}
