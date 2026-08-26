#!/usr/bin/env python3
"""Assign reviewers for an upstream-release documentation pull request.

GitHub itself is the reviewer-access authority: request the upstream
contributor directly, then fall back to the human who merged each relevant
upstream pull request when GitHub rejects that request. This deliberately
avoids organization-membership and collaborator lookups, which require
broader credentials or behave inconsistently for team-derived access.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path


BOT_LOGIN = re.compile(
    r"(\[bot\]$|^app/|^github-actions|^stacklokbot$|^dependabot|^renovate|^copilot)",
    re.IGNORECASE,
)


def warning(message: str) -> None:
    print(f"::warning::{message}")


def unique(values: list[str]) -> list[str]:
    return list(dict.fromkeys(value for value in values if value))


@dataclass(frozen=True)
class Config:
    review_repo: str
    release_repo: str
    pr_number: str
    owner: str
    compare_ok: str
    candidates: list[str]
    github_output: Path

    @classmethod
    def from_env(cls) -> "Config":
        output = os.environ.get("GITHUB_OUTPUT")
        if not output:
            raise RuntimeError("GITHUB_OUTPUT is required")
        return cls(
            review_repo=os.environ["REVIEW_REPO"],
            release_repo=os.environ["RELEASE_REPO"],
            pr_number=os.environ["PR_NUMBER"],
            owner=os.environ.get("OWNER", ""),
            compare_ok=os.environ.get("COMPARE_OK", ""),
            candidates=unique(os.environ.get("CANDIDATES", "").splitlines()),
            github_output=Path(output),
        )


@dataclass
class Selection:
    docs_facing: dict[str, list[str]]
    non_docs_facing: list[str]
    classified: bool


@dataclass
class AssignmentResult:
    owner_assigned: bool = False
    assigned: list[str] = field(default_factory=list)
    fyi_count: int = 0
    standin_notes: list[str] = field(default_factory=list)
    unresolved_notes: list[str] = field(default_factory=list)


class GitHub:
    def __init__(self, config: Config):
        self.config = config

    @staticmethod
    def _run(*args: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["gh", *args],
            check=False,
            capture_output=True,
            text=True,
        )

    def assign_owner(self, login: str) -> bool:
        result = self._run(
            "pr",
            "edit",
            self.config.pr_number,
            "--repo",
            self.config.review_repo,
            "--add-assignee",
            login,
        )
        return result.returncode == 0

    def request_review(self, login: str) -> bool:
        result = self._run(
            "api",
            "--method",
            "POST",
            (
                f"repos/{self.config.review_repo}/pulls/"
                f"{self.config.pr_number}/requested_reviewers"
            ),
            "-f",
            f"reviewers[]={login}",
        )
        return result.returncode == 0

    def merged_prs_for_commit(self, sha: str) -> list[int]:
        result = self._run(
            "api",
            f"repos/{self.config.release_repo}/commits/{sha}/pulls",
        )
        if result.returncode != 0:
            return []
        try:
            pulls = json.loads(result.stdout)
        except json.JSONDecodeError:
            return []
        return unique_ints(
            [
                pull.get("number")
                for pull in pulls
                if pull.get("merged_at") and isinstance(pull.get("number"), int)
            ]
        )

    def merger_for_pr(self, pr_number: int) -> str:
        result = self._run(
            "pr",
            "view",
            str(pr_number),
            "--repo",
            self.config.release_repo,
            "--json",
            "mergedBy",
        )
        if result.returncode != 0:
            return ""
        try:
            merged_by = json.loads(result.stdout).get("mergedBy") or {}
        except json.JSONDecodeError:
            return ""
        return merged_by.get("login") or ""


def unique_ints(values: list[int | None]) -> list[int]:
    return list(dict.fromkeys(value for value in values if value is not None))


def read_json(path: Path) -> dict | None:
    try:
        value = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError):
        return None
    return value if isinstance(value, dict) else None


def commits_by_author(release_meta: dict | None) -> dict[str, list[str]]:
    result: dict[str, list[str]] = {}
    for commit in (release_meta or {}).get("commits", []):
        if not isinstance(commit, dict):
            continue
        login = commit.get("author")
        sha = commit.get("sha")
        if isinstance(login, str) and isinstance(sha, str):
            result.setdefault(login, []).append(sha)
    return {login: unique(shas) for login, shas in result.items()}


def fallback_selection(
    candidates: list[str], commits: dict[str, list[str]], reason: str
) -> Selection:
    warning(f"{reason}; falling back to requesting all contributors.")
    return Selection(
        docs_facing={login: commits.get(login, []) for login in candidates},
        non_docs_facing=[],
        classified=False,
    )


def select_contributors(
    candidates: list[str], reviewers: dict | None, release_meta: dict | None
) -> Selection:
    commits = commits_by_author(release_meta)
    if reviewers is None:
        return fallback_selection(candidates, commits, "No usable REVIEWERS.json")

    entries = reviewers.get("contributors")
    if not isinstance(entries, list) or not entries:
        return fallback_selection(
            candidates, commits, "REVIEWERS.json classified no contributors"
        )

    by_login: dict[str, dict] = {}
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        login = entry.get("login")
        docs_facing = entry.get("docs_facing")
        if isinstance(login, str) and isinstance(docs_facing, bool):
            by_login[login] = entry

    missing = [login for login in candidates if login not in by_login]
    if missing:
        return fallback_selection(
            candidates,
            commits,
            "REVIEWERS.json omitted release contributors: " + ", ".join(missing),
        )

    docs_facing: dict[str, list[str]] = {}
    non_docs_facing: list[str] = []
    for login in candidates:
        entry = by_login[login]
        if not entry["docs_facing"]:
            non_docs_facing.append(login)
            continue

        shas = entry.get("docs_facing_shas")
        if not isinstance(shas, list) or not shas or not all(
            isinstance(sha, str) for sha in shas
        ):
            return fallback_selection(
                candidates,
                commits,
                f"REVIEWERS.json omitted docs_facing_shas for {login}",
            )

        authored_shas = set(commits.get(login, []))
        unknown = [sha for sha in shas if sha not in authored_shas]
        if unknown:
            return fallback_selection(
                candidates,
                commits,
                f"REVIEWERS.json listed unknown commit SHAs for {login}",
            )
        docs_facing[login] = unique(shas)

    return Selection(docs_facing, non_docs_facing, True)


def is_human_standin(login: str, contributor: str) -> bool:
    return bool(login) and login != contributor and not BOT_LOGIN.search(login)


def assign_reviewers(
    config: Config, selection: Selection, github: GitHub
) -> AssignmentResult:
    result = AssignmentResult()
    requested: set[str] = set()

    def request_once(login: str) -> bool:
        if login in requested:
            return True
        if github.request_review(login):
            requested.add(login)
            result.assigned.append(login)
            print(f"Review requested: {login}")
            return True
        return False

    if config.owner:
        result.owner_assigned = github.assign_owner(config.owner)
        if result.owner_assigned:
            print(f"Assigned owner: {config.owner}")
        else:
            warning(f"Could not assign owner {config.owner} as assignee.")

        if not request_once(config.owner):
            warning(f"Could not request a review from owner {config.owner}.")
            result.unresolved_notes.append(
                f"Release owner `{config.owner}` could not be requested as a reviewer. "
                "A docs maintainer must route this review."
            )
    else:
        warning("No release owner resolved; PR has no assignee or owner review.")

    result.fyi_count = len(
        [login for login in selection.non_docs_facing if login != config.owner]
    )

    for contributor, shas in selection.docs_facing.items():
        if contributor == config.owner:
            continue
        if request_once(contributor):
            continue

        print(
            f"Direct review request rejected for {contributor}; "
            "resolving upstream merger stand-ins."
        )
        seen_prs: set[int] = set()
        if not shas:
            result.unresolved_notes.append(
                f"Docs-facing contributor `{contributor}` has no commit available for "
                "stand-in resolution. The release owner must route this review."
            )
            continue

        for sha in shas:
            pull_numbers = github.merged_prs_for_commit(sha)
            if not pull_numbers:
                result.unresolved_notes.append(
                    f"Docs-facing commit `{sha[:12]}` could not be mapped to a merged "
                    "upstream PR. The release owner must route this review."
                )
                continue

            for pull_number in pull_numbers:
                if pull_number in seen_prs:
                    continue
                seen_prs.add(pull_number)
                merger = github.merger_for_pr(pull_number)
                upstream_pr = f"{config.release_repo}#{pull_number}"
                if not is_human_standin(merger, contributor):
                    result.unresolved_notes.append(
                        f"Upstream PR `{upstream_pr}` has no human merger available as "
                        "a stand-in. The release owner must route this review."
                    )
                    continue
                if not request_once(merger):
                    result.unresolved_notes.append(
                        f"Upstream merger `{merger}` could not be requested for "
                        f"`{upstream_pr}`. The release owner must route this review."
                    )
                    continue
                result.standin_notes.append(f"@{merger} (merged {upstream_pr})")
                print(f"Stand-in review requested: {merger} for {upstream_pr}")

    result.assigned = unique(result.assigned)
    result.standin_notes = unique(result.standin_notes)
    result.unresolved_notes = unique(result.unresolved_notes)
    return result


def write_multiline(output, name: str, lines: list[str]) -> None:
    marker = f"{name.upper()}_EOF"
    output.write(f"{name}<<{marker}\n")
    if lines:
        output.write("\n".join(lines) + "\n")
    output.write(f"{marker}\n")


def write_outputs(
    config: Config, selection: Selection, result: AssignmentResult
) -> None:
    with config.github_output.open("a") as output:
        output.write(f"compare_ok={config.compare_ok}\n")
        output.write(f"owner={config.owner}\n")
        output.write(f"owner_assigned={str(result.owner_assigned).lower()}\n")
        output.write(f"list={','.join(result.assigned)}\n")
        output.write(f"fyi_count={result.fyi_count}\n")
        output.write(f"classified={str(selection.classified).lower()}\n")
        output.write(f"unresolved_count={len(result.unresolved_notes)}\n")
        write_multiline(output, "standin_block", result.standin_notes)
        write_multiline(output, "unresolved_block", result.unresolved_notes)


def main() -> int:
    config = Config.from_env()
    reviewers = read_json(Path("REVIEWERS.json"))
    release_meta = read_json(Path(".release-meta.json"))
    selection = select_contributors(config.candidates, reviewers, release_meta)
    result = assign_reviewers(config, selection, GitHub(config))
    write_outputs(config, selection, result)
    print(f"Owner:          {config.owner or '<none>'}")
    print(f"Requested:      {','.join(result.assigned) or '<none>'}")
    print(f"Stand-ins:      {len(result.standin_notes)}")
    print(f"Unresolved:     {len(result.unresolved_notes)}")
    print(f"No-docs impact: {result.fyi_count} (not auto-notified)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
