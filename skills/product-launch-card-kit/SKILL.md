---
name: product-launch-card-kit
description: Create a complete social launch kit for an app, open-source project, agent skill, plugin, developer tool, or small product. Use this skill whenever the user asks for Xiaohongshu/小红书 launch posts, social media cards, publishable HTML, PNG export cards, product launch copy, titles, captions, hashtags/tags, or asks to turn a product story into a screenshot-ready deck. The default deliverable is a single HTML workbench that shows the card deck, can download/export publishable PNGs, and contains copyable titles, body text, and tags.
argument-hint: [project-or-product-to-launch]
---

# Product Launch Card Kit

Use this skill to turn a product, repo, agent workflow, or feature into a publishable social launch package. The normal output is not just copy and not just images: it is a self-contained HTML workbench where the user can preview cards, download PNGs, and copy the title/body/tags directly.

## Default Deliverables

Create these files unless the user asks for a different format:

- `launch/<story-id>-cards.html`: the main HTML workbench.
- `launch/assets/`: copied or generated screenshots and visual assets.
- `launch/previews/<story-id>-card-01.png` ...: exported card PNGs.
- Optional `launch/<story-id>-notes.md`: positioning, story options, and revision notes when the launch strategy is still evolving.

The HTML workbench should include:

- A 1080x1440 card deck, optimized for screenshot/Png export.
- Prev/Next controls, dot navigation, keyboard navigation, and a current-card counter.
- A `PNG` download button that downloads the pre-exported PNG for the active card.
- A publish copy panel containing title options, the recommended title, body text, tags/topics, and a full post bundle.
- Copy buttons for each text block.
- Clear paths and filenames that are easy for the user to replace with their own screenshots.

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
   - Mix text-only explanation cards with real product screenshots.
   - Prefer actual project screenshots over abstract placeholders. When assets are missing, leave obvious replaceable placeholders and tell the user what to capture.

4. Build the HTML workbench.
   - Start from `templates/xiaohongshu-workbench.html` when useful.
   - Keep each card at 1080x1440 in export mode.
   - In preview mode, scale and center the card in a narrow stage so the user can inspect it comfortably.
   - Avoid rounded outer card corners when the user wants clean screenshots. Inner screenshots may keep modest radii.
   - Place image captions where they remain readable. For dark screenshots, use light caption pills; for light screenshots, use dark caption pills.
   - Put publishing copy in the same HTML page, below or beside the deck, with copy buttons.

5. Export PNGs.
   - Prefer deterministic browser export over client-side canvas screenshots. Use `scripts/export-cards.js` or an equivalent Chrome/Playwright command.
   - Export each card with `?export=1&card=N` at `1080x1440`.
   - After export, wire the HTML `PNG` button to the pre-exported current-card PNG.
   - Verify all PNGs are the expected dimensions.

6. Write launch copy.
   - Provide 3-5 title options and mark one recommended title.
   - Write a platform-appropriate body: short paragraphs, concrete product positioning, one clear CTA.
   - Provide tags/topics as a copyable block.
   - Include a full-post block that combines recommended title, body, and tags.

7. Iterate visually.
   - Re-open the HTML or generated PNGs after meaningful layout changes.
   - Check text overflow, image cropping, caption readability, and whether the product name appears at the right moment.
   - When the user gives page-by-page feedback, preserve the story structure and revise only the requested pages unless a downstream layout fix is clearly needed.

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

The final HTML should expose copyable text blocks directly in the page:

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

## Bundled Resources

- `templates/xiaohongshu-workbench.html`: starter HTML workbench with card navigation, PNG links, and copyable publish text.
- `scripts/export-cards.js`: Chrome-based PNG exporter for `?export=1&card=N`.
- `references/story-patterns.md`: reusable launch story patterns.
- `examples/taskr-story-1/`: a worked example based on the Taskr launch deck.

## Quality Bar

Before finishing, verify:

- The HTML opens locally without a build step.
- The active card can be switched and the `PNG` button points to the matching exported image.
- Each exported PNG is 1080x1440.
- The publish copy is visible in the HTML and can be copied.
- Image captions are readable against their screenshots.
- No missing local image paths remain.
- The final answer gives the user the HTML path and the previews directory.

