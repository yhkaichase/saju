---
description: 현재 변경분을 code-reviewer 에이전트로 리뷰
allowed-tools: Bash(git diff:*), Bash(git status), Task
---

현재 변경분에 대한 코드 리뷰를 수행합니다.

- 변경 요약: !`git status --short`

`code-reviewer` 서브에이전트를 호출해 현재 변경분을 리뷰하세요.
사주 계산 로직(`src/lib/saju`, `src/lib/calendar`)이 포함된 변경이라면
`saju-domain-expert` 에이전트도 함께 호출해 도메인 정확성을 검증하세요.

집중해서 볼 영역(선택): $ARGUMENTS
