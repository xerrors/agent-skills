# Product Showcase Design Constraints

Use this reference for product updates, version releases, changelog summaries, and mature open-source product decks. Read `gpt-taste` completely before visual implementation when that skill is available, then apply the rules below to deterministic static cards.

## Pre-flight

Before writing UI code, record a short design plan that verifies:

- Product identity, title hierarchy, typography stack, grid structure, and screenshot placement.
- Main headings stay within 2-3 lines without shrinking below the minimum size.
- Grids have no empty cells or accidental dead areas.
- Meta labels, decorative eyebrow phrases, footer slogans, redundant chips, and filler badges are absent.
- Interactive motion is excluded from PNG export views unless a specific final frame is explicitly defined.

## Information Hierarchy

Use this order:

1. Product/repository logo + product name + version.
2. One main title.
3. One subtitle when context is needed.
4. Body content, screenshots, diagrams, or feature explanations.
5. At most one necessary supporting note tied to a screenshot, source, compatibility warning, or next action.

Do not add labels such as `FEATURE 03`, `MORE IMPROVEMENTS`, `重点更新 02`, or `小更新总览`. Page numbers are allowed because they provide navigation rather than decoration.

## Chinese and English Typography

Chinese is the primary reading language. Use a CJK-first stack such as:

```css
font-family: "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
```

Use Geist, Helvetica Neue, or a system sans stack for English, Latin numbers, and UI controls. Use SFMono-Regular, JetBrains Mono, or Consolas only for code and terminal output.

- Do not apply wide positive letter spacing to Chinese text.
- Use `word-break: keep-all` and balanced manual line breaks for Chinese headlines.
- Keep English product names and protocol terms intact; do not split a Latin word across lines.
- A mixed Chinese/English headline should be sized for the Chinese rhythm first. English terms may be slightly smaller only when optical alignment requires it.
- Avoid all-caps English decoration. Use English only when it is the actual product, command, protocol, model, or API name.

## Minimum Readable Sizes for 1080x1440 Cards

- Cover/main title: `72-96px`.
- All non-cover page titles: one fixed size, recommended `64-72px`; do not vary by page type.
- Subtitle/lead: `28-36px`.
- Body and screenshot-reading bullets: `28-32px`.
- Supporting note, page number, card description: `28px` or larger.
- Code/terminal: `20-24px`.

Except for code and terminal output, do not use text below `28px` in the designed card UI. Text inside a real product screenshot is exempt, but the screenshot should be large enough that its important evidence remains understandable.

Never solve wrapping by repeatedly shrinking text. Widen the text region, shorten the copy, use a deliberate line break, or change the layout first.

Overview, feature, minor-update, compatibility, and closing cards are peers. Their main titles must share the same font size, line-height, and weight throughout one deck.

## Grid and Spacing

- Portrait cards (`3:4`, `4:5`, `9:16`) must use a vertical reading flow. Never use a desktop-style main split with copy on the left and a screenshot on the right. Stack title, context, data/features, and screenshot from top to bottom.
- Side-by-side copy/media layouts are reserved for landscape canvases. Small peer items may still form a complete grid inside one vertical section.
- Use explicit columns and rows. Verify the occupied cell count equals the available cell count.
- Use `grid-auto-flow: dense` for variable-span bento layouts.
- Prefer 3-5 meaningful modules on a feature page. A summary page may use 6 evenly sized items when the grid is exactly `2x3` or another complete arrangement.
- Avoid large unexplained empty corners. Negative space should separate hierarchy, not reveal an unfinished grid.
- Keep a consistent outer safe area of roughly `64-80px` for 1080x1440 exports.

## Visual Style

- Use restrained technical colors with one primary accent and one highlight accent.
- Keep backgrounds quiet enough for Chinese text to dominate.
- Use square outer cards. Inner screenshots and functional panels may use a modest radius.
- Use real screenshots as evidence. Do not cover screenshots with decorative labels.
- Every reserved screenshot frame must have an aspect ratio between `16:9` and `9:16`, inclusive. Do not create extremely wide strips or extremely tall slits. Use `aspect-ratio`, crop with `object-fit`, or change the surrounding grid.
- Use repository/product icons from `resources/icons/` instead of recreating them ad hoc.

## Code Simplicity

- Define colors, typography sizes, spacing, and borders as CSS variables.
- Build reusable primitives for product identity, title, subtitle, body text, supporting note, screenshot frame, and dense grid.
- Remove unused markup and unused CSS. Do not hide obsolete labels or footers with override rules when they can be deleted.
- Avoid per-card inline styles. Use one semantic modifier class when a layout genuinely differs.
- Keep export behavior deterministic and separate preview-only controls from card content.
- Prefer a small amount of direct HTML/CSS/JS over a framework when the artifact is a standalone card workbench.

## Replaceable Screenshots

- In preview mode, every screenshot or image placeholder should be clickable and open a local file picker.
- Accept PNG, JPEG, WebP, and GIF. Replace the selected image immediately and use it in subsequent PNG export.
- Keep replacement data session-scoped by default; do not store large data URLs in local storage.
- Disable selection behavior in export mode.
- Reuse `resources/image-picker.js` or an equivalent concise implementation. Give replaceable images an obvious hover state without adding permanent decorative labels.

## Final Sweep

- Read every card at preview scale, not only at 1080px.
- Verify that the smallest designed text is readable.
- Confirm the title is at most 3 lines and does not contain awkward single-character wraps.
- Confirm Chinese title line-height is approximately `1.08-1.18`; avoid both collision and loose poster-like leading.
- Confirm no decorative meta label or footer slogan remains.
- Confirm every screenshot has a reason to exist and every card has one dominant idea.
- Confirm clicking each replaceable screenshot opens the picker and the selected image appears in export.
