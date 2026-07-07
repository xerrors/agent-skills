#!/usr/bin/env python3
"""Generate daily star growth chart for xerrors/Yuxi repository.
Uses Beijing time (CST, UTC+8) for daily cutoffs.
For incomplete current day, shows real-time data.
Uses authenticated gh CLI for reliable data fetching.
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from collections import Counter

REPO = "xerrors/Yuxi"
OUTPUT_PATH = "/tmp/yuxi_stars_chart.png"
DAYS = 7
CST = timezone(timedelta(hours=8))

def fetch_stargazers_by_gh():
    # Use gh api to fetch stargazers with pagination
    cmd = [
        "gh", "api",
        f"repos/{REPO}/stargazers",
        "--header", "Accept: application/vnd.github.v3.star+json",
        "--paginate",
        "-q", ".[].starred_at"
    ]
    # Configure proxy for subprocess just in case
    env = os.environ.copy()
    env["http_proxy"] = "http://127.0.0.1:7890"
    env["https_proxy"] = "http://127.0.0.1:7890"
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60, env=env)
    if result.returncode != 0:
        raise RuntimeError(f"gh api error: {result.stderr}")
    
    # Each line represents a starred_at timestamp
    timestamps = [line.strip() for line in result.stdout.split('\n') if line.strip()]
    return timestamps

def get_total_stars():
    cmd = ["gh", "api", f"repos/{REPO}", "-q", ".stargazers_count"]
    env = os.environ.copy()
    env["http_proxy"] = "http://127.0.0.1:7890"
    env["https_proxy"] = "http://127.0.0.1:7890"
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=15, env=env)
    if result.returncode != 0:
        raise RuntimeError(f"gh api error: {result.stderr}")
    return int(result.stdout.strip())

def main():
    try:
        total_now = get_total_stars()
    except Exception as e:
        print(f"Error getting total stars: {e}", file=sys.stderr)
        sys.exit(1)
        
    now = datetime.now(CST)

    # Current day 00:00 CST
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    # Start of the reporting window (DAYS ago at 00:00 CST)
    window_start = today_start - timedelta(days=DAYS - 1)

    # Collect all stars
    try:
        all_timestamps = fetch_stargazers_by_gh()
    except Exception as e:
        print(f"Error fetching stargazers: {e}", file=sys.stderr)
        sys.exit(1)

    all_star_times = []
    for ts in all_timestamps:
        try:
            starred_at = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            if starred_at >= window_start:
                all_star_times.append(starred_at)
        except Exception:
            continue

    # Group by CST date
    daily = Counter()
    for t in all_star_times:
        cst_date = t.astimezone(CST).strftime("%Y-%m-%d")
        daily[cst_date] += 1

    # Build date list
    dates = []
    labels = []
    new_stars = []
    for i in range(DAYS - 1, -1, -1):
        d = today_start - timedelta(days=i)
        date_str = d.strftime("%Y-%m-%d")
        weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d.weekday()]
        dates.append(date_str)

        if d.date() == now.date():
            # Today: real-time data (partial day)
            labels.append(f"{d.strftime('%m/%d')}\n{weekday}\n(now {now.strftime('%H:%M')})")
        else:
            # Past days: full day up to 24:00 CST
            labels.append(f"{d.strftime('%m/%d')}\n{weekday}")

        new_stars.append(daily.get(date_str, 0))

    # Calculate cumulative: work backwards from total_now
    cumulative = []
    running = total_now
    for i in range(len(dates)):
        if i == len(dates) - 1:
            # Today (last item): real-time total
            cumulative.append(total_now)
        else:
            # Subtract all stars from future days to get this day's end-of-day total
            future_stars = sum(new_stars[j] for j in range(i + 1, len(dates)))
            cumulative.append(total_now - future_stars)

    # Print summary
    today_new = new_stars[-1]
    week_total = sum(new_stars)
    today_hours = (now - today_start).total_seconds() / 3600

    print(f"⭐ xerrors/Yuxi Star Report")
    print(f"━━━━━━━━━━━━━━━━━━━━━━")
    print(f"Current Stars: {total_now}")
    print(f"Today ({now.strftime('%m/%d')}) new so far: +{today_new} ({now.strftime('%H:%M')}, {today_hours:.1f}h into the day)")
    print(f"Past {DAYS} days total: +{week_total}")
    print()
    for date, label, new, cum in zip(dates, labels, new_stars, cumulative):
        bar = "█" * (new // 2) if new > 0 else ""
        is_today = (date == now.strftime("%Y-%m-%d"))
        marker = " ← real-time" if is_today else ""
        print(f"  {date}  {cum:>5}  +{new:>2}  {bar}{marker}")
    print()
    print(f"IMAGE:{OUTPUT_PATH}")

    # Generate chart (light theme, 4:3 aspect ratio)
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt

    short_labels = []
    for i, d in enumerate(dates):
        dt = datetime.strptime(d, "%Y-%m-%d")
        weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][dt.weekday()]
        if d == now.strftime("%Y-%m-%d"):
            short_labels.append(f"{dt.strftime('%m/%d')}\n{weekday}\n(now)")
        else:
            short_labels.append(f"{dt.strftime('%m/%d')}\n{weekday}")

    # Light theme colors
    bg_color = '#f8f9fa'
    text_color = '#2d3436'
    grid_color = '#dfe6e9'
    color_main = '#0984e3'
    color_bar = '#e17055'
    color_realtime = '#fdcb6e'

    fig, ax1 = plt.subplots(figsize=(12, 9))  # 4:3 ratio
    fig.patch.set_facecolor(bg_color)
    ax1.set_facecolor(bg_color)

    n = len(dates)
    ax1.plot(range(n), cumulative, color=color_main, linewidth=3,
             marker='o', markersize=10, markerfacecolor='white',
             markeredgecolor=color_main, markeredgewidth=2.5, zorder=5)
    ax1.fill_between(range(n), cumulative, min(cumulative) - 20, alpha=0.1, color=color_main)

    for i, stars in enumerate(cumulative):
        ax1.annotate(f'{stars}', xy=(i, stars), xytext=(0, 18),
                     textcoords='offset points', ha='center', va='bottom',
                     fontsize=11, fontweight='bold', color='white',
                     bbox=dict(boxstyle='round,pad=0.3', facecolor=color_main,
                              edgecolor='none', alpha=0.85))

    # Color the last bar differently (real-time)
    bar_colors = [color_bar] * (n - 1) + [color_realtime]
    bar_alphas = [0.7] * (n - 1) + [0.85]

    ax2 = ax1.twinx()
    for i, (val, color, alpha) in enumerate(zip(new_stars, bar_colors, bar_alphas)):
        bar = ax2.bar(i, val, alpha=alpha, color=color, width=0.5, zorder=2)
        label = f'+{val}' if i < n - 1 else f'+{val}*'
        ax2.text(bar[0].get_x() + bar[0].get_width() / 2., bar[0].get_height() + 1,
                 label, ha='center', va='bottom', fontsize=10,
                 color=color, fontweight='bold')

    ax1.set_xticks(range(n))
    ax1.set_xticklabels(short_labels, fontsize=10, color=text_color)
    ax1.set_ylabel('Cumulative Stars', fontsize=14, color=color_main, labelpad=10)
    ax2.set_ylabel('Daily New Stars', fontsize=14, color=color_bar, labelpad=10)
    ax1.tick_params(axis='both', colors=text_color, labelsize=11)
    ax2.tick_params(axis='y', colors=color_bar, labelsize=11)
    ax1.set_ylim(min(cumulative) - 20, max(cumulative) + 40)
    ax2.set_ylim(0, max(new_stars) + 15)
    ax1.grid(True, alpha=0.5, color=grid_color, linestyle='--')
    ax1.set_axisbelow(True)

    # Spine colors
    for spine in ax1.spines.values():
        spine.set_color(grid_color)
    for spine in ax2.spines.values():
        spine.set_color(grid_color)

    plt.title(f'xerrors/Yuxi - Stars Growth (Beijing Time)',
              fontsize=18, fontweight='bold', color=text_color, pad=20)

    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, ['Cumulative Stars', 'Daily New Stars'],
               loc='upper left', fontsize=12, facecolor='white', edgecolor='#ccc')

    fig.text(0.98, 0.02,
             f'Total: {total_now} stars | * = real-time (today {now.strftime("%H:%M")} CST)',
             ha='right', va='bottom', fontsize=11, color='#888', style='italic')

    plt.tight_layout()
    plt.savefig(OUTPUT_PATH, dpi=150, facecolor=bg_color, edgecolor='none', bbox_inches='tight')

if __name__ == "__main__":
    main()
