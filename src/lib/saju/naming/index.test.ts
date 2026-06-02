import { describe, expect, it } from "vitest";

import { buildSajuChart } from "../saju-chart";
import { buildNameAnalysis } from "./index";

describe("buildNameAnalysis — 성명학 통합", () => {
  it("한글만: 발음오행은 나오고 획수 분석은 폴백", () => {
    const r = buildNameAnalysis({ surnameHangul: "황", givenHangul: "연정" });
    expect(r.sound.elements.length).toBe(3); // 초성 3
    expect(r.strokeAnalysis).toBeNull();
    expect(r.fallbackReason).toContain("한자");
  });

  it("한자까지: 오격·81수리·음양·자원오행 산출 (李正武)", () => {
    const r = buildNameAnalysis({
      surnameHangul: "이",
      givenHangul: "정무",
      surnameHanja: "李",
      givenHanja: "正武",
    });
    expect(r.strokeAnalysis).not.toBeNull();
    expect(r.strokeAnalysis!.grids).toEqual({
      cheon: 7,
      in: 12,
      ji: 13,
      oe: 15,
      chong: 20,
    });
    // 總격 20 = 흉(허망격), 人격 12 = 흉(박약격).
    expect(r.strokeAnalysis!.numerology.chong.fortune).toBe("흉");
    expect(r.strokeAnalysis!.numerology.in.fortune).toBe("흉");
    expect(r.strokeAnalysis!.strokes).toEqual([7, 5, 8]);
  });

  it("한자표 미수록 글자가 있으면 획수 분석 폴백", () => {
    const r = buildNameAnalysis({
      surnameHangul: "이",
      givenHangul: "용",
      surnameHanja: "李",
      givenHanja: "龘", // 미수록
    });
    expect(r.strokeAnalysis).toBeNull();
    expect(r.fallbackReason).toContain("한자표");
  });

  it("chart를 주면 사주 오행 조화까지 분석", () => {
    const chart = buildSajuChart({
      year: 1984,
      month: 6,
      day: 15,
      hour: 12,
      minute: 30,
      gender: "male",
    });
    const r = buildNameAnalysis(
      { surnameHangul: "이", givenHangul: "정무", surnameHanja: "李", givenHanja: "正武" },
      { chart },
    );
    expect(r.harmony).not.toBeNull();
    expect(r.harmony!.needed.length).toBeGreaterThan(0);
  });

  it("학파 옵션이 발음오행에 전달된다", () => {
    const sulga = buildNameAnalysis(
      { surnameHangul: "박", givenHangul: "민" },
      { system: "sulga" },
    );
    const haerye = buildNameAnalysis(
      { surnameHangul: "박", givenHangul: "민" },
      { system: "haerye" },
    );
    expect(sulga.sound.elements).not.toEqual(haerye.sound.elements);
  });

  it("실명 골든 崔永夏(11·5·10) → 天11 人16 地15 外21 總26", () => {
    const r = buildNameAnalysis({
      surnameHangul: "최",
      givenHangul: "영하",
      surnameHanja: "崔",
      givenHanja: "永夏",
    });
    expect(r.strokeAnalysis!.grids).toEqual({ cheon: 11, in: 16, ji: 15, oe: 21, chong: 26 });
    expect(r.strokeAnalysis!.resourceElements).toEqual(["土", "水", "火"]);
    // 발음오행 ㅊ(金)·ㅇ(土)·ㅎ(土): 土生金·비화 → 극 없음 → 길.
    expect(r.sound.elements).toEqual(["金", "土", "土"]);
    expect(r.sound.isAuspicious).toBe(true);
  });

  it("실명 골든 黃筵定(12·13·8) → 天12 人25 地21 外20 總33", () => {
    const r = buildNameAnalysis({
      surnameHangul: "황",
      givenHangul: "연정",
      surnameHanja: "黃",
      givenHanja: "筵定",
    });
    expect(r.strokeAnalysis!.grids).toEqual({ cheon: 12, in: 25, ji: 21, oe: 20, chong: 33 });
    // 定은 자원오행 모호 → 미상(null).
    expect(r.strokeAnalysis!.resourceElements).toEqual(["土", "木", null]);
  });
});
