# Product Showcase Preferences

Use these preferences when the user asks for a mature product, open-source project, or version release introduction deck, especially for Xiaohongshu cards. Recommend the `templates/xiaohongshu-product-showcase.html` template when the work is more product promotion than opinion output.

## Design Direction

- Prefer a restrained, bright, technical product-launch style over dark, flashy, or overly decorative layouts.
- Treat version releases and product updates as information pages: one product identity, one main title, one subtitle, then body content and only necessary supporting notes.
- Header identity should be a real product/repository logo when available plus product name and version. Do not show a redundant page-type label such as “小更新总览” or “重点更新 03”.
- Remove decorative English labels, eyebrow text, micro-slogans, and repeated product chips. Keep only real product terms, proper nouns, versions, protocol names, or factual labels the reader needs to understand the content.
- Use large, confident Chinese titles with normal system fonts. Avoid flamboyant English typography.
- Keep cards clean: no left/top color block decorations, no unnecessary ornamental sidebars.
- Use modest radius consistently: screenshots and CTA cards can use `12px`; outer export cards stay square.
- Use a balanced palette with teal/ink/lime accents on a light technical grid background. Do not let the whole deck become one-note dark blue/purple/beige.

## Cover Preferences

- For product release covers, make the product identity (logo + product name + version) the first-viewport signal, followed by one large title and one subtitle.
- Do not place a release-status eyebrow or decorative tagline above the title. A version is part of the product identity, not a separate visual hook.
- Include secondary metrics only when they materially help judge the release; do not use them as decorative header blocks.
- If license matters, use an explicit `MIT License` badge/chip rather than vague "open source" copy.
- If a hero image is available, reserve a stable 16:9 area and place the real image there. Preserve a clean crop and avoid placeholder copy once the asset exists.
- Highlight 1-2 critical positioning phrases in the cover description, for example `知识库` or `多租户 Harness`.

## Feature Page Preferences

- Feature pages should have a consistent two-line title rhythm. If one line is too short, add a few words so both lines feel balanced.
- Put 2-3 keyword highlights per feature page. Use one consistent highlight style; do not over-highlight.
- Put screenshot interpretation directly below the screenshot as a factual supporting note on portrait cards. Do not place the main explanation beside the screenshot, turn it into a detached footer slogan, or show both a caption and a keyword/footer bar.
- Keep screenshot annotations/captions below screenshots. Never overlap annotations on top of screenshots unless the user explicitly asks.
- Preserve original screenshot aspect ratio. Use `object-fit: contain`; do not crop product UI screenshots.
- Add a small radius to screenshots, normally `12px`.
- Feature bullets should read like screenshot interpretation, not generic capability marketing. Keep them concise and visually even.

## Overview / Upgrade Map

- For a version-upgrade overview page, prefer an 8-cell grid:
  - `0.7 Beta` or the version card occupies the upper-left two cells.
  - Update items 01/02 occupy the upper-right cells.
  - Update items 03/04 occupy the lower-left cells.
  - Update items 05/06 occupy the lower-right cells.
- Give each update item a similar amount of text. Avoid a mix where some descriptions are one short line and others wrap awkwardly.
- Use fixed row heights and explicit grid placement so the visual order is stable.

## CTA / Final Page

- Avoid overly direct third-party-platform wording when the target platform may penalize obvious traffic diversion.
- Prefer discussion-oriented wording: "欢迎在评论区一起讨论需求、经验和踩坑。"
- If mentioning a repository, keep it subtle, for example a small `xerrors/Yuxi` chip rather than a large "go star" command.
- Do not add a generic bottom CTA or a decorative repository/version chip merely to fill empty space. Keep it only when it gives the reader a meaningful next step or a factual reference.
- Avoid repeated sentence openings such as two consecutive "如果".

## Copy Pitfalls

- Do not use "不是……而是……" unless the user asks for a contrast. Prefer direct positioning.
- Avoid "正式发布" for beta/open-source release decks unless the user explicitly says it is a formal release.
- Remove unsupported future integrations from the deck if the user asks to focus only on currently supported sources.
