import { describe, expect, it } from "vitest";

import { buildSajuChart } from "../saju-chart";
import { buildInterpretation } from "./index";

describe("buildInterpretation", () => {
  // 1984-06-15 12:30 KST male — 코어/명식 골든과 동일한 명식.
  // 명식: 甲子(년) 庚午(월) 庚辰(일) 壬午(시), 일간 庚(陽金).
  const chart = buildSajuChart({
    year: 1984,
    month: 6,
    day: 15,
    hour: 12,
    minute: 30,
    gender: "male",
  });
  const interp = buildInterpretation(chart);

  it("일간 해석은 일주 천간(庚) 기준이다", () => {
    expect(interp.dayMaster.stem).toBe("庚");
    expect(interp.dayMaster.yinYang).toBe("陽");
    expect(interp.dayMaster.title).toContain("庚金");
  });

  it("오행 분포는 8글자(천간4+지지4)를 집계한다", () => {
    // 甲(木) 子(水) / 庚(金) 午(火) / 庚(金) 辰(土) / 壬(水) 午(火)
    expect(interp.fiveElements.counts).toEqual({ 木: 1, 火: 2, 土: 1, 金: 2, 水: 2 });
    const total = Object.values(interp.fiveElements.counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(8);
  });

  it("최다 오행과 부재 오행을 가려낸다", () => {
    // 火·金·水 각 2개로 최다, 부재 오행 없음.
    expect(interp.fiveElements.dominant.sort()).toEqual(["水", "火", "金"].sort());
    expect(interp.fiveElements.lacking).toEqual([]);
    expect(interp.fiveElements.summary).toContain("균형");
  });

  it("십신은 일간 제외하고 집계되며 正官이 최다(2)다", () => {
    // 偏財·傷官·比肩·正官·正官·偏印·食神 → 正官×2.
    expect(interp.tenGods.counts["正官"]).toBe(2);
    expect(interp.tenGods.highlights[0]?.tenGod).toBe("正官");
    expect(interp.tenGods.highlights[0]?.info.keyword).toContain("명예");
    const total = interp.tenGods.highlights.reduce((sum, h) => sum + h.count, 0);
    expect(total).toBe(7); // 8칸 중 일간 천간 1칸 제외.
  });

  it("대운 방향·시작 나이를 요약에 반영한다", () => {
    expect(interp.majorFortune.isForward).toBe(true);
    expect(interp.majorFortune.summary).toContain("순행");
  });
});
