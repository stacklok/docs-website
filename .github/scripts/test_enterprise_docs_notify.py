# SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
# SPDX-License-Identifier: Apache-2.0

import json
import os
from pathlib import Path
import subprocess
import tempfile
import textwrap
import unittest

from post_autogen_docs_slack import build_message


class EnterpriseDocsNotificationTests(unittest.TestCase):
    def compose(self, labels, *, stable=False, event="pull_request_target", comment=None, draft=None, author="app/stacklok-octosts"):
        workflow = (Path(__file__).resolve().parents[1] / "workflows/enterprise-docs-notify.yml").read_text()
        step = workflow.split("      - name: Resolve PR and compose notification\n", 1)[1]
        script = textwrap.dedent(step.split("        run: |\n", 1)[1].split("\n      # Only the deterministic", 1)[0])
        pr = {
            "author": {"login": author},
            "assignees": [{"login": "release-owner"}],
            "baseRefName": "main", "headRefName": "sep/references-v0.26.0",
            "isCrossRepository": False, "isDraft": (not stable) if draft is None else draft, "state": "OPEN",
            "body": "<!-- sep-docs-stage: stable -->" if stable else "<!-- sep-docs-stage: beta -->",
            "labels": [{"name": label} for label in labels],
            "url": "https://github.com/stacklok/docs-website/pull/1317",
        }
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            gh = root / "gh"
            gh.write_text("#!/bin/sh\nprintf '%s\\n' \"$PR_FIXTURE\"\n")
            gh.chmod(0o755)
            message = root / "message.json"
            result = subprocess.run(
                ["bash", "-eo", "pipefail", "-c", script],
                env={**os.environ, "PATH": f"{root}:{os.environ['PATH']}",
                     "PR_NUMBER": "1317", "GITHUB_REPOSITORY": "stacklok/docs-website",
                     "GITHUB_OUTPUT": str(root / "output"), "MESSAGE_FILE": str(message),
                     "PR_FIXTURE": json.dumps(pr), "EVENT_NAME": event,
                     "COMMENT_BODY": comment if comment is not None else "<!-- sep-docs-stable:v0.26.0 -->\nStable is live."},
                capture_output=True, text=True,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            return json.loads(message.read_text()) if message.exists() else None

    def test_reference_notification_states_stable_gate_before_scope(self):
        content = self.compose(["autogen-docs"])
        message = build_message(content, content["pr_url"], {})
        self.assertIn("Merge only after Stacklok Enterprise v0.26.0 has been promoted to the Stable channel.", message)
        self.assertIn("This PR stays in draft until promotion", message)
        self.assertLess(message.index("Merge only after"), message.index("Auto-generated API"))
        self.assertIn("*Owner:* @release-owner", message)
        self.assertNotIn("Target: 2 business days", message)

    def test_stable_comment_announces_ready_pr(self):
        content = self.compose(["autogen-docs"], stable=True, event="issue_comment")
        message = build_message(content, content["pr_url"], {})
        self.assertIn("is live on Stable", message)
        self.assertIn("ready for review", message)
        self.assertIn("all PR checks pass", message)
        self.assertNotIn("Merge only after", message)
        self.assertIn("*Owner:* @release-owner", message)

    def test_stable_comment_requires_matching_release_and_ready_state(self):
        for options in (
            {"stable": True, "comment": "<!-- sep-docs-stable:v0.27.0 -->\nStable is live."},
            {"stable": True, "draft": True},
            {"stable": False, "draft": False},
            {"stable": True, "author": "someone-else"},
        ):
            with self.subTest(options=options):
                self.assertIsNone(self.compose(["autogen-docs"], event="issue_comment", **options))

    def test_delayed_label_event_does_not_repeat_stable_announcement(self):
        self.assertIsNone(self.compose(["autogen-docs"], stable=True))

    def test_manual_retry_uses_current_release_stage(self):
        content = self.compose(["autogen-docs"], stable=True, event="workflow_dispatch")
        self.assertIn("docs ready for review", content["headline"])

    def test_ready_state_alone_does_not_announce_stable(self):
        content = self.compose(["autogen-docs"], draft=False, event="workflow_dispatch")
        message = build_message(content, content["pr_url"], {})
        self.assertIn("awaiting Stable", message)
        self.assertNotIn("stays in draft", message)
        self.assertNotIn("is live on Stable", message)

    def test_unlabeled_pr_does_not_produce_a_notification(self):
        self.assertIsNone(self.compose([]))


if __name__ == "__main__":
    unittest.main()
