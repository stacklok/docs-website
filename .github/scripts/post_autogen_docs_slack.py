#!/usr/bin/env python3
"""Post a reviewer summary for an autogen-docs PR to Slack.

Deterministic second half of the Autogen Docs Slack Notify workflow.
The Claude step (claude-code-action) only COMPOSES the message content
and writes it to a JSON file; it never holds the Slack token and has no
curl/network access. This script is the ONLY place the Slack token
lives, and it only ever contacts slack.com.

It reads the JSON content file, resolves each GitHub login to a Slack
user id (falling back to the literal @handle when no confident match
exists), builds one Slack mrkdwn message, and posts it via
chat.postMessage.

The message names one OWNER (the person who cut the upstream release,
who is the PR's assignee and is responsible for merging it), then the
other requested reviewers, then a single line for contributors whose
changes had no docs impact and who were deliberately not sent a review
request. The owner-duty and no-impact wording is fixed in this file
rather than composed by the Claude step, so the process expectations
stay identical release to release.

Reviewer resolution reads the workspace's custom "GitHub handle" profile
field reliably: it first discovers that field's id once via
team.profile.get, then enumerates members via users.list (used only for
the id list) and reads each member's custom field value via
users.profile.get. Slack's bulk users.list does NOT reliably return
custom profile fields, so the per-user users.profile.get call is required
to read them.

Python 3 standard library only.
"""

import json
import os
import sys
import time
import urllib.error
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


def slack_get_with_retry(token, method, params, max_retries=3,
                         default_retry_after=3):
    """GET a Slack Web API method, honoring HTTP 429 rate limits.

    On HTTP 429 the Retry-After response header (seconds) is respected;
    if it is missing or unparseable a small default delay is used. The
    same call is retried up to max_retries times. Returns the parsed JSON
    response (which may still carry "ok": false for non-429 API errors).
    """
    url = "{}/api/{}?{}".format(
        SLACK_BASE_URL, method, urllib.parse.urlencode(params)
    )
    attempt = 0
    while True:
        request = urllib.request.Request(url, method="GET")
        request.add_header("Authorization", "Bearer {}".format(token))
        try:
            with urllib.request.urlopen(request) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            if exc.code == 429 and attempt < max_retries:
                retry_after = default_retry_after
                header = exc.headers.get("Retry-After")
                if header:
                    try:
                        retry_after = int(header)
                    except (TypeError, ValueError):
                        retry_after = default_retry_after
                time.sleep(max(retry_after, 1))
                attempt += 1
                continue
            raise


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

    Lowercases, strips a leading "@", and reduces a full GitHub profile
    URL form (with or without a scheme or "www." subdomain) to just
    <login>.
    """
    if not isinstance(value, str):
        return ""
    candidate = value.strip().lower()
    if not candidate:
        return ""
    # Tolerate a URL scheme and/or a "www." subdomain, in either order
    # of presence, before checking for the "github.com/" host.
    for scheme in ("https://", "http://"):
        if candidate.startswith(scheme):
            candidate = candidate[len(scheme):]
            break
    if candidate.startswith("www."):
        candidate = candidate[len("www."):]
    if candidate.startswith("github.com/"):
        candidate = candidate[len("github.com/"):]
    # Drop a trailing slash and anything after it (e.g. URL path tail).
    candidate = candidate.split("/", 1)[0]
    if candidate.startswith("@"):
        candidate = candidate[1:]
    return candidate


def find_github_field_id(token):
    """Find the workspace custom-profile field id for the GitHub handle.

    Uses team.profile.get, whose response carries profile.fields: a list
    of field definitions each with id (e.g. "Xf0..."), label and hint.
    Selects the field whose label, lowercased, equals or contains
    "github" (so "GitHub Handle", "GitHub", "Github Username" all match),
    preferring an exact-ish "github handle"/"github" label when several
    match. Returns the field id, or None (with a warning) when no field
    matches so the caller degrades gracefully to plain @handle text.
    """
    response = slack_get(token, "team.profile.get", {})
    if not response.get("ok"):
        print(
            "Warning: team.profile.get failed ({}); "
            "falling back to plain @handles".format(response.get("error")),
            file=sys.stderr,
        )
        return None

    fields = response.get("profile", {}).get("fields")
    if not isinstance(fields, list):
        print(
            "Warning: team.profile.get returned no profile.fields; "
            "falling back to plain @handles",
            file=sys.stderr,
        )
        return None

    candidates = []
    for entry in fields:
        if not isinstance(entry, dict):
            continue
        field_id = entry.get("id")
        label = entry.get("label")
        if not field_id or not isinstance(label, str):
            continue
        label_lower = label.strip().lower()
        if label_lower == "github" or "github" in label_lower:
            candidates.append((field_id, label_lower))

    if not candidates:
        print(
            "Warning: no custom profile field label matches 'github'; "
            "falling back to plain @handles",
            file=sys.stderr,
        )
        return None

    # Prefer an exact-ish "github handle"/"github" label.
    for field_id, label_lower in candidates:
        if label_lower in ("github handle", "github"):
            return field_id

    if len(candidates) > 1:
        print(
            "Warning: multiple custom profile fields match 'github' "
            "({}); using the first one ({}).".format(
                ", ".join(label for _, label in candidates),
                candidates[0][1],
            ),
            file=sys.stderr,
        )
    return candidates[0][0]


def iter_member_ids(token):
    """Yield non-deleted, non-bot member ids by paginating users.list.

    users.list is used only for the member id list here; its bulk
    response does not reliably include custom profile fields, so those
    are read per-user via users.profile.get instead.
    """
    cursor = ""
    while True:
        params = {"limit": 200}
        if cursor:
            params["cursor"] = cursor
        response = slack_get(token, "users.list", params)
        if not response.get("ok"):
            print(
                "Warning: users.list failed ({}); "
                "falling back to plain @handles".format(
                    response.get("error")
                ),
                file=sys.stderr,
            )
            return

        for member in response.get("members", []):
            if not isinstance(member, dict):
                continue
            if member.get("deleted") or member.get("is_bot"):
                continue
            user_id = member.get("id")
            if user_id:
                yield user_id

        cursor = (
            response.get("response_metadata", {}).get("next_cursor") or ""
        )
        if not cursor:
            break


def build_login_to_slack_id(token):
    """Build a map of normalized GitHub handle -> Slack user id.

    Discovers the GitHub-handle custom-profile field id once via
    team.profile.get, enumerates member ids via users.list, then reads
    each member's value for that field via users.profile.get. A handle
    that maps to more than one distinct member is treated as ambiguous
    and dropped (the caller then falls back to @handle text).
    """
    field_id = find_github_field_id(token)
    if not field_id:
        return {}

    matches = {}
    ambiguous = set()
    for user_id in iter_member_ids(token):
        # Minimal politeness delay between per-user profile reads.
        time.sleep(0.05)
        try:
            response = slack_get_with_retry(
                token, "users.profile.get", {"user": user_id}
            )
        except urllib.error.URLError as exc:
            print(
                "Warning: users.profile.get for {} failed ({}); "
                "skipping".format(user_id, exc),
                file=sys.stderr,
            )
            continue

        if not response.get("ok"):
            print(
                "Warning: users.profile.get for {} returned ok=false "
                "({}); skipping".format(user_id, response.get("error")),
                file=sys.stderr,
            )
            continue

        fields = response.get("profile", {}).get("fields")
        if not isinstance(fields, dict):
            continue
        entry = fields.get(field_id)
        if not isinstance(entry, dict):
            continue
        handle = normalize_handle(entry.get("value"))
        if not handle:
            continue
        if handle in matches and matches[handle] != user_id:
            ambiguous.add(handle)
        else:
            matches[handle] = user_id

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


# Fixed wording for the owner and no-docs-impact lines: these two
# sentences carry the process expectations (who merges, who is not
# blocking), so they live here rather than being composed per release
# by the Claude step, which supplies names only.
#
# The owner duty has two variants so a release with no other reviewers
# doesn't tell the owner to collect approvals nobody was asked for.
OWNER_DUTY_WITH_REVIEWERS = (
    "cut this release and owns this PR: review, collect the approvals "
    "below, and merge. Target: 2 business days."
)
OWNER_DUTY_SOLO = (
    "cut this release and owns this PR: review and merge. "
    "Target: 2 business days."
)
NO_OWNER_LINE = (
    "*No owner resolved* - nobody is assigned to merge this. "
    "A docs maintainer needs to adopt it."
)
NO_IMPACT_SUFFIX = (
    "no docs impact found in your changes, so no review is requested "
    "and you're not blocking this. Shout if we misjudged it."
)


def build_message(content, pr_url, login_to_slack_id):
    """Build the single Slack mrkdwn message string.

    Layout, in reading order: linked headline, 2-3 scope bullets, the
    owner and their duty, one line per reviewer with what to check, and
    a single consolidated line for contributors who were deliberately
    not sent a review request.

    The owner line comes before the reviewer list because "who merges
    this" is the question the message exists to answer; a five-person
    reviewer list with no named owner is what produced multi-day stalls.
    """
    headline = str(content.get("headline") or "Documentation update")
    lines = ["<{}|{}>".format(pr_url, headline)]

    bullets = content.get("summary_bullets")
    if isinstance(bullets, list):
        for bullet in bullets:
            if isinstance(bullet, str) and bullet.strip():
                lines.append("• {}".format(bullet.strip()))

    # ----- owner -----
    owner_login = ""
    owner = content.get("owner")
    if isinstance(owner, dict):
        owner_login = str(owner.get("login") or "").strip()
    elif isinstance(owner, str):
        # Tolerate a bare login string in place of the documented
        # object form rather than dropping the owner line entirely.
        owner_login = owner.strip()

    # ----- reviewers -----
    # Rendered before the owner line is emitted, because the owner's
    # duty wording depends on whether anyone else was asked to review.
    # The owner is filtered out here as well as in the prompt, so a
    # composer that ignores the exclusion can't list them twice.
    reviewers = content.get("reviewers")
    rendered = []
    if isinstance(reviewers, list):
        for reviewer in reviewers:
            if not isinstance(reviewer, dict):
                continue
            login = str(reviewer.get("login") or "").strip()
            if not login:
                continue
            if owner_login and normalize_handle(login) == normalize_handle(
                owner_login
            ):
                continue
            note = str(reviewer.get("note") or "").strip()
            tag = reviewer_tag(login, login_to_slack_id)
            if note:
                rendered.append("• {} - {}".format(tag, note))
            else:
                rendered.append("• {}".format(tag))

    lines.append("")
    if owner_login:
        duty = (
            OWNER_DUTY_WITH_REVIEWERS if rendered else OWNER_DUTY_SOLO
        )
        lines.append(
            "*Owner:* {} {}".format(
                reviewer_tag(owner_login, login_to_slack_id), duty
            )
        )
    else:
        lines.append(NO_OWNER_LINE)

    if rendered:
        lines.append("*Also review:*")
        lines.extend(rendered)

    # ----- no docs impact -----
    # One line, all handles. These contributors get no review request,
    # so this is their only notice that the release they contributed
    # to has a docs PR at all.
    no_impact = content.get("no_docs_impact")
    tags = []
    if isinstance(no_impact, list):
        for entry in no_impact:
            # Accepts a plain login or a {"login": ...} object, so a
            # composer reusing the reviewer shape still renders.
            if isinstance(entry, dict):
                login = str(entry.get("login") or "").strip()
            else:
                login = str(entry or "").strip()
            if login:
                tags.append(reviewer_tag(login, login_to_slack_id))
    if tags:
        lines.append("")
        lines.append(
            "*FYI* {} - {}".format(" ".join(tags), NO_IMPACT_SUFFIX)
        )

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
