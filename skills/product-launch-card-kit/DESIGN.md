# Product Launch Card Design System

This document is the design contract for product updates, changelog decks, and version-release cards. Read `gpt-taste` before visual implementation, then apply the static-card adaptations below.

## Design Direction

- Treat release cards as editorial information pages, not decorative posters.
- Use product/repository identity, one main title, one optional subtitle, body evidence, and at most one necessary supporting note.
- Remove eyebrow phrases, redundant module labels, filler chips, and footer slogans.
- Use a restrained technical palette, quiet backgrounds, real screenshots, and square outer cards.

## Portrait Composition

- `3:4`, `4:5`, and `9:16` cards use a top-to-bottom narrative.
- Never use a desktop-style copy-left/screenshot-right main layout on portrait cards.
- Stack title → context → data/features → screenshot.
- Small peer modules may use a complete internal grid, but the main reading path remains vertical.
- Screenshot reservations must remain between `16:9` and `9:16`, inclusive.

## Typography

- Chinese is the primary language. Use PingFang SC, Noto Sans CJK SC, or Microsoft YaHei.
- Use Geist or Helvetica Neue for English and numbers; use SFMono-Regular or JetBrains Mono only for code.
- Except for code and terminal output, designed card text is at least `28px` on a 1080×1440 card.
- Code and terminal output may use `20-24px`.
- Cover titles may use `72-96px`.
- Every non-cover card uses one identical main-title size, line-height, and weight; recommended `64-72px`, `1.08-1.18`, weight `900`.
- Never shrink a title for a denser feature page. Edit copy, line breaks, or layout instead.

## Screenshot Workbench

- Card screenshots are clickable in preview mode.
- Clicking opens a local image picker accepting PNG, JPEG, WebP, or GIF.
- The selected image replaces the current screenshot immediately and participates in PNG export.
- Replacements are session-scoped by default; do not write large data URLs to local storage.
- Disable the picker in export mode so deterministic capture is unaffected.

## Implementation

- Use shared CSS variables and reusable identity, title, body, note, screenshot, and dense-grid primitives.
- Keep preview controls separate from exported card content.
- Remove unused markup and CSS instead of hiding obsolete elements.
- Prefer concise standalone HTML/CSS/JS and deterministic export behavior.
- Use `references/product-showcase-design.md` for detailed checks and `resources/product-showcase-tokens.css` for reusable primitives.

## Final Review

- Inspect every card at preview scale.
- Confirm all non-cover titles are identical in scale.
- Confirm ordinary text is at least 28px.
- Confirm portrait pages have no main left/right split.
- Confirm screenshot frames use allowed ratios and each screenshot supports the page’s dominant idea.
- Confirm image replacement works before export.
