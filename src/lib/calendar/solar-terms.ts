/**
 * 절기(節氣) 시각 계산.
 *
 * 사주의 연주(年柱)·월주(月柱) 경계는 음력 초하루가 아니라 **절기**입니다.
 * 절기는 태양황경(黃經)이 특정 각도에 도달하는 순간으로 정의됩니다.
 *
 * ## 천문 계산 출처/정밀도
 * - 라이브러리: `astronomy-engine` v2.1.19 (순수 TS, Jean Meeus 알고리즘 기반).
 *   `SearchSunLongitude(targetLon, startTime, limitDays)` 로 태양 겉보기 황경이
 *   목표값에 도달하는 UTC 시각을 구합니다.
 * - 정밀도: 사주에 필요한 분(分) 단위로 충분(라이브러리 자체는 ~1초급).
 * - 시간대: 라이브러리는 **UTC** 기준. KST(UTC+9)가 필요하면 호출부에서 변환합니다.
 *
 * ## ⚠️ KASI 교차검증 (미해결 TODO)
 * 한국 사주의 정답 기준은 KASI(한국천문연구원) 공식 절기 시각입니다.
 * astronomy-engine 결과는 KASI 공식값과 분~수십분 단위로 어긋날 수 있으므로,
 * **입춘 등 경계 절기 시각을 KASI 공식 데이터로 골든 검증**해야 합니다.
 * 현재는 라이브러리 계산값을 사용하며, KASI 1차 대조는 후속 과제로 남깁니다.
 * (참고: .claude/rules/saju-domain.md, ./README.md)
 */

import { SearchSunLongitude, SunPosition } from "astronomy-engine";

/**
 * 사주 월주(月柱)에 쓰는 12절기(節) — 각 절기가 시작하는 태양황경(도).
 *
 * 24절기 중 "절(節)"만 사용하며(중기 中氣 제외), 입춘(立春, 315°)부터 시작해
 * 황경이 30°씩 증가하는 12개입니다. 인월(寅月)이 입춘부터 시작하는 정월(正月).
 * (각 절기가 시작하는 월지는 SOLAR_TERM_TO_MONTH_BRANCH 참고)
 */
export const TWELVE_SOLAR_TERMS = [
  { name: "立春", longitude: 315 }, // 입춘 — 寅月 시작 (연주 경계)
  { name: "驚蟄", longitude: 345 }, // 경칩 — 卯月
  { name: "清明", longitude: 15 }, // 청명 — 辰月
  { name: "立夏", longitude: 45 }, // 입하 — 巳月
  { name: "芒種", longitude: 75 }, // 망종 — 午月
  { name: "小暑", longitude: 105 }, // 소서 — 未月
  { name: "立秋", longitude: 135 }, // 입추 — 申月
  { name: "白露", longitude: 165 }, // 백로 — 酉月
  { name: "寒露", longitude: 195 }, // 한로 — 戌月
  { name: "立冬", longitude: 225 }, // 입동 — 亥月
  { name: "大雪", longitude: 255 }, // 대설 — 子月
  { name: "小寒", longitude: 285 }, // 소한 — 丑月
] as const;

/**
 * 주어진 태양황경에 도달하는 시각(UTC)을 구합니다.
 *
 * @param targetLongitude 목표 태양황경(도, 0~360).
 * @param startTime       탐색 시작 UTC 시각. 목표 도달 시점보다 앞서야 합니다.
 * @param limitDays       탐색 범위(일). 기본 30일(한 절기 간격 ~30.4일을 커버).
 * @returns 목표 황경 도달 UTC 시각(Date). 범위 내에서 못 찾으면 null.
 */
export function findSolarLongitudeTime(
  targetLongitude: number,
  startTime: Date,
  limitDays = 30,
): Date | null {
  const result = SearchSunLongitude(targetLongitude, startTime, limitDays);
  return result ? result.date : null;
}

/** 입춘(立春) 태양황경 — 연주(年柱)의 경계이자 寅月의 시작. */
export const IPCHUN_LONGITUDE = 315;

/**
 * 주어진 UTC 시각의 태양 겉보기 황경(도, 0~360)을 반환합니다.
 *
 * 월주(月柱)의 월지(月支)는 절입 시각을 따로 탐색하지 않고 이 황경으로 즉시
 * 구간 판정할 수 있습니다(연말/연초를 가로지르는 子월·丑월도 자연 처리).
 */
export function sunEclipticLongitude(time: Date): number {
  return SunPosition(time).elon;
}

/**
 * 해당 연도의 입춘(立春) 절입 시각(UTC)을 구합니다.
 *
 * 입춘은 매년 양력 2/3~2/4이므로 1/20부터 40일 범위를 탐색합니다.
 * 연주(年柱)는 이 시각(이상이면 신년)으로 경계를 가릅니다.
 *
 * @throws 탐색 실패 시(정상 입력에서는 발생하지 않음).
 */
export function ipchunInstantUtc(year: number): Date {
  const start = new Date(Date.UTC(year, 0, 20));
  const result = SearchSunLongitude(IPCHUN_LONGITUDE, start, 40);
  if (result === null) {
    throw new Error(`입춘 시각 탐색 실패: year=${year}`);
  }
  return result.date;
}
