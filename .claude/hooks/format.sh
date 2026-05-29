#!/usr/bin/env bash
# PostToolUse(Edit|Write) 훅: 방금 수정된 파일을 Prettier로 포맷합니다.
# 아직 Prettier/의존성이 설치되지 않았거나 대상이 없으면 조용히 통과합니다.
set -euo pipefail

# 훅 입력(JSON)을 stdin으로 받아 수정된 파일 경로를 추출합니다.
input="$(cat)"

file_path="$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"

# 대상 파일이 없으면 종료
[ -z "${file_path:-}" ] && exit 0
[ -f "$file_path" ] && true || exit 0

# 포맷 대상 확장자만 처리
case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md) ;;
  *) exit 0 ;;
esac

# Prettier가 설치되어 있을 때만 실행 (없으면 통과)
if [ -x "node_modules/.bin/prettier" ]; then
  node_modules/.bin/prettier --write "$file_path" >/dev/null 2>&1 || true
fi

exit 0
