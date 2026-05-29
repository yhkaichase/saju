---
description: 변경분을 검토하고 Conventional Commits 형식으로 커밋
allowed-tools: Bash(git status), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

현재 변경 사항을 커밋합니다.

## 컨텍스트

- 변경 상태: !`git status --short`
- 스테이지된 변경: !`git diff --staged --stat`
- 최근 커밋 스타일 참고: !`git log --oneline -10`

## 작업

1. 위 변경 내용을 검토하고 논리적으로 하나의 커밋으로 묶을 수 있는지 판단합니다.
   여러 관심사가 섞였으면 나눠서 커밋할 것을 제안합니다.
2. `@.claude/rules/git-workflow.md`의 규칙에 따라 **Conventional Commits** 형식으로
   커밋 메시지를 작성합니다 (제목은 명령형, 필요 시 본문에 "왜").
3. 아직 스테이지되지 않은 관련 파일은 `git add`로 추가한 뒤 커밋합니다.
4. `main` 브랜치라면 커밋 전에 경고합니다.

추가 지시: $ARGUMENTS
