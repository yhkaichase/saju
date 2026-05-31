/**
 * 율리우스일(Julian Day Number, JDN) 계산.
 *
 * 일주(日柱)는 천문 계산 없이 "기준일 + 60갑자 연속 순환"으로 결정되며,
 * 연속 일수 카운트로 JDN을 사용합니다.
 *
 * 공식: Fliegel–Van Flandern 정수 알고리즘 (proleptic Gregorian).
 * - 정수 "민용일(civil day)" 카운트를 직접 산출하므로, 천문 정의(정오 시작,
 *   0.5 소수)에서 오는 ±1 floor 오류를 피할 수 있습니다.
 * - 본 서비스 입력 범위(근현대)는 모두 그레고리력이므로 율리우스력(1582 이전)
 *   전환 분기는 두지 않습니다.
 *
 * 출처: Fliegel, H. F.; Van Flandern, T. C. (1968), CACM.
 *       https://en.wikipedia.org/wiki/Julian_day
 */

/**
 * 그레고리력 양력 날짜(연·월·일)를 정수 JDN으로 변환합니다.
 *
 * 주의: 시간대 처리는 호출부 책임입니다. **KST(UTC+9) 기준의 벽시계 연·월·일**을
 * 넘겨야 합니다. JS `Date`의 UTC 게터(`getUTC*`)나 `toISOString()`으로 뽑은
 * 값을 쓰면 자정 근처에서 하루가 밀릴 수 있습니다.
 *
 * @param year  양력 연도 (예: 2024)
 * @param month 1~12
 * @param day   1~31
 */
export function gregorianToJulianDayNumber(year: number, month: number, day: number): number {
  const a = Math.trunc((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return (
    day +
    Math.trunc((153 * m + 2) / 5) +
    365 * y +
    Math.trunc(y / 4) -
    Math.trunc(y / 100) +
    Math.trunc(y / 400) -
    32045
  );
}
