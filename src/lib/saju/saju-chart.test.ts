import { describe, expect, it } from "vitest";

import { calculateFourPillars } from "./four-pillars";
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

  it("진태양시 보정 내역(solarTime)이 포함된다 — 서울 기준 약 −30분", () => {
    // 정오는 보정해도 같은 시진(午)이라 기존 명식은 유지된다(위 골든들 통과가 증거).
    expect(chart.solarTime.longitude).toBeCloseTo(126.978, 3);
    // 경도보정 −32분 ± 균시차(6월 ≈ 0) → 대략 −30 ~ −33분.
    expect(chart.solarTime.offsetMinutes).toBeLessThanOrEqual(-30);
    expect(chart.solarTime.offsetMinutes).toBeGreaterThanOrEqual(-34);
    expect(chart.solarTime.standard).toEqual({ hour: 12, minute: 30 });
  });
});

describe("buildSajuChart — 진태양시 보정 골든", () => {
  it("시지 경계: 13:15 표준시(未時)가 보정 후 午時로 바뀐다", () => {
    const input = { year: 2000, month: 6, day: 15, hour: 13, minute: 15, gender: "male" } as const;
    // 표준시(코어 직접 계산)는 未時.
    expect(calculateFourPillars(input).hourPillar.earthlyBranch).toBe("未");
    // 진태양시 보정(서울 −33분 → 12:42) 적용 시 午時.
    const chart = buildSajuChart(input);
    expect(chart.solarTime.corrected).toEqual({ hour: 12, minute: 42 });
    expect(chart.hour.branch.value).toBe("午");
  });

  it("일주 경계: 00:10 표준시가 보정으로 전날 23:37이 되어 일주가 하루 당겨진다", () => {
    const input = { year: 2020, month: 4, day: 15, hour: 0, minute: 10, gender: "male" } as const;
    // 표준시(자정 기준)는 4/15 일주.
    const standardDay = calculateFourPillars(input).dayPillar;
    expect(`${standardDay.heavenlyStem}${standardDay.earthlyBranch}`).toBe("戊子");
    // 진태양시 보정으로 4/14 23:37 → 일주는 전날(丁亥), 시지는 子.
    const chart = buildSajuChart(input);
    expect(chart.solarTime.corrected).toEqual({ hour: 23, minute: 37 });
    expect(`${chart.day.stem.value}${chart.day.branch.value}`).toBe("丁亥");
    expect(chart.hour.branch.value).toBe("子");
  });
});
