/**
 * UI 표시용 라벨/색상 — 오행별 색, 한글 독음 등 표현(presentation) 전용.
 * 도메인 계산과 무관하므로 app 레이어에 둡니다.
 */

import type { EarthlyBranch, FiveElement, HeavenlyStem, TenGod } from "@/types/saju";

/** 오행별 Tailwind 색상 클래스(배경/글자). */
export const ELEMENT_STYLE: Record<FiveElement, { bg: string; text: string; label: string }> = {
  木: {
    bg: "bg-emerald-100 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "목",
  },
  火: { bg: "bg-rose-100 dark:bg-rose-950", text: "text-rose-700 dark:text-rose-300", label: "화" },
  土: {
    bg: "bg-amber-100 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-300",
    label: "토",
  },
  金: { bg: "bg-zinc-200 dark:bg-zinc-800", text: "text-zinc-700 dark:text-zinc-300", label: "금" },
  水: { bg: "bg-sky-100 dark:bg-sky-950", text: "text-sky-700 dark:text-sky-300", label: "수" },
};

/** 천간 한글 독음. */
export const STEM_READING: Record<HeavenlyStem, string> = {
  甲: "갑",
  乙: "을",
  丙: "병",
  丁: "정",
  戊: "무",
  己: "기",
  庚: "경",
  辛: "신",
  壬: "임",
  癸: "계",
};

/** 지지 한글 독음. */
export const BRANCH_READING: Record<EarthlyBranch, string> = {
  子: "자",
  丑: "축",
  寅: "인",
  卯: "묘",
  辰: "진",
  巳: "사",
  午: "오",
  未: "미",
  申: "신",
  酉: "유",
  戌: "술",
  亥: "해",
};

/** 십신 한글 독음. */
export const TEN_GOD_READING: Record<TenGod, string> = {
  比肩: "비견",
  劫財: "겁재",
  食神: "식신",
  傷官: "상관",
  偏財: "편재",
  正財: "정재",
  偏官: "편관",
  正官: "정관",
  偏印: "편인",
  正印: "정인",
};
