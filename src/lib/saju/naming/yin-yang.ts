/**
 * 음양(陰陽) 배열 — 성명 각 글자 획수의 홀짝으로 음양을 보고, 고른 섞임을 길로 봅니다.
 *
 * ## 규칙
 *   - 획수 홀수 = 양(陽), 짝수 = 음(陰).
 *   - 성명 전체가 순양(모두 홀)이거나 순음(모두 짝)이면 조화 실패 → 흉.
 *   - 양·음이 섞여 있으면 길(많고 적음은 불문, "섞임" 여부가 관건).
 *
 * 근거: general-purpose 리서치(irum·miso 음양 항목 교차검증).
 */

export type YinYangMark = "陽" | "陰";

export interface YinYangAnalysis {
  /** 글자별 음양(획수 홀짝). */
  marks: YinYangMark[];
  /** 양·음이 섞였는지(순양·순음이 아닌지). */
  isMixed: boolean;
  /** 섞여 있으면 길. */
  isAuspicious: boolean;
}

/** 획수의 음양(홀=陽, 짝=陰). */
export function yinYangOfStroke(stroke: number): YinYangMark {
  return stroke % 2 === 1 ? "陽" : "陰";
}

/**
 * 성명 전체 글자 획수 배열의 음양 배열과 길흉을 분석합니다.
 * @param strokes 성+이름 각 글자의 원획수(순서대로).
 */
export function analyzeYinYang(strokes: number[]): YinYangAnalysis {
  if (strokes.length === 0) throw new Error("획수가 1글자 이상 필요합니다.");
  const marks = strokes.map(yinYangOfStroke);
  const isMixed = marks.includes("陽") && marks.includes("陰");
  return { marks, isMixed, isAuspicious: isMixed };
}
