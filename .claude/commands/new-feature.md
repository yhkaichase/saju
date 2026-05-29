---
description: 새 기능 작업을 위한 브랜치 생성 + 작업 계획 수립
allowed-tools: Bash(git status), Bash(git branch:*), Bash(git checkout:*)
---

새 기능 `$ARGUMENTS` 작업을 시작합니다.

- 현재 브랜치/상태: !`git status -sb`

## 작업

1. 작업 내용에 맞는 브랜치명을 `@.claude/rules/git-workflow.md` 규칙에 따라
   제안하고(`feat/...` 등), 새 브랜치를 생성·체크아웃합니다.
2. 요구사항을 정리하고, 구현 단계를 짧은 계획으로 제시합니다.
3. 계산 로직이 포함된다면 `@.claude/rules/saju-domain.md`에서 관련 정확성 규칙을
   먼저 확인하고, 어떤 골든 테스트가 필요한지 함께 제안합니다.
4. 계획에 동의를 받은 뒤 구현을 시작합니다.
