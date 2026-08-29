#!/usr/bin/env bash
# Usage: ./_scripts/kill-port.sh PORT [PORT...]   # kills TCP LISTEN procs on each port (Unix-only, lsof)
set -u
command -v lsof >/dev/null || { echo "kill-port: no lsof, skip" >&2; exit 0; }
for port in "$@"; do
  pids=$(lsof -ti "tcp:${port}" -s TCP:LISTEN 2>/dev/null) || true
  if [ -z "$pids" ]; then
    echo ":${port} free"
  elif kill -9 $pids 2>/dev/null; then
    echo "killed :${port} ($pids)"
  else
    echo ":${port} kill failed ($pids)" >&2
  fi
done
exit 0
