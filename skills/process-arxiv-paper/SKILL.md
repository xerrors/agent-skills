---
name: process-arxiv-paper
description: Process a specific arXiv or arXiv-like research paper, especially in Chinese. Use when a paper title, project name, arXiv ID/URL/PDF/HTML link, or existing paper folder is paired with intent such as 整理, 处理, 收录, 读一下, 看一下, 翻译, 逐句翻译, 论文库, arxiv source, 源码对齐, or 源码伪代码. The workflow saves PDF/source, writes a faithful sentence-by-sentence Chinese Markdown translation, records alphaxiv context, discovers linked code, adds clearly marked code-informed pseudocode notes, and writes uv/demo/evaluation setup notes. Do not use for simple PDF download/copy requests, generic literature surveys, arXiv search lists, submission checklists, unrelated table extraction, or unrelated GitHub/uv refactors.
---

# Process arXiv Paper

## Trigger interpretation

When the user asks in Chinese to `整理一下`, `处理一下`, `读一下`, or otherwise broadly process an arXiv paper, treat that as a request for the full workflow in this skill unless they explicitly ask for a summary-only or no-translation output. A faithful sentence-by-sentence Chinese Markdown translation is a required deliverable, not an optional add-on.

Hard requirement: for any paper-processing request in Chinese, including but not limited to `整理`, `收录`, `处理`, `读`, `看`, `分析`, `梳理`, `研究`, `翻译`, `总结一下这篇论文`, or simply giving a paper title/URL in a research-paper context, the default deliverable MUST include a faithful sentence-by-sentence Chinese translation of the full paper. Do not substitute a summary, outline, "整理稿", reading note, or selective translation for the full sentence-by-sentence translation. Only skip or reduce the translation if the user explicitly says they do not want translation, only want a summary, or asks for a different scope. If the user asks for both "整理" and other outputs, complete the full Chinese sentence-by-sentence translation first or make it the central artifact, then add analysis/notes around it.

## Defaults

Use these paths unless the user specifies different ones:

- Paper outputs: `./<arxiv-prefix>[.<venue>].<short-name>` under the current working directory (`pwd`) where the user invoked the task. Treat the current working directory as the paper workspace root, not the directory where this skill is installed.
- Source-code clones: `~/Downloads/<arxiv-prefix>[.<venue>].<short-name>` by default. If `~/Downloads` does not exist but `~/downloads` does, use `~/downloads/<arxiv-prefix>[.<venue>].<short-name>` instead.

Prefer filenames like:

- PDF: `<arxiv-prefix>[.<venue>].<short-name>_<full-title>.pdf`
- Chinese translation: `<arxiv-prefix>[.<venue>].<short-name>_zh.md` and begin it with the alphaxiv URL plus an overview block when available
- arXiv source package: `<arxiv-prefix>[.<venue>].<short-name>_source/`
- Source clone directory: `~/Downloads/<arxiv-prefix>[.<venue>].<short-name>` or `~/downloads/<arxiv-prefix>[.<venue>].<short-name>`

For `2509.22009` and "GraphSearch", use `2509.GraphSearch` as the prefix when no venue is known. Sanitize filenames for macOS and keep the paper's full title in the PDF filename.

Terminology: "arXiv source package" means the paper's LaTeX/source files downloaded from `https://arxiv.org/e-print/<id>` and stored under `<prefix>_source/` inside the paper output directory. "Source code" means the paper's linked implementation repository and belongs under `~/Downloads` or `~/downloads`, not inside the paper output directory.

Prefix rules:

- Derive `<arxiv-prefix>` from the arXiv ID year-month, e.g. `2407` for `2407.12345` and `2509` for `2509.22009`.
- Derive `<short-name>` from the paper title, project name, or repository name using a short readable PascalCase token such as `GraphSearch`, `DiffusionForPlanning`, or `AgentMemory`. Prefer an established project/repo name when the paper has one.
- If the final venue is discovered after output files already exist, treat the venue-aware prefix as a rename operation rather than creating a second paper workspace.
- Ensure the source-code clone directory never resolves to the same path as the paper output directory. If the default clone path would collide, use `~/Downloads/<prefix>-code` or ask the user before cloning.

## Output directory safety check

Before downloading or creating paper outputs, inspect the current working directory with `pwd` and decide whether it is an appropriate paper workspace root.

- Safe by default: a project, notes, research, papers, or similar working directory selected by the user; any directory that already contains one or more processed-paper folders.
- A processed-paper folder is a sibling directory that looks like an arXiv paper workspace, for example a name matching `<yymm>.<short-name>` or `<yymm>.<VENUE>.<short-name>`, or a directory containing generated files such as `*_zh.md`, `*_source/`, or an arXiv PDF.
- Unsafe by default: the user's home directory (`~`), filesystem roots, system/application/config directories, broad buckets such as Desktop, Documents, or Downloads when they are not clearly being used as a paper workspace, and any unrelated source-code repository or app project that does not already contain similar processed-paper folders.
- If the current directory is unsafe or ambiguous and it does not contain similar processed-paper folders, ask the user to confirm or provide a different paper workspace directory, then stop. Do not download the PDF, create the paper output folder, or clone source code until the user confirms.
- If the current directory is unsafe or ambiguous but already contains similar processed-paper folders, proceed and save the new paper output as a sibling folder in that current directory.

## Existing work and resume behavior

When the user asks to continue, resume, rename, repair, or finish an already processed paper, inspect the existing folder before changing anything.

- Look for existing files such as `<prefix>_zh.md`, `<prefix>_translation_progress.md`, `<prefix>_source/`, downloaded PDFs, companion notes, and any source-code clone with the same prefix.
- Infer the current state from the files: completed sections, pending sections, parsing source used, whether alphaxiv metadata is present, and whether source-code notes or uv instructions already exist.
- Continue from the first incomplete or suspicious section instead of retranslating completed sections by default. If existing translation quality is clearly broken, explain the issue and repair the affected section rather than silently overwriting the whole file.
- When a user asks to rename after a venue is found, perform the rename only after confirming the venue from reliable sources. Rename generated paper files and generated source package folders together; preserve user-created notes unless they obviously contain generated paths or generated headings with the old prefix.
- If the existing state is unclear, write or update a progress marker before doing more work so the next run can resume safely.

## Venue-aware naming

- Look up whether the arXiv paper has a final or accepted publication venue such as a conference, workshop, journal, or journal abbreviation. Check arXiv metadata, the PDF/source, project pages, author pages, OpenReview/ACL Anthology/IEEE/ACM/Springer/ScienceDirect pages, and other reliable scholarly indexes when needed.
- If a venue is found, insert a short venue token after the arXiv year-month prefix: `<yymm>.<VENUE>.<short-name>`. Examples: `2509.ACL2026.GraphTemp` for a conference, `2509.PR.GraphTemp` for the journal Pattern Recognition.
- Prefer the canonical venue acronym plus year for conferences and workshops, e.g. `ACL2026`, `ICLR2026`, `NeurIPS2026`, `COLM2025`. Prefer a standard journal abbreviation without year for journals, e.g. `PR`, `TKDE`, `TNNLS`, unless the user asks otherwise.
- If the venue cannot be found quickly or is only an unverified rumor, omit the venue token and keep `<yymm>.<short-name>`. Briefly note that no final venue was found.
- When renaming an existing processed paper after discovering a venue, rename the paper output directory under the current working directory, the source-code clone directory under `~/Downloads` or `~/downloads` if it exists, and files whose names start with the old prefix. Do not rewrite arbitrary user-created notes unless the old prefix appears in obvious generated paths or headings.

## Workflow

1. Resolve the paper to the canonical arXiv abstract page.
   - If the user gives an arXiv URL or ID, normalize it to `https://arxiv.org/abs/<id>`.
   - If the user gives a title or project name, search the web/arXiv and verify the match by title, authors, abstract, and project/repository links. Do not guess if multiple plausible papers remain; ask a concise clarification.
   - If the user says "this paper", "这个 paper", "这个 repo", or gives only a local repository without enough information to identify a paper, inspect nearby README/project metadata when available. If the paper cannot be identified confidently, ask for the arXiv URL, title, or paper link before creating outputs.
   - Record the arXiv ID, full title, authors, abstract URL, PDF URL, source package URL, HTML URL, and final/accepted venue if found.

2. Download and save the original paper.
   - Download the PDF from `https://arxiv.org/pdf/<id>` into the paper outputs folder.
   - Try to download the arXiv source package from `https://arxiv.org/e-print/<id>` into a dedicated `<prefix>_source/` folder. Treat this as the preferred parsing source when it is available and contains TeX/LaTeX files.
   - Unpack the source package carefully into that dedicated source folder. It may be a `.tar`, `.tar.gz`, gzip-compressed TeX file, or another arXiv-supported source payload. Do not unpack it over unrelated files.
   - Preserve the full arXiv title in the filename.
   - Reuse an existing matching PDF only when it clearly matches the same arXiv ID/title.

3. Produce the Chinese Markdown translation.
   - Prefer the arXiv LaTeX source package as the primary parsing source when it is available. Parse the main `.tex` file(s), bibliography files, included sections, figure paths, captions, tables, algorithms, equations, labels, and cross-references so the translation preserves the paper's structure and figure information as faithfully as possible.
   - When using LaTeX source, resolve common TeX commands and included files enough to reconstruct reading order. Preserve figure references and embed or link local figure assets in the Markdown when the source package includes image files. Copy or reference those images from the dedicated source folder rather than inventing placeholder figures.
   - When the translation Markdown embeds local images, use paths relative to `<prefix>_zh.md` by default, for example `![Figure 1](./<prefix>_source/figures/example.png)` or `![Figure 1](./<prefix>_source/assets/example.png)`. Do not write absolute filesystem paths in the translation unless the user explicitly asks for them.
   - For long papers, use permitted delegation or subagents for translation chunks when the active runtime and user instructions allow it. The main agent remains responsible for preparing clean source chunks, giving strict formatting instructions, reviewing returned translations, and merging them into the final Markdown. If delegation is unavailable or disallowed, translate section-by-section locally and clearly preserve the full sentence-by-sentence requirement.
   - If the LaTeX source is unavailable, incomplete, generated in a way that is harder to parse than the rendered page, or missing critical readable content, use the arXiv HTML page (`https://arxiv.org/html/<id>`) as the source for structure, headings, equations, tables, figures, captions, references, and links.
   - If neither LaTeX source nor HTML is available or sufficiently complete, extract from the PDF with the best local PDF processing tool available. In the PDF-only path, explicitly preserve captions, figure callouts, tables, equations, references, and section ordering as much as extraction allows, and note any unavoidable image/table limitations.
   - Save a faithful Chinese translation as Markdown in the paper outputs folder. The translation must be a sentence-by-sentence Chinese translation of the original paper, not a summary, paraphrase, rewrite, outline, "整理稿", reading note, or selective extraction.
   - Translate every sentence in order. Each source sentence must have a corresponding Chinese sentence or paragraph that preserves its meaning; do not combine multiple original paragraphs into a high-level summary, omit "less important" sentences, or replace full passages with bullet-point takeaways.
   - The translation file should be the primary Chinese artifact and should be named `<prefix>_zh.md`. If a separate summary/analysis is useful, save it as a companion file or clearly separate it after the full translation, never instead of the full translation.
   - Translate one section at a time for long papers. Complete each section before moving to the next so the output stays aligned with the original and avoids omissions.
   - Keep every original section, subsection, paragraph, caption, list, table, equation, citation, and reference item in order. Do not delete, merge, reorder, or simplify original content.
   - Normalize LaTeX line wrapping before translation. In raw LaTeX, a single newline usually reflects source formatting rather than a rendered paragraph break; treat blank lines (`\n\n`) or explicit structural commands as the real paragraph boundaries. Merge wrapped source lines before sending text to the translation subagent.
   - Preserve rendered paragraph boundaries in the Markdown. Do not introduce new paragraphs just because the TeX source wrapped lines. Keep separate paragraphs only when the original rendered paper has a real paragraph boundary, list item, caption, table row, displayed equation, or section/subsection break.
   - Preserve all formulas and tables completely. Tables in the final translation MUST use standard Markdown table syntax whenever the table is rectangular enough to represent that way. Do not emit raw HTML table tags such as `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`, `<th>`, or stray HTML captions for normal paper tables. If a table cannot be represented faithfully as a normal Markdown table, rewrite it into a clear Markdown-native structure such as a list plus aligned code block, and explicitly note the limitation.
   - Remove pure LaTeX bookkeeping commands and artifacts from the final Markdown. Do not keep commands such as `\label{...}`, `\ref{...}`, `\eqref{...}`, `\tag{...}`, `\nonumber`, `\bibliographystyle`, `\bibliography`, or similar source-only control markup unless a literal command is itself being discussed as paper content. Resolve cross-references into readable text instead of exposing raw LaTeX labels.
   - Reconstruct math formatting thoughtfully instead of mechanically copying extraction artifacts. Use inline math for single symbols and short expressions such as `$q$`, `$\mathcal{G}$`, or `$\pi_{\text{ref}}$`. Use display math only for full standalone equations, aligned equations, cases, optimization objectives, or recurrences.
   - Never use nested math-delimiter/code patterns such as `$`code`$`, `$`c`$`, or other backtick-inside-math wrappers in the final Markdown. If the content is math, write it as plain math like `$c$`. If the content is code or an identifier rather than math, use plain backticks like ``code`` without surrounding `$...$`.
   - Hard Markdown math rule: in the final Markdown, inline math MUST use `$...$` and standalone displayed equations MUST use `$$ ... $$`. Never emit fenced code blocks such as ```math ... ``` for equations. For example, write:
     `$$
     R = \\operatorname{topK}(\\{(s_i, \\operatorname{overlap}(s_i, T)) \\mid s_i \\in S\\})
     $$`
     instead of a fenced code block.
   - Preserve figure captions and references to figures. Include the actual images whenever they are present in the LaTeX source package or arXiv HTML and can be referenced locally or by stable URL. When embedding local images in the translation Markdown, prefer relative paths rooted at the translation file's directory, not absolute filesystem paths. Only omit embedded images when using the PDF-only path or when extraction is genuinely unavailable; in that case, preserve the captions and clearly note the limitation.
   - Do not rewrite any paper claims. Mark translator notes or code-informed additions explicitly as added notes, for example `> 译注：...`.
   - For long papers, keep a lightweight progress marker in `<prefix>_translation_progress.md` or a clearly labeled section at the end of the draft translation. Record completed sections, pending sections, the parsing source used, and known extraction issues. Update or remove this marker when the final translation is complete. This prevents a partial long-paper translation from being mistaken for a finished deliverable after context switches or interruptions.

4. Write the alphaxiv URL or overview into the translation header.
   - Use `https://www.alphaxiv.org/zh/overview/<id>`.
   - At the start of `<prefix>_zh.md`, add a short metadata block that includes the alphaxiv URL.
   - If the site exposes readable overview content, place a clearly labeled alphaxiv overview section immediately after that metadata block near the top of `<prefix>_zh.md`.
   - If the site blocks scraping or the overview is not accessible, still record the alphaxiv URL at the start of `<prefix>_zh.md` and briefly note that the overview could not be fetched.
   - Do not create standalone `<prefix>_alphaxiv.md` or `<prefix>_alphaxiv.url` files.

5. Discover and clone source code when the paper links to it.
   - Check the arXiv abstract page, HTML page, PDF text, author/project pages, and Papers with Code/GitHub links.
   - Clone the repository into `~/Downloads/<arxiv-prefix>[.<venue>].<short-name>` by default, or `~/downloads/<arxiv-prefix>[.<venue>].<short-name>` if that lowercase directory exists and `~/Downloads` does not. Do not clone source code into the paper outputs folder.
   - If the clone directory already exists, inspect it and update only when that is safe and clearly desired by the user. Never overwrite user changes.
   - If no source repository can be found, state that explicitly in the final answer.

6. Use source code to augment the translation.
   - Read the repository README, dependency files, examples, scripts, configs, and key entry points.
   - Identify the algorithmic pieces that correspond to the paper.
   - First complete the faithful translation of the relevant original section. Only after the original passage has been translated, insert code-informed pseudocode notes immediately after the relevant paragraph, equation, algorithm, or subsection.
   - Mark every inserted explanation clearly as non-original content, for example `> 译注：下面是结合源码补充的伪代码解释。` Then use a normal fenced code block such as ```text or ```python for the pseudocode.
   - Keep pseudocode close to the original concept it explains instead of placing all notes at the end, unless the mapping is broad or uncertain. Do not interrupt a sentence or alter the original translated paragraph; add the note after the translated block.
   - Do not change the translated original content to make it say something the paper did not say. If the code and paper diverge, explicitly say so in the译注.
   - If subagents/delegation are available and permitted by the active system instructions, delegate the source-code interpretation and pseudocode mapping to a subagent. Otherwise complete this analysis locally.

7. Write usage and UV startup notes.
   - In the Chinese Markdown translation or a clearly named companion section/file, summarize how to run the project with `uv`.
   - Include dependency setup, suggested `uv venv`/`uv sync`/`uv pip install -e .` commands as appropriate to the repo, demo or evaluation commands, required datasets, model/API credentials, environment variables, and any expected outputs.
   - Distinguish confirmed instructions from inferred instructions. If the repo lacks `pyproject.toml` or first-class `uv` support, explain the safest inferred `uv` workflow instead of pretending it is official.

8. Verify outputs before finishing.
   - Confirm the PDF and Chinese Markdown exist in the paper outputs folder.
   - Confirm the paper output directory and source-code clone directory are distinct paths.
   - Confirm which parsing source was used: arXiv LaTeX source, arXiv HTML, or PDF extraction. If LaTeX source was skipped, record why. If images were omitted, record why.
   - Confirm that the Chinese Markdown is a full sentence-by-sentence translation, not merely a summary or structured notes. Before finalizing, spot-check at least the abstract, introduction, method section, experiments/results section, limitations/ethics if present, and references/appendix handling against the source. If any section is only summarized or omitted, continue translating and do not report the workflow as complete.
   - Confirm no stale progress marker says sections are still pending. If the translation is intentionally incomplete because the user asked to stop early, say that clearly and do not describe it as complete.
   - Confirm that paragraph boundaries in the Chinese Markdown match the rendered paper rather than raw LaTeX line wrapping.
   - Confirm that `<prefix>_zh.md` starts with the alphaxiv URL and that no standalone alphaxiv artifact file was created.
   - Confirm the source clone location, or explain why no repository was cloned.
   - In the final response, report the saved file paths and any unresolved caveats.

## Tooling Notes

- Browse the web for current arXiv, alphaxiv, and repository information; these sources can change.
- Prefer structured sources and official pages: arXiv abstract/source/HTML/PDF, the paper's linked repository, and official project pages. For translation extraction, the priority order is arXiv LaTeX source first, arXiv HTML second, and PDF processing tools last.
- For large translations, work in sections and save incrementally. Keep Markdown readable rather than trying to mirror every HTML artifact exactly. When delegating sections to a translation subagent, send normalized paragraph blocks instead of raw wrapped LaTeX lines.
- When normalizing math for Markdown output, convert displayed equations to `$$ ... $$` blocks and inline expressions to `$...$`. Do not use fenced code blocks with `math` info strings in the final deliverable.
- For tables, prefer clean Markdown tables with corrected headers over source-faithful HTML dumps. If extraction produces malformed headers, duplicated caption rows, or incorrect column labels, fix them before saving the translation instead of preserving the broken structure.
- Strip source-only LaTeX artifacts such as `\label{...}` from the final Markdown, and never mix inline code ticks into math delimiters such as `$`c`$`.
- In generated Markdown, prefer portable relative links for local assets, especially figure/image references. The translation should remain movable within the paper output folder without breaking image rendering.
- Do not use hard-coded personal absolute paths for paper outputs or source-code clones. Paper outputs belong in a new processed-paper folder under the current working directory after the safety check passes. Source-code clones belong under `~/Downloads` or `~/downloads`.
