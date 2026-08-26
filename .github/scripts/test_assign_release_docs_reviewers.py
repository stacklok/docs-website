import unittest
from pathlib import Path

from assign_release_docs_reviewers import (
    Config,
    assign_reviewers,
    select_contributors,
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
        return self.review_results.get(login, True)

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
        github.review_results = {"external": False}
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
        github.review_results = {"external": False}
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
        github.review_results = {"external": False}

        result = assign_reviewers(config(candidates=["external"]), selection, github)

        self.assertEqual(result.assigned, [])
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


if __name__ == "__main__":
    unittest.main()
