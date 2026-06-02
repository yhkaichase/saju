import { describe, expect, it } from "vitest";

import { HANJA_TABLE, hanjaCandidates, lookupHanja, lookupHanjaName } from "./hanja-data";

describe("hanja-data — 강희원획·자원오행 시드", () => {
  it("변형부수 원획 보정이 반영됨 (氵=水4 → 洪=10)", () => {
    expect(lookupHanja("洪")).toMatchObject({ strokes: 10, element: "水" });
    expect(lookupHanja("浩")?.strokes).toBe(11); // 氵4+告7
    expect(lookupHanja("英")?.strokes).toBe(11); // 艹6+央5
  });

  it("구슬옥변(王=玉5) 보정 (珍=10)", () => {
    expect(lookupHanja("珍")).toMatchObject({ strokes: 10, element: "金" });
  });

  it("대표 성씨 원획", () => {
    expect(lookupHanja("金")?.strokes).toBe(8);
    expect(lookupHanja("李")?.strokes).toBe(7);
    expect(lookupHanja("朴")?.strokes).toBe(6);
    expect(lookupHanja("黃")?.strokes).toBe(12);
  });

  it("미수록 한자는 null (우아한 폴백)", () => {
    expect(lookupHanja("龘")).toBeNull();
  });

  it("이름 문자열 일괄 조회 (일부 미수록 포함)", () => {
    const r = lookupHanjaName("李龘武");
    expect(r[0]?.strokes).toBe(7);
    expect(r[1]).toBeNull();
    expect(r[2]?.strokes).toBe(8);
  });

  it("자원오행은 부수 명확한 글자만 채움(모호하면 생략)", () => {
    expect(lookupHanja("金")?.element).toBe("金");
    expect(lookupHanja("姜")?.element).toBeUndefined(); // 모호 → 비움
  });

  it("독음으로 한자 후보를 찾는다(획수 오름차순)", () => {
    const yeong = hanjaCandidates("영").map((c) => c.char);
    expect(yeong).toContain("永"); // 5획
    expect(yeong).toContain("英"); // 11획
    // 획수 오름차순: 永(5) < 煐(13)
    const strokes = hanjaCandidates("영").map((c) => c.strokes);
    expect([...strokes]).toEqual([...strokes].sort((a, b) => a - b));
    expect(hanjaCandidates("없는음")).toEqual([]);
  });

  it("모든 항목의 reading은 한글 1글자", () => {
    for (const [ch, info] of Object.entries(HANJA_TABLE)) {
      expect(info.reading.length, ch).toBe(1);
    }
  });

  it("모든 항목의 원획수는 양의 정수", () => {
    for (const [ch, info] of Object.entries(HANJA_TABLE)) {
      expect(Number.isInteger(info.strokes), ch).toBe(true);
      expect(info.strokes, ch).toBeGreaterThan(0);
    }
  });
});
