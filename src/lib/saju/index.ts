/**
 * 사주(四柱) 계산 코어의 공개 진입점.
 *
 * 이 모듈은 프레임워크(Next.js)에 의존하지 않는 **순수 계산 로직**입니다.
 * I/O·UI와 분리되어 있어 단위/골든 테스트가 용이하며, 추후 별도 패키지나
 * 서비스로 추출할 수 있도록 격리되어 있습니다.
 * (참고: .claude/rules/coding-style.md)
 */

export * from "./constants";
export * from "./day-pillar";
export * from "./hour-pillar";
export * from "./year-pillar";
export * from "./month-pillar";
export * from "./four-pillars";

// 4기둥(연·월·일·시) 모두 구현 완료. calculateFourPillars 로 통합 계산.
//
// TODO(파생 계산): 오행(五行) 분류·생극, 십신(十神), 대운(大運) 순행/역행·대운수.
// 규칙: .claude/rules/saju-domain.md
