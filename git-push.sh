#!/usr/bin/env bash
# git-push — usage: git-push "commit message"
[ -z "$1" ] && { echo "Usage: git-push \"commit message\""; exit 1; }
git add -A
if git diff --cached --quiet; then
  echo "Nothing to commit."
else
  git commit -m "$1"
fi
git push
