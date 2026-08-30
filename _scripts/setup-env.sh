#!/usr/bin/env bash
set -euo pipefail

root_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
example_path="${root_dir}/.env.example"
env_path="${root_dir}/.env"

if [[ -f "${env_path}" ]]; then
	exit 0
fi

if [[ ! -f "${example_path}" ]]; then
	echo "setup-env: ${example_path} not found" >&2
	exit 1
fi

cp "${example_path}" "${env_path}"
echo "setup-env: created .env from .env.example"
