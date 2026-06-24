#!/usr/bin/env python3
"""Generate Markdown PR reports for xerrors/Yuxi using GitHub CLI."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from typing import Any


DEFAULT_REPO = "xerrors/Yuxi"
CST = timezone(timedelta(hours=8))

PR_FIELDS = [
    "number",
    "title",
    "url",
    "state",
    "isDraft",
    "author",
    "headRefName",
    "baseRefName",
    "mergeable",
    "mergeStateStatus",
    "reviewDecision",
    "statusCheckRollup",
    "latestReviews",
    "comments",
    "commits",
    "reviewRequests",
    "createdAt",
    "updatedAt",
]

LIST_FIELDS = [
    "number",
    "title",
    "url",
    "author",
    "headRefName",
    "baseRefName",
    "isDraft",
    "reviewDecision",
    "mergeStateStatus",
    "statusCheckRollup",
    "updatedAt",
]

REVIEW_LABELS = {
    "APPROVED": "approved",
    "CHANGES_REQUESTED": "changes requested",
    "REVIEW_REQUIRED": "review required",
    "COMMENTED": "commented",
    "DISMISSED": "dismissed",
}


def run_gh(args: list[str], *, allow_fail: bool = False) -> subprocess.CompletedProcess[str]:
    cmd = ["gh", *args]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    except FileNotFoundError:
        print("Error: GitHub CLI `gh` is not installed or not on PATH.", file=sys.stderr)
        sys.exit(2)

    if result.returncode != 0 and not allow_fail:
        print(result.stderr.strip() or result.stdout.strip(), file=sys.stderr)
        sys.exit(result.returncode)
    return result


def gh_json(args: list[str]) -> Any:
    result = run_gh(args)
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        print(f"Error: could not parse gh JSON output: {exc}", file=sys.stderr)
        sys.exit(2)


def parse_time(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(CST)
    except ValueError:
        return None


def fmt_time(value: str | None) -> str:
    dt = parse_time(value)
    if not dt:
        return value or "unknown"
    return dt.strftime("%Y-%m-%d %H:%M CST")


def format_review(value: str | None) -> str:
    decision = (value or "").upper()
    return REVIEW_LABELS.get(decision, decision.lower() if decision else "unknown")


def format_state(pr: dict[str, Any]) -> str:
    state = (pr.get("state") or "unknown").lower()
    return f"{state} / draft" if pr.get("isDraft") else state


def author_name(value: Any) -> str:
    if isinstance(value, dict):
        return value.get("login") or value.get("name") or "unknown"
    return "unknown"


def truncate(text: str | None, limit: int = 180) -> str:
    if not text:
        return ""
    clean = " ".join(text.split())
    if len(clean) <= limit:
        return clean
    return clean[: limit - 1].rstrip() + "..."


def summarize_checks(checks: Any) -> tuple[str, list[str]]:
    if not isinstance(checks, list) or not checks:
        return "unavailable", []

    failing: list[str] = []
    pending = 0
    passing = 0

    for check in checks:
        name = check.get("name") or check.get("context") or "unnamed check"
        conclusion = (check.get("conclusion") or "").upper()
        state = (check.get("state") or "").upper()
        status = (check.get("status") or "").upper()
        signals = {conclusion, state, status}
        if signals & {"SUCCESS", "PASSED", "NEUTRAL", "SKIPPED"}:
            passing += 1
        elif signals & {"FAILURE", "FAILED", "ERROR", "CANCELLED", "TIMED_OUT", "ACTION_REQUIRED"}:
            failing.append(name)
        elif signals & {"COMPLETED"}:
            passing += 1
        else:
            pending += 1

    if failing:
        visible = ", ".join(failing[:3])
        if len(failing) > 3:
            visible += f", +{len(failing) - 3} more"
        status = f"failing: {visible}"
    elif pending:
        status = "pending"
    else:
        status = "passing"
    return status, failing


def latest_activity_items(pr: dict[str, Any], *, limit: int = 3) -> list[str]:
    fallback_time = datetime.min.replace(tzinfo=CST)
    items: list[tuple[datetime, str]] = []

    for item in (pr.get("commits") or [])[-8:]:
        commit = item.get("commit") if isinstance(item, dict) else {}
        authored = commit.get("authoredDate")
        oid = (commit.get("oid") or "")[:7]
        message = commit.get("messageHeadline") or commit.get("message") or "commit"
        items.append(
            (
                parse_time(authored) or fallback_time,
                f"- Commit: `{oid}` {truncate(message, 90)} ({fmt_time(authored)})",
            )
        )

    for review in (pr.get("latestReviews") or [])[-8:]:
        submitted = review.get("submittedAt")
        state = format_review(review.get("state"))
        body = truncate(review.get("body"), 90)
        suffix = f" - {body}" if body else ""
        items.append(
            (
                parse_time(submitted) or fallback_time,
                f"- Review: {state} by {author_name(review.get('author'))} ({fmt_time(submitted)}){suffix}",
            )
        )

    for comment in (pr.get("comments") or [])[-8:]:
        created = comment.get("createdAt")
        body = truncate(comment.get("body"), 110)
        items.append(
            (
                parse_time(created) or fallback_time,
                f"- Comment: {author_name(comment.get('author'))} ({fmt_time(created)}): {body}",
            )
        )

    items.sort(key=lambda item: item[0], reverse=True)
    return [text for _, text in items[:limit]]


def next_action(pr: dict[str, Any], check_status: str, failing_checks: list[str]) -> str:
    if pr.get("isDraft"):
        return "Draft PR: decide whether it is ready for review, then mark it ready when appropriate."
    if failing_checks:
        return "Fix failing checks before merging: " + ", ".join(failing_checks[:3])
    decision = (pr.get("reviewDecision") or "").upper()
    if decision == "CHANGES_REQUESTED":
        return "Address requested changes and ask reviewers to re-review."
    if decision in {"", "REVIEW_REQUIRED"}:
        requests = pr.get("reviewRequests") or []
        if requests:
            reviewers = ", ".join(author_name(r.get("requestedReviewer")) for r in requests if isinstance(r, dict))
            return f"Waiting for review from: {reviewers or 'requested reviewers'}."
        return "Review is still required."
    if check_status == "pending":
        return "Wait for checks to finish."
    if decision == "APPROVED" and check_status == "passing":
        merge_state = (pr.get("mergeStateStatus") or "").lower()
        if merge_state in {"behind", "blocked", "dirty", "unstable"}:
            return f"Resolve merge blocker before merging: `{merge_state}`."
        return "Looks merge-ready from visible review and CI signals."
    return "Check review status and CI before taking action."


def print_pr_report(pr: dict[str, Any], *, repo: str) -> None:
    check_status, failing_checks = summarize_checks(pr.get("statusCheckRollup"))

    print("## PR Status")
    print(f"- PR: [#{pr.get('number')} {pr.get('title')}]({pr.get('url')})")
    print(f"- State: {format_state(pr)}")
    print(f"- Review: {format_review(pr.get('reviewDecision'))}")
    print(f"- Checks: {check_status}")
    print(f"- Updated: {fmt_time(pr.get('updatedAt'))}")
    print()

    activity = latest_activity_items(pr)
    if activity:
        print("## Latest Activity")
        for item in activity:
            print(item)
        print()

    print("## Next Action")
    print(next_action(pr, check_status, failing_checks))


def print_overview(prs: list[dict[str, Any]], *, repo: str) -> None:
    print("## Open PRs")
    print(f"- Count: {len(prs)}")
    print()

    if not prs:
        print("No open PRs.")
        return

    fallback_time = datetime.min.replace(tzinfo=CST)
    sorted_prs = sorted(
        prs,
        key=lambda pr: parse_time(pr.get("updatedAt")) or fallback_time,
        reverse=True,
    )

    for pr in sorted_prs:
        check_status, _failing_checks = summarize_checks(pr.get("statusCheckRollup"))
        state = "draft; " if pr.get("isDraft") else ""
        print(
            f"- [#{pr.get('number')} {pr.get('title')}]({pr.get('url')})"
            f": {state}"
            f"review {format_review(pr.get('reviewDecision'))}; "
            f"checks {check_status}; "
            f"updated {fmt_time(pr.get('updatedAt'))}"
        )


def current_pr(repo: str) -> dict[str, Any] | None:
    result = run_gh(
        ["pr", "view", "--repo", repo, "--json", ",".join(PR_FIELDS)],
        allow_fail=True,
    )
    if result.returncode != 0:
        return None
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return None


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Yuxi PR status reports.")
    parser.add_argument("mode", choices=["current", "overview", "pr"], nargs="?", default="overview")
    parser.add_argument("--repo", default=DEFAULT_REPO)
    parser.add_argument("--number", type=int)
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()

    if args.mode == "current":
        pr = current_pr(args.repo)
        if pr:
            print_pr_report(pr, repo=args.repo)
            return
        print("No branch-associated current PR found. Falling back to open PR overview.")
        print()
        prs = gh_json(
            [
                "pr",
                "list",
                "--repo",
                args.repo,
                "--state",
                "open",
                "--limit",
                str(args.limit),
                "--json",
                ",".join(LIST_FIELDS),
            ]
        )
        print_overview(prs, repo=args.repo)
        return

    if args.mode == "pr":
        if not args.number:
            print("Error: `pr` mode requires --number <pr-number>.", file=sys.stderr)
            sys.exit(2)
        pr = gh_json(
            [
                "pr",
                "view",
                str(args.number),
                "--repo",
                args.repo,
                "--json",
                ",".join(PR_FIELDS),
            ]
        )
        print_pr_report(pr, repo=args.repo)
        return

    prs = gh_json(
        [
            "pr",
            "list",
            "--repo",
            args.repo,
            "--state",
            "open",
            "--limit",
            str(args.limit),
            "--json",
            ",".join(LIST_FIELDS),
        ]
    )
    print_overview(prs, repo=args.repo)


if __name__ == "__main__":
    main()
