#!/usr/bin/env python3
"""Post a reviewer summary for an autogen-docs PR to Slack.

Deterministic second half of the Autogen Docs Slack Notify workflow.
The Claude step (claude-code-action) only COMPOSES the message content
and writes it to a JSON file; it never holds the Slack token and has no
curl/network access. This script is the ONLY place the Slack token
lives, and it only ever contacts slack.com.

It reads the JSON content file, resolves each reviewer's GitHub login to
a Slack user id (falling back to the literal @handle when no confident
match exists), builds one Slack mrkdwn message, and posts it via
chat.postMessage.

Python 3 standard library only.
"""

import json
import os
import sys
import urllib.parse
import urllib.request

# Hardcoded so this script can ONLY ever talk to Slack. Do not make this
# configurable from the environment / message file (defense in depth:
# the message content is composed by a prompt-injectable Claude step).
SLACK_BASE_URL = "https://slack.com"


def fail(message):
    """Print an error and exit non-zero so the workflow step fails."""
    print(message, file=sys.stderr)
    sys.exit(1)


def require_env(name):
    value = os.environ.get(name)
    if not value:
        fail("Missing required environment variable: {}".format(name))
    return value


def load_message(path):
    """Load and minimally validate the JSON content file from step 1."""
    try:
        with open(path, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except FileNotFoundError:
        fail("Message file not found: {}".format(path))
    except (OSError, ValueError) as exc:
        fail("Could not read/parse message file {}: {}".format(path, exc))

    if not isinstance(data, dict):
        fail("Message file {} did not contain a JSON object".format(path))
    return data


def slack_get(token, method, params):
    """GET a Slack Web API method and return the parsed JSON response."""
    url = "{}/api/{}?{}".format(
        SLACK_BASE_URL, method, urllib.parse.urlencode(params)
    )
    request = urllib.request.Request(url, method="GET")
    request.add_header("Authorization", "Bearer {}".format(token))
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode("utf-8"))


def slack_post_json(token, method, payload):
    """POST JSON to a Slack Web API method and return the parsed JSON."""
    url = "{}/api/{}".format(SLACK_BASE_URL, method)
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(url, data=body, method="POST")
    request.add_header("Authorization", "Bearer {}".format(token))
    request.add_header(
        "Content-type", "application/json; charset=utf-8"
    )
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode("utf-8"))


def normalize_handle(value):
    """Normalize a possible GitHub handle for comparison.

    Lowercases, strips a leading "@", and reduces a full
    https://github.com/<login> URL form to just <login>.
    """
    if not isinstance(value, str):
        return ""
    candidate = value.strip().lower()
    if not candidate:
        return ""
    # Tolerate a full GitHub profile URL form.
    for prefix in ("https://github.com/", "http://github.com/", "github.com/"):
        if candidate.startswith(prefix):
            candidate = candidate[len(prefix):]
            break
    # Drop a trailing slash and anything after it (e.g. URL path tail).
    candidate = candidate.split("/", 1)[0]
    if candidate.startswith("@"):
        candidate = candidate[1:]
    return candidate


def profile_candidate_values(profile):
    """Yield candidate strings from a Slack profile that might hold a
    GitHub handle, including any custom profile field values.

    NOTE: Resolution depends on the workspace returning custom profile
    fields in users.list (the Okta-pushed "GitHub" profile field). Not
    all workspaces include custom `fields` in the bulk users.list
    response; when they are absent this simply finds no match and the
    caller degrades gracefully to plain @handle text.
    """
    if not isinstance(profile, dict):
        return
    # Standard-ish profile string fields that sometimes carry a handle.
    for key in ("display_name", "display_name_normalized", "title"):
        value = profile.get(key)
        if isinstance(value, str) and value:
            yield value
    # Custom profile fields: profile["fields"] maps field-id -> {value,...}.
    fields = profile.get("fields")
    if isinstance(fields, dict):
        for entry in fields.values():
            if isinstance(entry, dict):
                value = entry.get("value")
                if isinstance(value, str) and value:
                    yield value


def build_login_to_slack_id(token):
    """Build a map of normalized GitHub handle -> Slack user id by
    scanning every non-deleted, non-bot member's profile fields.

    A handle that matches more than one member is treated as ambiguous
    and dropped (the caller then falls back to @handle text).
    """
    matches = {}
    ambiguous = set()
    cursor = ""
    while True:
        params = {"limit": 200}
        if cursor:
            params["cursor"] = cursor
        response = slack_get(token, "users.list", params)
        if not response.get("ok"):
            # Resolution is best-effort; if listing fails we just fall
            # back to plain @handle text for everyone.
            print(
                "Warning: users.list failed ({}); "
                "falling back to plain @handles".format(
                    response.get("error")
                ),
                file=sys.stderr,
            )
            return {}

        for member in response.get("members", []):
            if not isinstance(member, dict):
                continue
            if member.get("deleted") or member.get("is_bot"):
                continue
            user_id = member.get("id")
            if not user_id:
                continue
            for value in profile_candidate_values(member.get("profile")):
                handle = normalize_handle(value)
                if not handle:
                    continue
                if handle in matches and matches[handle] != user_id:
                    ambiguous.add(handle)
                else:
                    matches[handle] = user_id

        cursor = (
            response.get("response_metadata", {}).get("next_cursor") or ""
        )
        if not cursor:
            break

    for handle in ambiguous:
        matches.pop(handle, None)
    return matches


def reviewer_tag(login, login_to_slack_id):
    """Return a Slack tag for a reviewer: <@ID> if uniquely resolved,
    else the literal @login text. Never guesses an id."""
    slack_id = login_to_slack_id.get(normalize_handle(login))
    if slack_id:
        return "<@{}>".format(slack_id)
    return "@{}".format(login)


def build_message(content, pr_url, login_to_slack_id):
    """Build the single Slack mrkdwn message string."""
    headline = str(content.get("headline") or "Documentation update")
    lines = ["<{}|{}>".format(pr_url, headline)]

    bullets = content.get("summary_bullets")
    if isinstance(bullets, list):
        for bullet in bullets:
            if isinstance(bullet, str) and bullet.strip():
                lines.append("• {}".format(bullet.strip()))

    reviewers = content.get("reviewers")
    if isinstance(reviewers, list) and reviewers:
        lines.append("")
        lines.append("*Reviewers*")
        for reviewer in reviewers:
            if not isinstance(reviewer, dict):
                continue
            login = reviewer.get("login")
            if not login:
                continue
            note = reviewer.get("note") or ""
            tag = reviewer_tag(login, login_to_slack_id)
            if note:
                lines.append("{} — {}".format(tag, note))
            else:
                lines.append("{}".format(tag))

    return "\n".join(lines)


def main():
    token = require_env("SLACK_BOT_TOKEN")
    channel = require_env("DOCS_SLACK_CHANNEL_ID")
    message_file = require_env("MESSAGE_FILE")
    pr_url = require_env("PR_URL")

    content = load_message(message_file)
    # Prefer the PR url from the trusted env var over the content file.
    pr_url = pr_url or str(content.get("pr_url") or "")

    login_to_slack_id = build_login_to_slack_id(token)
    message = build_message(content, pr_url, login_to_slack_id)

    response = slack_post_json(
        token,
        "chat.postMessage",
        {"channel": channel, "text": message},
    )
    if not response.get("ok"):
        print("Slack chat.postMessage failed:", file=sys.stderr)
        print(json.dumps(response, indent=2), file=sys.stderr)
        sys.exit(1)

    print("Posted reviewer summary to Slack channel {}.".format(channel))


if __name__ == "__main__":
    main()
