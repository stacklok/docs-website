#!/usr/bin/env python3
# SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
# SPDX-License-Identifier: Apache-2.0

"""Maintain a compact PR comment describing visual regression failures."""

from __future__ import annotations

import fnmatch
import html
import json
import os
import re
import stat
import subprocess
import zipfile
from dataclasses import dataclass
from pathlib import Path, PurePosixPath


MARKER = "<!-- visual-regression-failure-summary -->"
BOT_LOGIN = "github-actions[bot]"
MAX_ARTIFACT_FILES = 5_000
MAX_ARTIFACT_BYTES = 100 * 1024 * 1024
MAX_ARCHIVE_BYTES = 25 * 1024 * 1024
MAX_DETAIL_BYTES = 1024 * 1024
MAX_METADATA_BYTES = 64 * 1024
MAX_SUMMARY_ROWS = 10

TEST_NAME_RE = re.compile(r"^- Name: (.+)$", re.MULTILINE)
ERROR_BLOCK_RE = re.compile(
    r"# Error details\s+```(?:text)?\n(.*?)\n```", re.DOTALL
)
SNAPSHOT_RE = re.compile(r"^\s*Snapshot:\s+([A-Za-z0-9._-]+)\s*$", re.MULTILINE)
PIXEL_RE = re.compile(
    r"([0-9][0-9,]*) pixels \(ratio ([0-9.]+) of all image pixels\) "
    r"are different"
)
SCHEME_RE = re.compile(r"-(light|dark)\.png$")
VIEWPORT_RE = re.compile(r"-(desktop|mobile)-linux\.json$")


class ArtifactValidationError(RuntimeError):
    """Raised when an untrusted artifact exceeds the accepted bounds."""


@dataclass(frozen=True)
class Failure:
    test_name: str
    error: str
    snapshot: str | None = None
    pixels: int | None = None
    ratio: str | None = None


@dataclass(frozen=True)
class SnapshotDetails:
    title: str
    logical_name: str
    theme: str
    viewport: str
    route: str
    pixels: int
    ratio: str


def required_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"{name} must be set")
    return value


def clean_text(value: str, limit: int = 200) -> str:
    cleaned = " ".join(value.split())
    return cleaned[:limit]


def table_cell(value: str) -> str:
    escaped = html.escape(clean_text(value), quote=False).replace("@", "&#64;")
    for character in ("\\", "`", "*", "_", "[", "]", "|"):
        escaped = escaped.replace(character, f"\\{character}")
    return escaped


def validate_archive_member(info: zipfile.ZipInfo) -> None:
    name = info.filename
    member_path = PurePosixPath(name)
    if (
        not name
        or "\\" in name
        or member_path.is_absolute()
        or ".." in member_path.parts
    ):
        raise ArtifactValidationError("the Playwright artifact has an unsafe path")
    if info.flag_bits & 0x1:
        raise ArtifactValidationError("the Playwright artifact has an encrypted file")

    mode = info.external_attr >> 16
    file_type = stat.S_IFMT(mode)
    if file_type == stat.S_IFLNK:
        raise ArtifactValidationError("the Playwright artifact contains a symlink")
    if file_type not in (0, stat.S_IFREG, stat.S_IFDIR):
        raise ArtifactValidationError("the Playwright artifact has a special file")


def parse_failure_detail(text: str) -> Failure | None:
    if "Following Playwright test failed" not in text:
        return None

    test_match = TEST_NAME_RE.search(text)
    error_match = ERROR_BLOCK_RE.search(text)
    if not test_match or not error_match:
        return None

    error_block = error_match.group(1).strip()
    first_error = next(
        (line.strip() for line in error_block.splitlines() if line.strip()),
        "Playwright test failed",
    )
    snapshot_match = SNAPSHOT_RE.search(error_block)
    pixel_match = PIXEL_RE.search(error_block)
    if not snapshot_match or not pixel_match:
        return Failure(
            test_name=clean_text(test_match.group(1)),
            error=clean_text(first_error.removeprefix("Error: ")),
        )

    return Failure(
        test_name=clean_text(test_match.group(1)),
        error=clean_text(first_error.removeprefix("Error: ")),
        snapshot=snapshot_match.group(1),
        pixels=int(pixel_match.group(1).replace(",", "")),
        ratio=pixel_match.group(2),
    )


def load_failures(artifact_path: Path) -> list[Failure]:
    if (
        not artifact_path.is_file()
        or artifact_path.is_symlink()
        or artifact_path.stat().st_size > MAX_ARCHIVE_BYTES
    ):
        raise ArtifactValidationError("the Playwright artifact is unavailable")

    try:
        with zipfile.ZipFile(artifact_path) as archive:
            members = archive.infolist()
            if len(members) > MAX_ARTIFACT_FILES:
                raise ArtifactValidationError(
                    "the Playwright artifact has too many files"
                )

            total_bytes = 0
            detail_members: list[zipfile.ZipInfo] = []
            seen_names: set[str] = set()
            for info in members:
                validate_archive_member(info)
                if info.filename in seen_names:
                    raise ArtifactValidationError(
                        "the Playwright artifact has duplicate paths"
                    )
                seen_names.add(info.filename)
                total_bytes += info.file_size
                if total_bytes > MAX_ARTIFACT_BYTES:
                    raise ArtifactValidationError(
                        "the Playwright artifact is too large"
                    )
                if re.fullmatch(
                    r"playwright-report/data/[^/]+\.md", info.filename
                ):
                    if info.file_size > MAX_DETAIL_BYTES:
                        raise ArtifactValidationError(
                            "a Playwright failure detail is too large"
                        )
                    detail_members.append(info)

            failures: list[Failure] = []
            seen_failures: set[Failure] = set()
            for info in sorted(detail_members, key=lambda item: item.filename):
                try:
                    detail = archive.read(info).decode("utf-8")
                except (OSError, RuntimeError, UnicodeDecodeError) as error:
                    raise ArtifactValidationError(
                        "a Playwright failure detail could not be read safely"
                    ) from error
                failure = parse_failure_detail(detail)
                if failure and failure not in seen_failures:
                    failures.append(failure)
                    seen_failures.add(failure)
            return failures
    except ArtifactValidationError:
        raise
    except (OSError, zipfile.BadZipFile) as error:
        raise ArtifactValidationError(
            "the Playwright artifact is not a valid ZIP archive"
        ) from error


def git_output(repository: Path, *arguments: str) -> str:
    return subprocess.run(
        ["git", "-C", str(repository), *arguments],
        check=True,
        capture_output=True,
        encoding="utf-8",
    ).stdout


def metadata_for_snapshot(
    snapshot: str, repository: Path, revision: str | None = None
) -> tuple[str, str]:
    snapshot_stem = snapshot.removesuffix(".png")
    relative_pattern = (
        f"tests/visual/*.spec.ts-snapshots/{snapshot_stem}-*-linux.json"
    )
    try:
        if revision:
            paths = git_output(
                repository,
                "ls-tree",
                "-r",
                "--name-only",
                revision,
                "--",
                "tests/visual",
            ).splitlines()
            matches = sorted(
                path for path in paths if fnmatch.fnmatch(path, relative_pattern)
            )
        else:
            matches = sorted(
                str(path.relative_to(repository))
                for path in (repository / "tests" / "visual").glob(
                    relative_pattern.removeprefix("tests/visual/")
                )
            )
    except (OSError, subprocess.CalledProcessError, UnicodeDecodeError):
        return "(unknown route)", "Unknown"
    if len(matches) != 1:
        return "(unknown route)", "Unknown"

    metadata_path = matches[0]
    viewport_match = VIEWPORT_RE.search(metadata_path)
    viewport = viewport_match.group(1).title() if viewport_match else "Unknown"
    try:
        if revision:
            raw_metadata = git_output(
                repository, "show", f"{revision}:{metadata_path}"
            )
        else:
            raw_metadata = (repository / metadata_path).read_text(encoding="utf-8")
        if len(raw_metadata.encode("utf-8")) > MAX_METADATA_BYTES:
            raise ValueError
        metadata = json.loads(raw_metadata)
        route = metadata["url"]["path"]
        if not isinstance(route, str):
            raise TypeError
    except (
        KeyError,
        OSError,
        TypeError,
        UnicodeDecodeError,
        ValueError,
        subprocess.CalledProcessError,
    ):
        route = "(unknown route)"
    return clean_text(route), viewport


def snapshot_details(
    failure: Failure, repository: Path, metadata_ref: str | None = None
) -> SnapshotDetails | None:
    if (
        failure.snapshot is None
        or failure.pixels is None
        or failure.ratio is None
    ):
        return None

    scheme_match = SCHEME_RE.search(failure.snapshot)
    if not scheme_match:
        return None
    route, viewport = metadata_for_snapshot(
        failure.snapshot, repository, metadata_ref
    )
    return SnapshotDetails(
        title=clean_text(failure.test_name.split(" >> ")[-1]),
        logical_name=SCHEME_RE.sub("", failure.snapshot),
        theme=scheme_match.group(1).title(),
        viewport=viewport,
        route=route,
        pixels=failure.pixels,
        ratio=failure.ratio,
    )


def render_comment(
    failures: list[Failure],
    repository: Path,
    head_sha: str,
    run_url: str,
    job_url: str,
    artifact_error: str | None = None,
    metadata_ref: str | None = None,
) -> str:
    snapshots = [
        details
        for failure in failures
        if (
            details := snapshot_details(failure, repository, metadata_ref)
        ) is not None
    ]
    functional = [failure for failure in failures if failure.snapshot is None]

    groups: dict[tuple[str, str, str, str], list[SnapshotDetails]] = {}
    for details in snapshots:
        key = (
            details.title,
            details.logical_name,
            details.route,
            details.viewport,
        )
        groups.setdefault(key, []).append(details)

    lines = [MARKER, "## Visual regression failed", ""]
    if groups:
        snapshot_word = "snapshot" if len(snapshots) == 1 else "snapshots"
        screen_word = "screen" if len(groups) == 1 else "screens"
        lines.extend(
            [
                f"Commit `{head_sha[:12]}` changed {len(snapshots)} visual {snapshot_word} across {len(groups)} {screen_word}.",
                "",
                "| Screen | Route | Viewport | Difference |",
                "| --- | --- | --- | --- |",
            ]
        )
        for (title, _logical, route, viewport), details_list in list(
            groups.items()
        )[:MAX_SUMMARY_ROWS]:
            differences = "<br>".join(
                f"{item.theme}: {item.pixels:,} pixels (ratio {item.ratio})"
                for item in sorted(details_list, key=lambda item: item.theme)
            )
            lines.append(
                f"| {table_cell(title)} | `{table_cell(route)}` | {table_cell(viewport)} | {differences} |"
            )
        if len(groups) > MAX_SUMMARY_ROWS:
            lines.extend(
                [
                    "",
                    f"{len(groups) - MAX_SUMMARY_ROWS} more changed screens are available in the Playwright report.",
                ]
            )

    if functional:
        lines.extend(["", "### Other visual test failures", ""])
        for failure in functional[:MAX_SUMMARY_ROWS]:
            lines.append(
                f"- **{table_cell(failure.test_name.split(' >> ')[-1])}:** {table_cell(failure.error)}"
            )
        if len(functional) > MAX_SUMMARY_ROWS:
            lines.append(
                f"- {len(functional) - MAX_SUMMARY_ROWS} more failures are available in the Playwright report."
            )

    if not groups and not functional:
        reason = artifact_error or "the Playwright report contained no screenshot details"
        lines.extend(
            [
                "The visual job failed, but CI could not produce a compact screenshot summary.",
                "",
                f"Details were unavailable because {table_cell(reason)}.",
            ]
        )

    lines.extend(
        [
            "",
            f"[Open the failed visual job]({job_url or run_url}) · [Download the full Playwright report]({run_url}#artifacts)",
            "",
            "If the change is intentional, a repository collaborator can comment `/update-snapshots` to regenerate the baselines.",
        ]
    )
    return "\n".join(lines)


def gh_api(method: str, endpoint: str, payload: dict | None = None) -> object:
    command = ["gh", "api", "--method", method, endpoint]
    input_text = None
    if payload is not None:
        command.extend(["--input", "-"])
        input_text = json.dumps(payload)
    result = subprocess.run(
        command,
        input=input_text,
        check=True,
        capture_output=True,
        encoding="utf-8",
    )
    return json.loads(result.stdout) if result.stdout.strip() else None


def find_existing_comments(repo: str, pr_number: str) -> list[dict]:
    matches: list[dict] = []
    for page in range(1, 11):
        comments = gh_api(
            "GET",
            f"repos/{repo}/issues/{pr_number}/comments?per_page=100&page={page}",
        )
        if not isinstance(comments, list):
            break
        matches.extend(
            comment
            for comment in comments
            if comment.get("user", {}).get("login") == BOT_LOGIN
            and MARKER in comment.get("body", "")
        )
        if len(comments) < 100:
            break
    return matches


def update_comment(repo: str, pr_number: str, body: str | None) -> None:
    existing = find_existing_comments(repo, pr_number)
    if body is None:
        for comment in existing:
            gh_api("DELETE", f"repos/{repo}/issues/comments/{comment['id']}")
        print("Removed stale visual regression failure comment.")
        return

    if existing:
        gh_api(
            "PATCH",
            f"repos/{repo}/issues/comments/{existing[0]['id']}",
            {"body": body},
        )
        for duplicate in existing[1:]:
            gh_api("DELETE", f"repos/{repo}/issues/comments/{duplicate['id']}")
        print("Updated visual regression failure comment.")
        return

    gh_api("POST", f"repos/{repo}/issues/{pr_number}/comments", {"body": body})
    print("Created visual regression failure comment.")


def main() -> None:
    repo = required_env("REPO")
    pr_number = required_env("PR_NUMBER")
    conclusion = required_env("VISUAL_CONCLUSION")

    if conclusion == "success":
        update_comment(repo, pr_number, None)
        return
    if conclusion != "failure":
        print(f"Visual regression conclusion is {conclusion}; leaving comments unchanged.")
        return

    artifact_path = Path(required_env("ARTIFACT_PATH"))
    artifact_error = None
    try:
        failures = load_failures(artifact_path)
    except ArtifactValidationError as error:
        failures = []
        artifact_error = str(error)

    head_sha = required_env("RUN_HEAD_SHA")
    body = render_comment(
        failures=failures,
        repository=Path.cwd(),
        head_sha=head_sha,
        run_url=required_env("RUN_URL"),
        job_url=os.environ.get("VISUAL_JOB_URL", ""),
        artifact_error=artifact_error,
        metadata_ref=head_sha,
    )
    update_comment(repo, pr_number, body)


if __name__ == "__main__":
    main()
