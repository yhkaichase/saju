/**
 * 일주(日柱, day pillar) 계산.
 *
 * 일주는 천문 계산 없이 **검증된 기준일 + 60갑자 연속 순환**으로 결정됩니다.
 *
 * ## 공식
 *   dayPillarIndex = ((JDN + 49) % 60 + 60) % 60   // 0 = 甲子 … 59 = 癸亥
 *
 * - 인덱스 규약은 `SEXAGENARY_CYCLE`(index 0 = 甲子)와 일치합니다.
 * - offset 49 는 천문 표준 문헌의 `(JDN − 11) mod 60`(1-based 甲子=1)과 수학적으로
 *   동일합니다(−11 ≡ 49 mod 60).
 *
 * ## 근거 / 교차검증 (앵커)
 *   1949-10-01 = 甲子(갑자). 영문 위키백과 *Sexagenary cycle* 문서의 일주 계산
 *   worked example, Cantian.ai, 다수 중국 만년력에서 교차 확인.
 *   (커밋 전 KASI 기반 만세력으로 1회 육안 대조 권장)
 *
 * ## 일자 경계 정책 (학파 분기)
 *   일주가 바뀌는 시점은 명리학 학파별로 갈립니다.
 *   - "midnight"(기본): 자정(00:00 KST)에 일주가 바뀜. 야자시(夜子時)·조자시(朝子時)
 *     구분설과 정합. 일주 계산이 날짜만으로 순수하게 결정됨.
 *   - "zishi23": 자시(子時, 23:00)부터 다음날로 봄(정자시설). 실무 만세력 다수가 채택.
 *     23:00~23:59 출생 시 "midnight"과 일주가 하루 차이로 달라짐.
 *   ⚠️ 유일한 정답이 아니므로 정책을 명시적으로 선택합니다. 기본값은 "midnight".
 *
 * (참고: .claude/rules/saju-domain.md, ./README 없음 — calendar/README.md 참고)
 */

import { gregorianToJulianDayNumber } from "@/lib/calendar/julian-day";
import { SEXAGENARY_CYCLE } from "@/lib/saju/constants";
import type { SexagenaryPair } from "@/types/saju";

/** 일주 경계 정책. 자정 기준(기본) / 자시(23:00) 기준. */
export type DayBoundaryPolicy = "midnight" | "zishi23";

/**
 * 일주 계산 입력 — **KST(UTC+9) 기준 양력 벽시계** 연·월·일·시.
 *
 * 시간대 변환은 이 순수 함수의 바깥(경계 레이어) 책임입니다. JS `Date`의
 * UTC 게터로 뽑은 값을 넘기지 마세요(자정 근처에서 하루가 밀립니다).
 */
export interface DayPillarInput {
  /** 양력 연도 (KST). */
  year: number;
  /** 1~12 (KST). */
  month: number;
  /** 1~31 (KST). */
  day: number;
  /** 0~23 (KST). "zishi23" 정책에서만 사용. 미지정 시 0으로 간주. */
  hour?: number;
  /** 일자 경계 정책. 기본 "midnight". */
  dayBoundaryPolicy?: DayBoundaryPolicy;
}

/** 60갑자 길이 — 매직 넘버 추출. */
const SEXAGENARY_LENGTH = 60;

/**
 * 일주 인덱스를 결정하는 offset.
 * 1949-10-01(甲子, index 0)을 만족: (2433191 + 49) % 60 = 0.
 */
const DAY_PILLAR_OFFSET = 49;

/**
 * 주어진 KST 양력 날짜/시각의 일주(日柱) 간지를 반환합니다.
 *
 * "zishi23" 정책에서 23시(자시) 이후면 일주를 다음날로 넘깁니다.
 * JDN은 연속 일수이므로 +1 만으로 월/연 경계가 자동 처리됩니다.
 */
export function calculateDayPillar(input: DayPillarInput): SexagenaryPair {
  const { year, month, day, hour = 0, dayBoundaryPolicy = "midnight" } = input;

  let jdn = gregorianToJulianDayNumber(year, month, day);

  // 자시설: 23:00~23:59 출생은 이미 다음 일주로 본다.
  if (dayBoundaryPolicy === "zishi23" && hour >= 23) {
    jdn += 1;
  }

  const index =
    (((jdn + DAY_PILLAR_OFFSET) % SEXAGENARY_LENGTH) + SEXAGENARY_LENGTH) % SEXAGENARY_LENGTH;

  return SEXAGENARY_CYCLE[index];
}
