/**
 * 진태양시(眞太陽時, Local Apparent Solar Time) 보정.
 *
 * 한국 표준시(KST, UTC+9)는 동경 135° 자오선 기준의 "평균시(mean time)"입니다.
 * 사주 시주(時柱)·자시(子時) 경계를 출생지 하늘의 실제 태양 위치에 맞추려면 두 가지를
 * 보정해야 합니다.
 *
 *   진태양시 = 표준시(벽시계) + 경도보정 + 균시차
 *
 *   1) 경도 보정(longitude): 표준 자오선(135°)과 출생지 경도(L)의 차이.
 *      보정(분) = (L − 135) × 4분/도.   (지구 1° 회전 = 4분)
 *      예) 서울 126.978°E → (126.978 − 135) × 4 ≈ −32.1분.
 *   2) 균시차(Equation of Time, EoT): 평균 태양과 실제(겉보기) 태양의 차이.
 *      EoT = 겉보기 태양시 − 평균 태양시. 연중 약 −14 ~ +16분 변동.
 *
 * ## 균시차 계산(astronomy-engine)
 *   EoT = (태양의 그리니치 시각(時角) + 12h) − UT
 *       = (GAST − α_app + 12h) − UT
 *   - GAST: 그리니치 겉보기 항성시(`SiderealTime`).
 *   - α_app: 태양의 겉보기 적경(of-date, 광행차 포함). 태양 시차(~8.8″)는
 *     분 단위 정밀도에 무의미하므로 적도상 관측자(0,0)의 지심 근사로 둡니다.
 *   알려진 값으로 검증: 2/11 ≈ −14.2분, 11/3 ≈ +16.5분, 4/15·6/13 ≈ 0분.
 *
 * ## 적용 범위
 *   진태양시는 **시주의 시지(時支) 경계**와 **일주의 자시(子時)/자정 경계**에만
 *   적용합니다. 연주(입춘)·월주(절기)는 절입 절대시각(UTC)과 출생 절대시각을 직접
 *   비교하므로 경도/균시차 보정과 무관합니다.
 *
 * 근거: saju-domain-expert 에이전트 검증 + 표준 천문 정의(EoT = apparent − mean).
 *       .claude/rules/saju-domain.md (시주 결정 — 진태양시 보정 여부 명시).
 */

import { Body, Equator, MakeTime, Observer, SiderealTime } from "astronomy-engine";

import { kstWallClockToUtc, type KstWallClock } from "./timezone";

/** 한국 표준시의 기준 자오선(동경, 도). KST = UTC+9 = 135°E. */
export const KST_STANDARD_MERIDIAN = 135;

/** 서울 경도(동경, 도). 출생지 정보가 없을 때의 기본값. */
export const SEOUL_LONGITUDE = 126.978;

/** 지심 근사용 적도상 관측자(시차 무시 — 분 단위 정밀도에 무의미). */
const GEOCENTRIC_OBSERVER = new Observer(0, 0, 0);

/** 각도/시간을 (−12, 12] 시간 범위로 정규화. */
function wrapHalfDay(hours: number): number {
  return ((((hours + 12) % 24) + 24) % 24) - 12;
}

/**
 * 주어진 UTC 순간의 균시차(분). EoT = 겉보기 태양시 − 평균 태양시.
 * 양수면 겉보기(해시계)가 평균시(시계)보다 앞섭니다.
 */
export function equationOfTimeMinutes(utc: Date): number {
  const time = MakeTime(utc);
  // 태양의 겉보기 적경(of-date=true, 광행차=true). ra 단위는 시(hours).
  const ra = Equator(Body.Sun, time, GEOCENTRIC_OBSERVER, true, true).ra;
  const gast = SiderealTime(time); // 그리니치 겉보기 항성시(시)
  const sunGreenwichHourAngle = (((gast - ra) % 24) + 24) % 24;
  const utHours = utc.getUTCHours() + utc.getUTCMinutes() / 60 + utc.getUTCSeconds() / 3600;
  const eotHours = wrapHalfDay(sunGreenwichHourAngle + 12 - utHours);
  return eotHours * 60;
}

/**
 * 표준시(벽시계) → 진태양시 총 보정량(분) = 경도보정 + 균시차.
 *
 * @param utc 출생 절대시각(균시차 평가용).
 * @param longitude 출생지 경도(동경 양수). 기본 서울.
 * @param meridian 표준 자오선. 기본 135°(KST).
 */
export function trueSolarOffsetMinutes(
  utc: Date,
  longitude: number = SEOUL_LONGITUDE,
  meridian: number = KST_STANDARD_MERIDIAN,
): number {
  const longitudeCorrection = (longitude - meridian) * 4;
  return longitudeCorrection + equationOfTimeMinutes(utc);
}

/**
 * KST 표준시 벽시계를 **진태양시 벽시계**로 변환합니다.
 *
 * 시지·자시 경계 판정에 쓸, 보정된 연·월·일·시·분을 돌려줍니다. 보정으로 자정을
 * 넘으면 날짜가 함께 이월됩니다(일주 경계에 반영되도록).
 */
export function toTrueSolarWallClock(
  wall: KstWallClock,
  longitude: number = SEOUL_LONGITUDE,
  meridian: number = KST_STANDARD_MERIDIAN,
): KstWallClock {
  const utc = kstWallClockToUtc(wall.year, wall.month, wall.day, wall.hour, wall.minute);
  const offsetMin = trueSolarOffsetMinutes(utc, longitude, meridian);

  // 벽시계 자체를 보정량만큼 이동(날짜 이월 포함). UTC 게터로 분해해 환경 무관.
  const base = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute);
  const shifted = new Date(base + Math.round(offsetMin * 60_000));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}
