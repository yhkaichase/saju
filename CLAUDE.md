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

- **언어/런타임**: TypeScript (strict), Node.js 22
- **프레임워크**: Next.js 16 (App Router, Turbopack) — 프론트엔드 + API 라우트 통합
- **스타일**: Tailwind CSS v4
- **패키지 매니저**: pnpm
- **테스트**: Vitest (단위) — E2E(Playwright)는 도입 시 갱신
- **포맷/린트**: Prettier, ESLint (eslint-config-next)

> 사주 계산 코어는 **단일 TS 스택 안에서 순수 모듈로 격리**합니다(`src/lib`).
> 천문 정밀도는 분(分) 단위면 충분하며, 한국 사주의 정답 기준은 KASI 공식
> 만세력입니다. 별도 언어/서비스로 분리하지 않되, 코어가 Next에 의존하지 않게
> 유지해 추후 추출 가능성을 열어둡니다.

## 개발 명령어

```bash
pnpm install          # 의존성 설치
pnpm dev              # 개발 서버
pnpm build            # 프로덕션 빌드
pnpm start            # 프로덕션 서버
pnpm test             # 테스트 (vitest run)
pnpm test:watch       # 테스트 watch
pnpm typecheck        # tsc --noEmit
pnpm lint             # 린트
pnpm format           # 포맷 (prettier --write)
pnpm format:check     # 포맷 검사
```

## 디렉터리 구조

```
src/
  app/                # Next.js App Router (페이지 + API 라우트)
  lib/
    saju/             # 사주 계산 핵심 로직 (간지·오행·십신·대운) — 순수 모듈
      constants.ts    #   천간·지지·60갑자 (확정 상수)
    calendar/         # 음양력 변환·절기 계산 (근거 필요 — README 참고)
  types/              # 공용 타입 (saju.ts)
```

> 단위 테스트는 대상 파일 옆에 `*.test.ts`로 둡니다 (예: `constants.test.ts`).

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
