#!/usr/bin/env python3
"""Seal ordered test-stage evidence with fail-fast metadata."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")


def write_json_atomic(path: Path, payload: dict) -> None:
    temp = path.with_name(path.name + ".tmp")
    temp.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    temp.replace(path)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--test-id", required=True)
    parser.add_argument("--cwd", required=True)
    parser.add_argument("--spec", required=True)
    parser.add_argument("--log", required=True)
    parser.add_argument("--done", required=True)
    args = parser.parse_args()

    if not re.fullmatch(r"[A-Za-z0-9_.-]+", args.test_id):
        raise SystemExit("test-id must contain only letters, digits, dot, underscore, or hyphen")

    raw_cwd = Path(args.cwd)
    raw_spec = Path(args.spec)
    raw_log = Path(args.log)
    raw_done = Path(args.done)
    if not all(path.is_absolute() for path in (raw_cwd, raw_spec, raw_log, raw_done)):
        raise SystemExit("cwd, spec, log, and done paths must be absolute")

    cwd = raw_cwd.resolve(strict=True)
    spec_path = raw_spec.resolve(strict=True)
    log_path = raw_log.resolve()
    done_path = raw_done.resolve()
    if not cwd.is_dir():
        raise SystemExit("cwd must be a directory")
    if len({spec_path, log_path, done_path}) != 3:
        raise SystemExit("spec, log, and done paths must differ")

    temp_done = done_path.with_name(done_path.name + ".tmp")
    existing = [str(path) for path in (log_path, done_path, temp_done) if path.exists()]
    if existing:
        raise SystemExit("refusing to reuse evidence paths: " + ", ".join(existing))

    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    stages = spec.get("stages")
    if not isinstance(stages, list) or not stages:
        raise SystemExit("spec.stages must be a non-empty list")

    normalized = []
    seen = set()
    for raw in stages:
        name = raw.get("name")
        argv = raw.get("argv")
        literal = raw.get("command_literal")
        if (
            not isinstance(name, str)
            or not name
            or name in seen
            or "\n" in name
            or "\r" in name
        ):
            raise SystemExit("stage names must be non-empty, unique, and single-line")
        if not isinstance(argv, list) or not argv or not all(isinstance(x, str) and x for x in argv):
            raise SystemExit(f"stage {name}: argv must be a non-empty string list")
        if not isinstance(literal, str) or not literal or "\n" in literal or "\r" in literal:
            raise SystemExit(f"stage {name}: command_literal must be non-empty and single-line")
        env = raw.get("env", {})
        if not isinstance(env, dict) or not all(isinstance(k, str) and isinstance(v, str) for k, v in env.items()):
            raise SystemExit(f"stage {name}: env must map strings to strings")
        timeout = raw.get("timeout_seconds")
        if timeout is not None and (not isinstance(timeout, (int, float)) or timeout <= 0):
            raise SystemExit(f"stage {name}: timeout_seconds must be positive")
        seen.add(name)
        normalized.append(
            {
                "name": name,
                "argv": argv,
                "command_literal": literal,
                "env": env,
                "timeout_seconds": timeout,
            }
        )

    log_path.parent.mkdir(parents=True, exist_ok=True)
    done_path.parent.mkdir(parents=True, exist_ok=True)
    suite_start = utc_now()
    stage_results = []
    blocked = False
    suite_exit = 0

    with log_path.open("x", encoding="utf-8", buffering=1) as log:
        def emit(line: str) -> None:
            log.write(line + "\n")
            print(line, flush=True)

        emit(f"SUITE_START test_id={args.test_id} cwd={cwd} utc_start={suite_start}")
        for stage in normalized:
            if blocked:
                result = {
                    "name": stage["name"],
                    "command_literal": stage["command_literal"],
                    "argv": stage["argv"],
                    "utc_start": None,
                    "utc_end": None,
                    "exit_code": None,
                    "status": "NOT_EXECUTED",
                }
                stage_results.append(result)
                emit(
                    f"STAGE_NOT_EXECUTED name={stage['name']} "
                    f"command_literal={stage['command_literal']} status=NOT_EXECUTED"
                )
                continue

            started = utc_now()
            emit(
                f"STAGE_START name={stage['name']} command_literal={stage['command_literal']} "
                f"utc_start={started}"
            )
            env = os.environ.copy()
            env.update(stage["env"])
            try:
                completed = subprocess.run(
                    stage["argv"],
                    cwd=cwd,
                    env=env,
                    stdin=subprocess.DEVNULL,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    timeout=stage["timeout_seconds"],
                    check=False,
                )
                output = completed.stdout or ""
                exit_code = completed.returncode
                status = "PASS" if exit_code == 0 else "FAIL"
            except subprocess.TimeoutExpired as exc:
                output = exc.stdout or ""
                if isinstance(output, bytes):
                    output = output.decode(errors="replace")
                exit_code = 124
                status = "TIMEOUT"
            if output:
                log.write(output)
                if not output.endswith("\n"):
                    log.write("\n")
                sys.stdout.write(output)
                if not output.endswith("\n"):
                    sys.stdout.write("\n")
                sys.stdout.flush()
            ended = utc_now()
            emit(
                f"STAGE_END name={stage['name']} command_literal={stage['command_literal']} "
                f"utc_start={started} utc_end={ended} exit_code={exit_code} status={status}"
            )
            stage_results.append(
                {
                    "name": stage["name"],
                    "command_literal": stage["command_literal"],
                    "argv": stage["argv"],
                    "utc_start": started,
                    "utc_end": ended,
                    "exit_code": exit_code,
                    "status": status,
                }
            )
            if exit_code != 0:
                blocked = True
                suite_exit = exit_code

        suite_end = utc_now()
        suite_status = "PASS" if suite_exit == 0 else "FAIL"
        emit(
            f"SUITE_END test_id={args.test_id} cwd={cwd} utc_start={suite_start} "
            f"utc_end={suite_end} exit_code={suite_exit} status={suite_status}"
        )

    payload = {
        "test_id": args.test_id,
        "cwd": str(cwd),
        "log_path": str(log_path),
        "done_path": str(done_path),
        "spec_path": str(spec_path),
        "utc_start": suite_start,
        "utc_end": suite_end,
        "status": suite_status,
        "exit_code": suite_exit,
        "stages": stage_results,
    }
    write_json_atomic(done_path, payload)
    return suite_exit


if __name__ == "__main__":
    raise SystemExit(main())
