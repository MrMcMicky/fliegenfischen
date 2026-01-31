#!/usr/bin/env bash
set -euo pipefail

EXPECTED_DATABASE_NAME="fliegenfischen"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE=""

if [ -f "$ROOT_DIR/.env" ]; then
  ENV_FILE="$ROOT_DIR/.env"
elif [ -f "$ROOT_DIR/.env.local" ]; then
  ENV_FILE="$ROOT_DIR/.env.local"
fi

if [ -n "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Refusing to run Prisma." >&2
  exit 1
fi

db_name="$(printf '%s' "$DATABASE_URL" | sed -E 's#^.*://[^/]+/([^?]+).*#\\1#')"

if [ "$db_name" != "$EXPECTED_DATABASE_NAME" ]; then
  echo "Safety check failed: DATABASE_URL points to '$db_name' but expected '$EXPECTED_DATABASE_NAME'." >&2
  echo "DATABASE_URL=$DATABASE_URL" >&2
  exit 1
fi

exec npx prisma "$@"
