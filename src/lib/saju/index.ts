/**
 * 사주(四柱) 계산 코어의 공개 진입점.
 *
 * 이 모듈은 프레임워크(Next.js)에 의존하지 않는 **순수 계산 로직**입니다.
 * I/O·UI와 분리되어 있어 단위/골든 테스트가 용이하며, 추후 별도 패키지나
 * 서비스로 추출할 수 있도록 격리되어 있습니다.
 * (참고: .claude/rules/coding-style.md)
 */

export * from "./constants";

// TODO(근거 필요): 아래 계산은 절기·음양력 데이터가 갖춰진 뒤 골든 테스트와 함께 구현.
//   - calculateYearPillar  : 입춘 기준 연주
//   - calculateMonthPillar : 12절기 기준 월주 (오호둔/五虎遁)
//   - calculateDayPillar   : 60갑자 연속 순환 (epoch 명시·검증)
//   - calculateHourPillar  : 야자시/조자시 정책 + 시간(時干) 오서둔/五鼠遁
//   - calculateFourPillars : 위를 조합한 최종 사주
// 규칙: .claude/rules/saju-domain.md
