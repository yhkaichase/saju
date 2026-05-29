# CLAUDE.md

이 파일은 Claude Code가 이 저장소에서 작업할 때 참고하는 프로젝트 가이드입니다.

## 프로젝트 개요

**saju** — 사주(四柱八字)를 계산·해석해주는 풀스택 웹 서비스.

생년월일시를 입력받아 만세력 기반으로 사주(연·월·일·시 4기둥의 천간·지지)를
산출하고, 오행/십신/대운 등을 계산해 해석을 제공하는 것을 목표로 합니다.

> 도메인 계산은 **정확성이 최우선**입니다. 음양력 변환, 절기(節氣) 기준 월주 결정,
> 야자시/조자시 처리 등은 추정으로 구현하지 말고 근거를 명시해야 합니다.
> 자세한 규칙은 `@.claude/rules/saju-domain.md` 참고.

## 기술 스택

> 초기 셋업 기준 권장 스택입니다. 확정/변경되면 이 섹션과 아래 명령어를 갱신하세요.

- **언어/런타임**: TypeScript, Node.js (LTS)
- **프레임워크**: Next.js (App Router) — 프론트엔드 + API 라우트 통합
- **스타일**: Tailwind CSS
- **패키지 매니저**: pnpm
- **테스트**: Vitest (단위), Playwright (E2E) — 도입 시 갱신
- **포맷/린트**: Prettier, ESLint

## 개발 명령어

> 아직 스캐폴딩 전입니다. `package.json` 생성 후 실제 스크립트에 맞춰 갱신하세요.

```bash
pnpm install          # 의존성 설치
pnpm dev              # 개발 서버
pnpm build            # 프로덕션 빌드
pnpm start            # 프로덕션 서버
pnpm test             # 테스트
pnpm lint             # 린트
pnpm format           # 포맷
```

## 디렉터리 구조 (예정)

```
src/
  app/                # Next.js App Router (페이지 + API 라우트)
  lib/
    saju/             # 사주 계산 핵심 로직 (만세력·간지·오행·십신)
    calendar/         # 음양력 변환·절기 계산
  components/         # UI 컴포넌트
  types/              # 공용 타입
tests/                # 테스트
```

## 작업 규칙

세부 규칙은 분리된 파일에 정의되어 있습니다:

- 코딩 컨벤션: `@.claude/rules/coding-style.md`
- Git 워크플로: `@.claude/rules/git-workflow.md`
- 사주 도메인 정확성: `@.claude/rules/saju-domain.md`

## 핵심 원칙

- **계산 로직은 반드시 테스트와 함께** 작성합니다. 알려진 명식(命式) 사례를
  골든 테스트로 고정하세요.
- 도메인 용어는 한글/한자 병기하고 코드 식별자는 영문 표기를 통일합니다
  (예: 천간 `heavenlyStem`, 지지 `earthlyBranch`).
- 외부 라이브러리로 음양력을 변환할 때는 출처와 정밀도(분 단위/시간대)를 기록합니다.
