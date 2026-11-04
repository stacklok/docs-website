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
    def compose(self, labels):
        workflow = (Path(__file__).resolve().parents[1] / "workflows/enterprise-docs-notify.yml").read_text()
        step = workflow.split("      - name: Resolve PR and compose notification\n", 1)[1]
        script = textwrap.dedent(step.split("        run: |\n", 1)[1].split("\n      # Only the deterministic", 1)[0])
        pr = {
            "author": {"login": "app/stacklok-octosts"},
            "assignees": [{"login": "release-owner"}],
            "baseRefName": "main", "headRefName": "sep/references-v0.26.0",
            "isCrossRepository": False, "isDraft": False, "state": "OPEN",
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
                     "PR_FIXTURE": json.dumps(pr)},
                capture_output=True, text=True,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            return json.loads(message.read_text()) if message.exists() else None

    def test_reference_notification_states_stable_gate_before_scope(self):
        content = self.compose(["autogen-docs"])
        message = build_message(content, content["pr_url"], {})
        self.assertIn("Merge only after Stacklok Enterprise v0.26.0 has been promoted to the Stable channel.", message)
        self.assertIn("Review can begin before promotion", message)
        self.assertLess(message.index("Merge only after"), message.index("Auto-generated API"))
        self.assertIn("*Owner:* @release-owner", message)
        self.assertNotIn("Target: 2 business days", message)

    def test_unlabeled_pr_does_not_produce_a_notification(self):
        self.assertIsNone(self.compose([]))


if __name__ == "__main__":
    unittest.main()
