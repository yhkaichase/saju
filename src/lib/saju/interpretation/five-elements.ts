/**
 * 오행(五行) 해석 데이터 — 목·화·토·금·수의 상징 통설.
 *
 * 오행 분포(8글자: 천간 4 + 지지 4)의 많고 적음으로 기운의 치우침을 가늠합니다.
 * 아래는 각 오행이 상징하는 덕목·성향의 일반적 통설입니다.
 */

import type { FiveElement } from "@/types/saju";

export interface FiveElementText {
  /** 한글 라벨. */
  label: string;
  /** 핵심 키워드. */
  keyword: string;
  /** 1문장 상징 설명. */
  text: string;
}

export const FIVE_ELEMENT_TEXT: Readonly<Record<FiveElement, FiveElementText>> = {
  木: {
    label: "목(木)",
    keyword: "성장, 인(仁), 기획",
    text: "뻗어 자라는 기운으로 추진력·성장·인자함을 상징합니다.",
  },
  火: {
    label: "화(火)",
    keyword: "확산, 예(禮), 열정",
    text: "타오르며 퍼지는 기운으로 표현력·열정·예의를 상징합니다.",
  },
  土: {
    label: "토(土)",
    keyword: "중재, 신(信), 안정",
    text: "중심을 잡는 기운으로 신용·포용·안정을 상징합니다.",
  },
  金: {
    label: "금(金)",
    keyword: "결실, 의(義), 결단",
    text: "단단히 맺는 기운으로 결단력·원칙·의리를 상징합니다.",
  },
  水: {
    label: "수(水)",
    keyword: "지혜, 지(智), 유연",
    text: "흐르고 스미는 기운으로 지혜·융통·통찰을 상징합니다.",
  },
};
