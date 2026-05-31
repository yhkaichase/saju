import { describe, expect, it } from "vitest";

import { buildSajuChart } from "./saju-chart";

describe("buildSajuChart", () => {
  // 1984-06-15 12:30 KST male — 코어 골든과 동일한 명식.
  const chart = buildSajuChart({
    year: 1984,
    month: 6,
    day: 15,
    hour: 12,
    minute: 30,
    gender: "male",
  });

  it("4기둥 간지가 코어 계산과 일치", () => {
    expect(chart.year.stem.value).toBe("甲");
    expect(chart.year.branch.value).toBe("子");
    expect(chart.month.stem.value).toBe("庚");
    expect(chart.month.branch.value).toBe("午");
    expect(chart.day.stem.value).toBe("庚");
    expect(chart.day.branch.value).toBe("辰");
    expect(chart.hour.stem.value).toBe("壬");
    expect(chart.hour.branch.value).toBe("午");
  });

  it("일간(dayMaster)은 일주의 천간", () => {
    expect(chart.dayMaster).toBe("庚");
  });

  it("일간 칸의 십신은 null, 나머지 천간은 십신 라벨", () => {
    expect(chart.day.stem.tenGod).toBeNull();
    // 일간 庚(陽金) 기준 연간 甲(陽木): 金剋木 → 偏財.
    expect(chart.year.stem.tenGod).toBe("偏財");
  });

  it("천간·지지에 오행 라벨이 매겨진다", () => {
    expect(chart.year.stem.element).toBe("木"); // 甲
    expect(chart.year.branch.element).toBe("水"); // 子
    expect(chart.day.stem.element).toBe("金"); // 庚
  });

  it("지지 십신은 본기 기준 (午 본기 丁=陰火, 庚 일간 → 正官)", () => {
    // 火剋金, 庚(陽)·丁(陰) 음양 다름 → 正官.
    expect(chart.month.branch.tenGod).toBe("正官");
  });

  it("대운(majorFortune)이 포함된다", () => {
    expect(chart.majorFortune.direction).toBe("forward");
    expect(chart.majorFortune.periods.length).toBeGreaterThan(0);
  });
});
