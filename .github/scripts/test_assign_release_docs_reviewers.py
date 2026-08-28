import subprocess
import tempfile
import unittest
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path
from unittest.mock import patch

from assign_release_docs_reviewers import (
    Config,
    GitHub,
    ReviewRequestError,
    ReviewRequestOutcome,
    Selection,
    assign_reviewers,
    select_contributors,
    write_outputs,
)


SHA_A = "a" * 40
SHA_B = "b" * 40
SHA_C = "c" * 40


class FakeGitHub:
    def __init__(self):
        self.owner_assignment = True
        self.review_results = {}
        self.prs_by_sha = {}
        self.mergers = {}
        self.assignee_calls = []
        self.review_calls = []

    def assign_owner(self, login):
        self.assignee_calls.append(login)
        return self.owner_assignment

    def request_review(self, login):
        self.review_calls.append(login)
        return self.review_results.get(login, ReviewRequestOutcome.REQUESTED)

    def merged_prs_for_commit(self, sha):
        return self.prs_by_sha.get(sha, [])

    def merger_for_pr(self, pr_number):
        return self.mergers.get(pr_number, "")


def config(owner="", candidates=None):
    return Config(
        review_repo="stacklok/docs-website",
        release_repo="stacklok/toolhive",
        pr_number="123",
        owner=owner,
        compare_ok="true",
        candidates=candidates or [],
        github_output=Path("unused"),
    )


def release_meta(commits):
    return {"commits": commits}


class ReviewerSelectionTests(unittest.TestCase):
    def test_owner_is_requested_when_classified_non_docs_facing(self):
        reviewers = {
            "contributors": [
                {"login": "owner", "docs_facing": False},
                {
                    "login": "alice",
                    "docs_facing": True,
                    "docs_facing_shas": [SHA_A],
                },
            ]
        }
        meta = release_meta(
            [
                {"author": "owner", "sha": SHA_B},
                {"author": "alice", "sha": SHA_A},
            ]
        )
        selection = select_contributors(["owner", "alice"], reviewers, meta)
        github = FakeGitHub()

        result = assign_reviewers(
            config("owner", ["owner", "alice"]), selection, github
        )

        self.assertEqual(github.assignee_calls, ["owner"])
        self.assertEqual(github.review_calls, ["owner", "alice"])
        self.assertEqual(result.assigned, ["owner", "alice"])
        self.assertEqual(result.fyi_count, 0)

    def test_missing_classification_requests_all_and_falls_back_to_merger(self):
        meta = release_meta(
            [
                {"author": "alice", "sha": SHA_A},
                {"author": "external", "sha": SHA_B},
            ]
        )
        selection = select_contributors(["alice", "external"], None, meta)
        github = FakeGitHub()
        github.review_results = {
            "external": ReviewRequestOutcome.ACCESS_REJECTED
        }
        github.prs_by_sha = {SHA_B: [77]}
        github.mergers = {77: "merger"}

        result = assign_reviewers(
            config(candidates=["alice", "external"]), selection, github
        )

        self.assertFalse(selection.classified)
        self.assertEqual(github.review_calls, ["alice", "external", "merger"])
        self.assertEqual(result.assigned, ["alice", "merger"])
        self.assertEqual(result.standin_notes, ["@merger (merged stacklok/toolhive#77)"])

    def test_all_docs_facing_pr_mergers_are_requested_and_deduplicated(self):
        reviewers = {
            "contributors": [
                {
                    "login": "external",
                    "docs_facing": True,
                    "docs_facing_shas": [SHA_A, SHA_B, SHA_C],
                }
            ]
        }
        meta = release_meta(
            [
                {"author": "external", "sha": SHA_A},
                {"author": "external", "sha": SHA_B},
                {"author": "external", "sha": SHA_C},
            ]
        )
        selection = select_contributors(["external"], reviewers, meta)
        github = FakeGitHub()
        github.review_results = {
            "external": ReviewRequestOutcome.ACCESS_REJECTED
        }
        github.prs_by_sha = {SHA_A: [10], SHA_B: [10], SHA_C: [11]}
        github.mergers = {10: "alice", 11: "bob"}

        result = assign_reviewers(config(candidates=["external"]), selection, github)

        self.assertEqual(github.review_calls, ["external", "alice", "bob"])
        self.assertEqual(result.assigned, ["alice", "bob"])
        self.assertEqual(
            result.standin_notes,
            [
                "@alice (merged stacklok/toolhive#10)",
                "@bob (merged stacklok/toolhive#11)",
            ],
        )

    def test_existing_reviewer_is_recorded_as_an_active_standin(self):
        reviewers = {
            "contributors": [
                {
                    "login": "external",
                    "docs_facing": True,
                    "docs_facing_shas": [SHA_A],
                }
            ]
        }
        meta = release_meta([{"author": "external", "sha": SHA_A}])
        selection = select_contributors(["external"], reviewers, meta)
        github = FakeGitHub()
        github.review_results = {
            "external": ReviewRequestOutcome.ACCESS_REJECTED
        }
        github.prs_by_sha = {SHA_A: [77]}
        github.mergers = {77: "owner"}
        output = StringIO()

        with redirect_stdout(output):
            result = assign_reviewers(
                config(owner="owner", candidates=["external"]), selection, github
            )

        self.assertEqual(github.review_calls, ["owner", "external"])
        self.assertEqual(result.assigned, ["owner"])
        self.assertEqual(result.standin_notes, ["@owner (merged stacklok/toolhive#77)"])
        self.assertIn(
            "Stand-in review already active: owner for stacklok/toolhive#77",
            output.getvalue(),
        )

    def test_non_docs_facing_contributors_are_counted_without_requests(self):
        reviewers = {
            "contributors": [
                {"login": "alice", "docs_facing": False},
                {"login": "external", "docs_facing": False},
            ]
        }
        meta = release_meta(
            [
                {"author": "alice", "sha": SHA_A},
                {"author": "external", "sha": SHA_B},
            ]
        )
        selection = select_contributors(["alice", "external"], reviewers, meta)
        github = FakeGitHub()

        result = assign_reviewers(
            config(candidates=["alice", "external"]), selection, github
        )

        self.assertEqual(github.review_calls, [])
        self.assertEqual(result.fyi_count, 2)

    def test_missing_standin_is_an_owner_routing_warning_without_at_mention(self):
        reviewers = {
            "contributors": [
                {
                    "login": "external",
                    "docs_facing": True,
                    "docs_facing_shas": [SHA_A],
                }
            ]
        }
        meta = release_meta([{"author": "external", "sha": SHA_A}])
        selection = select_contributors(["external"], reviewers, meta)
        github = FakeGitHub()
        github.review_results = {
            "external": ReviewRequestOutcome.ACCESS_REJECTED
        }

        result = assign_reviewers(
            config(owner="owner", candidates=["external"]), selection, github
        )

        self.assertEqual(result.assigned, ["owner"])
        self.assertEqual(len(result.unresolved_notes), 1)
        self.assertNotIn("@external", result.unresolved_notes[0])

    def test_invalid_docs_facing_shas_trigger_noisy_fallback(self):
        reviewers = {
            "contributors": [
                {"login": "alice", "docs_facing": True},
                {"login": "bob", "docs_facing": False},
            ]
        }
        meta = release_meta(
            [
                {"author": "alice", "sha": SHA_A},
                {"author": "bob", "sha": SHA_B},
            ]
        )

        selection = select_contributors(["alice", "bob"], reviewers, meta)

        self.assertFalse(selection.classified)
        self.assertEqual(selection.docs_facing, {"alice": [SHA_A], "bob": [SHA_B]})
        self.assertEqual(selection.non_docs_facing, [])

    def test_duplicate_contributor_records_trigger_noisy_fallback(self):
        reviewers = {
            "contributors": [
                {
                    "login": "alice",
                    "docs_facing": True,
                    "docs_facing_shas": [SHA_A],
                },
                {"login": "alice", "docs_facing": False},
            ]
        }
        meta = release_meta([{"author": "alice", "sha": SHA_A}])

        selection = select_contributors(["alice"], reviewers, meta)

        self.assertFalse(selection.classified)
        self.assertEqual(selection.docs_facing, {"alice": [SHA_A]})
        self.assertEqual(selection.non_docs_facing, [])

    def test_rejected_docs_facing_owner_falls_back_to_merger(self):
        reviewers = {
            "contributors": [
                {
                    "login": "owner",
                    "docs_facing": True,
                    "docs_facing_shas": [SHA_A],
                }
            ]
        }
        meta = release_meta([{"author": "owner", "sha": SHA_A}])
        selection = select_contributors(["owner"], reviewers, meta)
        github = FakeGitHub()
        github.review_results = {"owner": ReviewRequestOutcome.ACCESS_REJECTED}
        github.prs_by_sha = {SHA_A: [77]}
        github.mergers = {77: "merger"}

        result = assign_reviewers(config(owner="owner"), selection, github)

        self.assertEqual(github.review_calls, ["owner", "merger"])
        self.assertEqual(result.assigned, ["merger"])
        self.assertEqual(result.standin_notes, ["@merger (merged stacklok/toolhive#77)"])
        self.assertEqual(result.unresolved_notes, [])

    def test_missing_owner_is_an_unresolved_routing_outcome(self):
        selection = Selection(docs_facing={}, non_docs_facing=[], classified=True)

        result = assign_reviewers(config(), selection, FakeGitHub())

        self.assertEqual(len(result.unresolved_notes), 1)
        self.assertIn("No release owner could be resolved", result.unresolved_notes[0])
        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = Path(temp_dir) / "github-output"
            test_config = Config(
                review_repo="stacklok/docs-website",
                release_repo="stacklok/toolhive",
                pr_number="123",
                owner="",
                compare_ok="true",
                candidates=[],
                github_output=output_path,
            )
            write_outputs(test_config, selection, result)
            self.assertIn("unresolved_count=1", output_path.read_text())


class GitHubReviewRequestTests(unittest.TestCase):
    def test_access_rejection_is_the_only_expected_failure(self):
        response = subprocess.CompletedProcess(
            args=[],
            returncode=1,
            stdout=(
                "HTTP/2.0 422 Unprocessable Entity\r\n\r\n"
                '{"message":"Reviews may only be requested from collaborators."}'
            ),
            stderr="gh: Reviews may only be requested from collaborators. (HTTP 422)",
        )

        with patch.object(GitHub, "_run", return_value=response):
            outcome = GitHub(config()).request_review("external")

        self.assertIs(outcome, ReviewRequestOutcome.ACCESS_REJECTED)

    def test_transient_api_failure_stops_routing(self):
        response = subprocess.CompletedProcess(
            args=[],
            returncode=1,
            stdout=(
                "HTTP/2.0 503 Service Unavailable\r\n\r\n"
                '{"message":"Service unavailable"}'
            ),
            stderr="gh: Service unavailable (HTTP 503)",
        )

        with patch.object(GitHub, "_run", return_value=response):
            with self.assertRaisesRegex(ReviewRequestError, "HTTP status 503"):
                GitHub(config()).request_review("alice")


if __name__ == "__main__":
    unittest.main()
