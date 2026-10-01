import json
import stat
import subprocess
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import call, patch

from update_visual_failure_comment import (
    ArtifactValidationError,
    Failure,
    load_failures,
    parse_failure_detail,
    render_comment,
    update_comment,
)


PIXEL_FAILURE = """# Instructions

- Following Playwright test failed.

# Test info

- Name: pages.spec.ts >> nav page - AI Gateway
- Location: tests/visual/pages.spec.ts:45:7

# Error details

```
Error: expect(locator).toHaveScreenshot(expected) failed

Locator: locator('.theme-doc-sidebar-container > div')
  643 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: nav-page-ai-gateway-light.png
```
"""


def write_artifact(root, members):
    archive_path = root / "playwright-report.zip"
    with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, contents in members.items():
            archive.writestr(name, contents)
    return archive_path


class VisualFailureSummaryTests(unittest.TestCase):
    def test_parses_pixel_failure(self):
        failure = parse_failure_detail(PIXEL_FAILURE)

        self.assertEqual(
            failure,
            Failure(
                test_name="pages.spec.ts >> nav page - AI Gateway",
                error="expect(locator).toHaveScreenshot(expected) failed",
                snapshot="nav-page-ai-gateway-light.png",
                pixels=643,
                ratio="0.01",
            ),
        )

    def test_ignores_unrelated_markdown(self):
        self.assertIsNone(parse_failure_detail("# Documentation"))

    def test_loads_only_playwright_failure_details(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            archive_path = write_artifact(
                root,
                {
                    "playwright-report/data/failure.md": PIXEL_FAILURE,
                    "playwright-report/data/other.md": "# Documentation",
                },
            )

            self.assertEqual(len(load_failures(archive_path)), 1)

    def test_rejects_oversized_failure_detail(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            archive_path = write_artifact(
                root,
                {
                    "playwright-report/data/failure.md": b"x"
                    * (1024 * 1024 + 1)
                },
            )

            with self.assertRaises(ArtifactValidationError):
                load_failures(archive_path)

    def test_rejects_symlink(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            archive_path = root / "playwright-report.zip"
            link = zipfile.ZipInfo("playwright-report/data/link.md")
            link.create_system = 3
            link.external_attr = (stat.S_IFLNK | 0o777) << 16
            with zipfile.ZipFile(archive_path, "w") as archive:
                archive.writestr(link, "target.md")

            with self.assertRaises(ArtifactValidationError):
                load_failures(archive_path)

    def test_rejects_archive_path_traversal(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            archive_path = write_artifact(root, {"../failure.md": PIXEL_FAILURE})

            with self.assertRaises(ArtifactValidationError):
                load_failures(archive_path)

    def test_groups_light_and_dark_failures(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            repository = Path(temp_dir)
            snapshots = repository / "tests/visual/pages.spec.ts-snapshots"
            snapshots.mkdir(parents=True)
            metadata = {"url": {"path": "/ai-gateway"}}
            for theme in ("light", "dark"):
                path = snapshots / f"nav-page-ai-gateway-{theme}-desktop-linux.json"
                path.write_text(json.dumps(metadata))

            failures = [
                Failure(
                    "pages.spec.ts >> nav page - AI Gateway",
                    "screenshot changed",
                    f"nav-page-ai-gateway-{theme}.png",
                    643,
                    "0.01",
                )
                for theme in ("light", "dark")
            ]
            comment = render_comment(
                failures,
                repository,
                "a" * 40,
                "https://example.test/run",
                "https://example.test/job",
            )

            self.assertIn("changed 2 visual snapshots across 1 screen", comment)
            self.assertIn("Dark: 643 pixels (ratio 0.01)<br>Light: 643", comment)
            self.assertIn("`/ai-gateway`", comment)
            self.assertEqual(comment.count("nav page - AI Gateway"), 1)

    def test_reads_metadata_from_tested_head_revision(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            repository = Path(temp_dir)
            subprocess.run(["git", "init", "-q", repository], check=True)
            subprocess.run(
                ["git", "-C", repository, "config", "user.name", "Test"],
                check=True,
            )
            subprocess.run(
                [
                    "git",
                    "-C",
                    repository,
                    "config",
                    "user.email",
                    "test@example.com",
                ],
                check=True,
            )
            snapshots = repository / "tests/visual/pages.spec.ts-snapshots"
            snapshots.mkdir(parents=True)
            metadata_path = (
                snapshots / "nav-page-ai-gateway-light-desktop-linux.json"
            )
            metadata_path.write_text(json.dumps({"url": {"path": "/base"}}))
            subprocess.run(
                ["git", "-C", repository, "add", "."], check=True
            )
            subprocess.run(
                ["git", "-C", repository, "commit", "-q", "-m", "base"],
                check=True,
            )
            base_sha = subprocess.run(
                ["git", "-C", repository, "rev-parse", "HEAD"],
                check=True,
                capture_output=True,
                text=True,
            ).stdout.strip()

            metadata_path.write_text(json.dumps({"url": {"path": "/head"}}))
            subprocess.run(
                ["git", "-C", repository, "add", "."], check=True
            )
            subprocess.run(
                ["git", "-C", repository, "commit", "-q", "-m", "head"],
                check=True,
            )
            head_sha = subprocess.run(
                ["git", "-C", repository, "rev-parse", "HEAD"],
                check=True,
                capture_output=True,
                text=True,
            ).stdout.strip()
            subprocess.run(
                ["git", "-C", repository, "checkout", "-q", base_sha],
                check=True,
            )

            comment = render_comment(
                [
                    Failure(
                        "pages.spec.ts >> nav page - AI Gateway",
                        "screenshot changed",
                        "nav-page-ai-gateway-light.png",
                        643,
                        "0.01",
                    )
                ],
                repository,
                head_sha,
                "https://example.test/run",
                "https://example.test/job",
                metadata_ref=head_sha,
            )

            self.assertIn("`/head`", comment)
            self.assertNotIn("`/base`", comment)

    def test_escapes_untrusted_test_name(self):
        failure = Failure(
            "pages.spec.ts >> bad | <script> @reviewers [link](url)",
            "failed",
        )
        comment = render_comment(
            [failure],
            Path("."),
            "b" * 40,
            "https://example.test/run",
            "https://example.test/job",
        )

        self.assertIn("bad \\| &lt;script&gt; &#64;reviewers", comment)
        self.assertIn(r"\[link\](url)", comment)
        self.assertNotIn("<script>", comment)
        self.assertNotIn("@reviewers", comment)

    def test_renders_fallback_when_artifact_is_missing(self):
        comment = render_comment(
            [],
            Path("."),
            "c" * 40,
            "https://example.test/run",
            "https://example.test/job",
            "the Playwright artifact is unavailable",
        )

        self.assertIn("could not produce a compact screenshot summary", comment)
        self.assertIn("artifact is unavailable", comment)

    @patch("update_visual_failure_comment.gh_api")
    @patch("update_visual_failure_comment.find_existing_comments")
    def test_creates_one_sticky_comment(self, find_comments, gh_api):
        find_comments.return_value = []

        update_comment("stacklok/docs-website", "123", "summary")

        gh_api.assert_called_once_with(
            "POST",
            "repos/stacklok/docs-website/issues/123/comments",
            {"body": "summary"},
        )

    @patch("update_visual_failure_comment.gh_api")
    @patch("update_visual_failure_comment.find_existing_comments")
    def test_updates_one_comment_and_removes_duplicates(self, find_comments, gh_api):
        find_comments.return_value = [{"id": 10}, {"id": 11}]

        update_comment("stacklok/docs-website", "123", "summary")

        self.assertEqual(
            gh_api.call_args_list,
            [
                call(
                    "PATCH",
                    "repos/stacklok/docs-website/issues/comments/10",
                    {"body": "summary"},
                ),
                call("DELETE", "repos/stacklok/docs-website/issues/comments/11"),
            ],
        )

    @patch("update_visual_failure_comment.gh_api")
    @patch("update_visual_failure_comment.find_existing_comments")
    def test_removes_stale_comment_after_success(self, find_comments, gh_api):
        find_comments.return_value = [{"id": 10}]

        update_comment("stacklok/docs-website", "123", None)

        gh_api.assert_called_once_with(
            "DELETE", "repos/stacklok/docs-website/issues/comments/10"
        )


if __name__ == "__main__":
    unittest.main()
