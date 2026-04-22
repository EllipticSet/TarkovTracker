#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  npx supabase stop --no-backup >/dev/null 2>&1 || true
}

trap cleanup EXIT

npx supabase db start
npx supabase db reset --no-seed
npx supabase db lint --schema public --fail-on error
