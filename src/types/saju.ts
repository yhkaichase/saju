/**
 * 사주(四柱) 도메인 공용 타입.
 *
 * 식별자는 영문으로 통일하고, 도메인 용어는 한글/한자를 병기합니다.
 * (참고: .claude/rules/coding-style.md, .claude/rules/saju-domain.md)
 */

/** 천간(天干) — 10개. 甲乙丙丁戊己庚辛壬癸 */
export type HeavenlyStem = "甲" | "乙" | "丙" | "丁" | "戊" | "己" | "庚" | "辛" | "壬" | "癸";

/** 지지(地支) — 12개. 子丑寅卯辰巳午未申酉戌亥 */
export type EarthlyBranch =
  | "子"
  | "丑"
  | "寅"
  | "卯"
  | "辰"
  | "巳"
  | "午"
  | "未"
  | "申"
  | "酉"
  | "戌"
  | "亥";

/** 간지(干支) 한 쌍 = 하나의 기둥(柱). */
export interface SexagenaryPair {
  heavenlyStem: HeavenlyStem; // 천간
  earthlyBranch: EarthlyBranch; // 지지
}

/**
 * 사주(四柱) — 연·월·일·시 네 기둥.
 * 각 기둥은 천간 + 지지로 구성됩니다.
 */
export interface FourPillars {
  yearPillar: SexagenaryPair; // 연주(年柱)
  monthPillar: SexagenaryPair; // 월주(月柱)
  dayPillar: SexagenaryPair; // 일주(日柱)
  hourPillar: SexagenaryPair; // 시주(時柱)
}

/** 오행(五行) — 목·화·토·금·수. */
export type FiveElement = "木" | "火" | "土" | "金" | "水";

/** 성별 — 대운(大運) 순행/역행 결정에 사용. */
export type Gender = "male" | "female";

/**
 * 사주 계산 입력.
 *
 * 주의: 시간대·진태양시 보정 정책은 계산 로직 구현 시 명시적으로 정의해야 합니다.
 * (참고: .claude/rules/saju-domain.md — 음양력 변환 / 야자시·조자시)
 */
export interface BirthInput {
  /** 양력 생년월일시 (KST 기준 여부를 호출부에서 명확히 할 것). */
  birthDateTime: Date;
  gender: Gender;
  /** 진태양시(眞太陽時) 보정을 위한 출생지 경도(선택). */
  birthLongitude?: number;
}
