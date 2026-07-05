---
name: product-launch-card-kit
description: Create a social launch kit for an app, open-source project, agent skill, plugin, developer tool, or small product. Use for Xiaohongshu/小红书 launch posts, social media cards, video covers, animated launch openings, publishable HTML, PNG export cards, product launch copy, titles, captions, hashtags/tags, or turning a product story into a screenshot-ready deck. Default output is one HTML workbench with card navigation and a visible copywriting panel; cover design starts with HTML preview and exports PNG/MP4 only when needed. Use Remotion for production video/opening generation.
---

# Product Launch Card Kit

Use this skill to turn a product, repo, agent workflow, or feature into a publishable social launch package. The normal output is not just copy and not just images: it is a self-contained HTML workbench where the user can preview cards, download PNGs, and copy title candidates, body text, and tags directly from a visible side panel.

## Default Deliverables

Create these files for Xiaohongshu card decks unless the user asks for a different format:

- `launch/<story-id>-cards.html`: the main HTML workbench.
- `launch/assets/`: copied or generated screenshots and visual assets.
- `launch/previews/<story-id>-card-01.png` ...: exported card PNGs.
- Optional `launch/<story-id>-notes.md`: positioning, story options, and revision notes when the launch strategy is still evolving.

The HTML workbench should include:

- A 1080x1440 card deck, optimized for screenshot/Png export.
- Prev/Next controls, dot navigation, keyboard navigation, and a current-card counter.
- A `PNG` download button that downloads the pre-exported PNG for the active card.
- A visible publish copy panel containing title candidates, recommended title, body text, tags/topics, and a full post bundle.
- Copy buttons for each text block inside the panel.
- Placeholder image blocks in the reusable template. Each placeholder must describe what screenshot/image should be placed there, what it should show, and any crop/orientation requirements. Do not bundle real project images into the generic template.

For cover-design work, default to a preview-first deliverable:

- `launch/<story-id>-covers.html`: a single HTML page showing the cover concepts and aspect-ratio variants.
- `launch/assets/`: copied or generated screenshots and visual assets.
- Optional `launch/previews/`: exported PNGs or MP4s only after the user asks for export or approves a variant.

Do not export cover PNGs by default. Use the HTML page to show the design first, then export PNGs only when needed.

## Product Showcase Mode

Use product showcase mode when the launch object is a mature product, open-source project, beta/version release, or feature upgrade where the goal is to introduce product capabilities rather than publish an opinion-led narrative. In this mode, recommend starting from `templates/xiaohongshu-product-showcase.html` and follow `references/product-showcase-preferences.md`.

Product showcase mode works best for:

- Version releases such as `0.7 Beta`, `v1.0`, or major feature updates.
- Open-source project promotion with metrics such as stars, daily ranking, license, or update cadence.
- Decks where screenshots are central evidence and each page should explain a concrete feature.
- Mature products where the cover should signal product identity, positioning, and release status immediately.

Product showcase defaults:

- Use a bright, restrained technical style rather than a dramatic dark or editorial style.
- Cover: product name + version badge + release status + 16:9 hero image area + compact metrics.
- Overview: use an 8-cell upgrade map when there are around 6 update points; let the version card occupy the upper-left two cells.
- Feature pages: use two-line titles, 2-3 keyword highlights, concise screenshot-reading bullets, and one footer-style screenshot interpretation.
- Final page: prefer discussion-oriented copy over direct platform-diversion CTAs when publishing to Xiaohongshu.

## Cover Design Mode

Use cover design mode when the user asks for a video cover, launch cover, thumbnail, poster-like first frame, or an opening frame for a launch video. The cover is not the same artifact as the Xiaohongshu first card: a Xiaohongshu homepage card usually belongs to a multi-card story deck, while a video cover must work as a standalone first-frame signal in a player, feed, or upload thumbnail.

Create four aspect-ratio versions unless the user asks for fewer:

- Horizontal: `16:9`.
- Horizontal: `4:3`.
- Vertical: `9:16`.
- Vertical: `3:4`.

Cover design requirements:

- Put the product, release, or object identity in the first-viewport signal, not only in small nav text.
- Treat each ratio as its own layout, not a crop of one master canvas.
- Keep titles short enough to read at thumbnail size.
- Use actual product screenshots, generated bitmap visuals, or concrete UI assets when available.
- Avoid relying on long body text; reserve detail for captions or the launch post.
- Show all variants in one HTML preview page with clear ratio labels, preferably in a responsive workbench/grid.
- Default to HTML preview only. Export PNGs after the user selects a variant or explicitly asks for files.

## Video Opening Mode

Use video opening mode when the user asks for an animated cover, 4-5s launch opener, intro video, MP4, or motion version of a cover. Production video should be made with Remotion, especially when the user asks for MP4 export or deterministic animation.

Video opening requirements:

- Use Remotion for the production composition and MP4 export.
- Define composition dimensions explicitly, usually `1920x1080` for `16:9`, and match requested aspect ratios for other outputs.
- Use `useCurrentFrame()`, `interpolate()`, `spring()`, `Sequence`, and `Easing` for animation timing.
- Do not rely on CSS transitions or CSS animations inside Remotion compositions; they are not reliable for deterministic rendering.
- Place assets in the Remotion `public/` folder and reference them with `staticFile()`.
- Make the final frame work as a standalone video cover.
- If exploring visual direction, it is fine to create an HTML preview first; convert the approved direction into Remotion before producing video.
- For MP4 delivery, render and verify at least one mid-frame and one final-frame still, then check duration, resolution, fps, and frame count with `ffprobe`.

## Workflow

1. Understand the launch object.
   - Identify what is being launched: repo, app, skill, plugin, workflow, tool, or feature.
   - Ask only when a missing answer would materially change the story. Otherwise infer from README, screenshots, code, docs, and conversation context.
   - Capture target platform. Default to Xiaohongshu/小红书 when the user mentions cards, 图文, screenshots, or tags.

2. Find the story angle.
   - Pick one main hook. Good hooks include: pain point, timely debate, workflow shift, before/after, founder build log, niche user fit, or concrete result.
   - Avoid a thin "I made a tool that does X" narrative. Tie the product to a problem users already feel.
   - Keep the product name visible once the story turns from problem to solution.
   - If using a trend or public discussion, use it as context without overclaiming or forcing a stance.

3. Design the card sequence.
   - Default to 6-9 cards. Eight cards works well for Xiaohongshu.
   - Use one idea per card. Make each card screenshot-worthy on its own.
   - Mix text-only explanation cards with product screenshot slots.
   - In a concrete project output, prefer actual project screenshots over abstract placeholders. In the reusable template, use descriptive placeholders only.
   - When assets are missing, leave obvious replaceable placeholders that say what to capture, for example `PLACEHOLDER: Board screenshot showing status columns and task cards`.
   - If the request is for covers rather than a card deck, design four ratio-specific cover variants: `16:9`, `4:3`, `9:16`, and `3:4`.

4. Build the HTML workbench.
   - Start from `templates/xiaohongshu-workbench.html` when useful.
   - For mature product/version release decks, start from `templates/xiaohongshu-product-showcase.html` and apply `references/product-showcase-preferences.md`.
   - Keep each card at 1080x1440 in export mode.
   - In preview mode, scale and center the card in a narrow stage so the user can inspect it comfortably.
   - Avoid rounded outer card corners when the user wants clean screenshots. Inner screenshots may keep modest radii.
   - Place image captions where they remain readable. For dark screenshots, use light caption pills; for light screenshots, use dark caption pills.
   - Put publishing copy in a visible side panel on wide screens, with copy buttons.
   - On narrow screens, stack the card preview first and the copy panel below it.
   - For cover design, build one HTML preview page that displays the four aspect ratios. Do not export PNGs at this stage unless asked.

5. Export PNGs.
   - Prefer deterministic browser export over client-side canvas screenshots. Use `scripts/export-cards.js` or an equivalent Chrome/Playwright command.
   - Export each card with `?export=1&card=N` at `1080x1440`.
   - After export, wire the HTML `PNG` button to the pre-exported current-card PNG.
   - Verify all PNGs are the expected dimensions.
   - Skip this step for cover-design previews unless the user asks for PNG output or selects a final variant.

6. Create video openings when requested.
   - Use Remotion for production video. Scaffold or reuse a Remotion project, define a composition for the requested ratio and duration, and animate with Remotion frame APIs.
   - Keep the opening around the requested length, commonly 4-5 seconds for a launch opener.
   - Render MP4 only after the visual direction is ready, then verify the output metadata.

7. Write launch copy.
   - Provide 3-5 title options and mark one recommended title.
   - Write a platform-appropriate body: short paragraphs, concrete product positioning, one clear CTA.
   - Provide tags/topics as a copyable block.
   - Include a full-post block that combines recommended title, body, and tags.

8. Iterate visually.
   - Re-open the HTML or generated PNGs after meaningful layout changes.
   - Check text overflow, image cropping, caption readability, and whether the product name appears at the right moment.
   - When the user gives page-by-page feedback, preserve the story structure and revise only the requested pages unless a downstream layout fix is clearly needed.
   - For video openings, inspect mid-frame and final-frame stills as well as playback metadata.

## Xiaohongshu Defaults

- Card size: 1080x1440.
- Card count: 8 unless the story needs fewer or more.
- Tone: concrete, conversational, build-in-public, slightly editorial.
- Title: curiosity or pain-point first.
- Body: short paragraphs with a crisp summary line.
- Tags: include the product category, target users, platform names, and project type.

Suggested deck structure:

1. Pain hook or timely debate.
2. Context: why the old way is not enough.
3. Product framing or key distinction.
4. How the product works.
5. Real product screenshot.
6. Workflow/detail screenshot.
7. Who it is for and not for.
8. Install/try link, GitHub/repo screenshot, and call to action.

## Copy Panel Requirements

The final HTML should expose copyable text blocks in a visible panel beside or below the card preview:

- `标题备选`
- `推荐标题`
- `正文`
- `话题标签`
- `完整发布文案`

Use a small copy button beside each block. Browser clipboard APIs are fine; include a fallback that selects text if clipboard write fails.

## Export Notes

Use the bundled script like this:

```bash
node skills/product-launch-card-kit/scripts/export-cards.js \
  --html /absolute/path/to/launch/story-cards.html \
  --out /absolute/path/to/launch/previews \
  --prefix story-card \
  --cards 8
```

If Chrome is not in the default macOS location, set `CHROME_BIN`:

```bash
CHROME_BIN="/path/to/chrome" node skills/product-launch-card-kit/scripts/export-cards.js --html ... --out ...
```

For cover-design HTML previews, do not run the PNG exporter by default. Use browser screenshots or the exporter only after the user requests PNG output.

For video openings, use Remotion for the render pipeline. A typical workflow is:

```bash
npx remotion still <composition-id> --frame=60
npx remotion render <composition-id> launch/previews/<story-id>-opening.mp4
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration,nb_frames -of default=noprint_wrappers=1 launch/previews/<story-id>-opening.mp4
```

## Bundled Resources

- `templates/xiaohongshu-workbench.html`: starter HTML workbench with card navigation, PNG links, a visible copywriting panel, and descriptive image placeholders.
- `templates/xiaohongshu-product-showcase.html`: product/version release showcase template with cover hero image, compact metrics, 8-cell upgrade map, screenshot feature pages, and a discussion-oriented final card.
- `scripts/export-cards.js`: Chrome-based PNG exporter for `?export=1&card=N`.
- `references/story-patterns.md`: reusable launch story patterns.
- `references/product-showcase-preferences.md`: design and copy preferences for mature product/open-source release decks.
- `examples/taskr-story-1/`: a worked example based on the Taskr launch deck.

## Quality Bar

Before finishing, verify:

- The HTML opens locally without a build step.
- For card decks, the active card can be switched and the `PNG` button points to the matching exported image when PNGs were exported.
- For exported card PNGs, each file is 1080x1440.
- For cover design, the HTML preview includes `16:9`, `4:3`, `9:16`, and `3:4` variants unless the user requested a subset.
- For cover design, no PNG export is required unless the user asked for it.
- For video openings, the production render uses Remotion and the final MP4 metadata matches the requested duration, ratio, resolution, and fps.
- The copywriting panel is visible in the HTML, contains title candidates, body copy, and tags, and each block can be copied.
- The generic template contains only descriptive image placeholders, not real project images.
- Image captions are readable against their screenshots in concrete generated outputs.
- No missing local image paths remain.
- The final answer gives the user the HTML path and the previews directory.
