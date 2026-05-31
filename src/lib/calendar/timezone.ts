/**
 * 시간대 변환 — KST(UTC+9) 경계 처리.
 *
 * 사주 코어의 순수 함수들은 **KST 벽시계(연·월·일·시·분)**를 입력으로 받습니다.
 * 반면 천문 계산(astronomy-engine)은 **UTC** 기준입니다. 절기 절입 시각과
 * 출생 시각을 비교하려면 둘을 동일 기준으로 맞춰야 하며, 그 변환을 여기 모읍니다.
 *
 * 한국 표준시(KST)는 UTC+9 고정(서머타임 미적용). 과거 일부 기간의 표준시
 * 변경 이력은 시주/진태양시 경계에서 별도로 다루며, 절기 기반 연·월주에는
 * 영향을 주지 않습니다. (참고: .claude/rules/saju-domain.md)
 */

/** 한국 표준시 오프셋(분): UTC+9. */
const KST_OFFSET_MINUTES = 9 * 60;

/**
 * KST 벽시계 연·월·일·시·분을 그 순간의 UTC `Date`로 변환합니다.
 *
 * `Date.UTC`로 만든 "KST를 UTC인 척한 시각"에서 9시간을 빼 실제 UTC 순간을
 * 얻습니다. JS `Date`의 로컬 타임존에 의존하지 않아 실행 환경과 무관합니다.
 */
export function kstWallClockToUtc(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): Date {
  const asIfUtc = Date.UTC(year, month - 1, day, hour, minute);
  return new Date(asIfUtc - KST_OFFSET_MINUTES * 60 * 1000);
}
