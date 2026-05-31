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
export * from "./five-elements";
export * from "./ten-gods";
export * from "./major-fortune";
export * from "./saju-chart";

// 4기둥(연·월·일·시) + 파생(오행·십신·대운) 모두 구현 완료.
//
// 잔여 TODO(정확성): 대운수(大運數) 반올림/0시작 경계 관례를 KASI 공식
// 만세력과 골든 대조해 확정. (현재 기본 round + 정밀값 병행 보관)
// 규칙: .claude/rules/saju-domain.md
