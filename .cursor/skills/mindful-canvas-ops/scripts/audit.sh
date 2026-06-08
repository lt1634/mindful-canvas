#!/usr/bin/env bash
# Mindful Canvas 機械盤點 — 由 mindful-canvas-ops skill 呼叫
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT"

echo "=== Mindful Canvas Audit ==="
echo "Root: $ROOT"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

check_file() {
  if [[ -f "$1" ]]; then echo "  OK   $1"
  else echo "  MISS $1"; fi
}

echo "## Files"
for f in index.html manifest.json sw.js icon-192.png icon-512.png \
         PLAN.md BRAND.md HABITS.md CHANGELOG.md FEEDBACK.md CODEX_CONTEXT.md DEPLOY.md .nojekyll; do
  check_file "$f"
done
echo ""

echo "## Code signals (index.html)"
for pat in "checkSafety" "feedbackScreen" "exportSessions" "getDominantColor" \
           "registerServiceWorker" "requestAnimationFrame" "OLLAMA_SCENE_MAP"; do
  if grep -q "$pat" index.html 2>/dev/null; then echo "  OK   $pat"
  else echo "  MISS $pat"; fi
done
echo ""

echo "## PLAN gaps (still marked 待)"
grep -rn "待實現\|待定\|未實作" PLAN.md 2>/dev/null | head -5 || echo "  (none or PLAN missing)"
echo ""

echo "## Git"
if git rev-parse --git-dir >/dev/null 2>&1; then
  echo "  Branch: $(git branch --show-current 2>/dev/null || echo '?')"
  echo "  Last commit: $(git log -1 --oneline 2>/dev/null || echo 'none')"
  if git remote get-url origin >/dev/null 2>&1; then
    url=$(git remote get-url origin)
    if echo "$url" | grep -qE 'ghp_|github_pat_|x-access-token'; then
      echo "  WARN remote contains embedded token — rotate and use SSH/credential helper"
    else
      echo "  OK   remote configured"
    fi
  else
    echo "  MISS git remote"
  fi
  if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    echo "  WARN uncommitted changes:"
    git status --short | head -10
  else
    echo "  OK   working tree clean"
  fi
else
  echo "  MISS not a git repo"
fi
echo ""

echo "## Line count"
wc -l index.html 2>/dev/null | awk '{print "  index.html:", $1, "lines"}'
echo ""

echo "=== End audit ==="
