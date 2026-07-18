---
name: product-launch-card-kit
description: 为应用、开源项目、Agent Skill、插件、开发者工具或版本更新制作发布素材。适用于小红书图文卡片、产品发布卡、可交互 HTML 工作台、PNG 批量导出、发布文案、整套视频和背景音乐等需求。采用稳定的 Node.js framework 与可替换 theme 架构。
---

# 产品发布素材工具箱

把产品资料、版本说明和截图整理为一套可编辑、可预览、可导出的发布工程。默认产物包括 HTML 工作台、竖版卡片、发布文案、PNG 图片和整套 MP4 视频。

## 核心模型

- `framework` 负责稳定能力：Node.js 服务、卡片导航、图片与音频上传、音频试听、文案复制、PNG 导出和视频合成。
- `theme` 负责表达规则：信息层级、卡片结构、组件优先级、颜色、字体、间距、截图方式和文案语气。
- `animates` 提供可替换的参考缓入动画；生成时复制为项目的 `theme/animate.css`。
- 生成项目中的 `framework/` 默认是指向本 Skill `resources/framework/` 的软链接，不是独立副本。
- 不在 theme 中重复实现上传、导出、服务器或视频逻辑；不在 framework 中写具体产品的视觉风格。

开始工作前阅读 [framework 说明](references/framework.md)。新增或修改主题时，再阅读 [主题制作规范](references/theme-authoring.md) 和所选主题的 `DESIGN.md`。

## 共享 Framework 安全规则

- 把生成项目中的 `framework/` 视为 Skill 源文件入口。修改其中任何文件，实际都会修改本 Skill 的 `resources/framework/`，并立即影响所有指向它的项目。
- 一般内容制作、模板调整和主题修改不得改动 `framework/`。优先修改项目 HTML、theme、assets 和配置。
- 用户没有明确要求修改共享 framework 时，不允许修改其中的代码。
- 确实需要修改时，必须先明确告知用户：“这会修改 product-launch-card-kit Skill 的 framework 源文件，并影响所有软链接项目”，取得明确确认后才能动手。
- 生成项目后，必须如实报告 `framework/` 是软链接、链接到哪里，以及项目不再是完全自包含工程；不得把它描述为独立 framework 副本。

## 主题选择

### `product-showcase`

用于成熟产品、开源项目、版本发布和功能升级，尤其适合依靠真实截图、功能变化、命令流程和兼容性提醒建立可信度的内容。使用前阅读 `resources/themes/product-showcase/DESIGN.md`。

如果现有主题不适合内容类型，创建新 theme，不复制 framework。每个主题至少包含：

- `DESIGN.md`
- `<theme-name>.css`
- `<theme-name>-template.html`

## 标准工作流

1. 阅读产品 README、版本说明、代码和已有截图，提炼一个明确发布角度。
2. 根据内容类型选择 theme；产品或版本发布默认使用 `product-showcase`。
3. 用生成器创建项目。生成器会把 `framework/` 软链接到当前 Skill 源目录，并在控制台和 `launch.config.json` 中记录：

```bash
node scripts/create-project.js \
  --out /absolute/path/to/launch \
  --theme product-showcase \
  --story-id product-v1 \
  --project-name 产品名 \
  --version v1.0
```

4. 修改生成项目中的 HTML 文案和卡片结构，使用真实产品截图替换占位图。
5. 新项目默认包含 `assets/audios/default.mp3` 和 `theme/animate.css`。默认动画仅供参考，可根据内容调整速率、曲线、距离和时间。
6. 在项目目录运行 `npm run serve`，通过网页上传图片和背景音乐；音频上传后可以立即试听，并会写入视频配置。
7. 检查卡片层级、文字溢出、截图裁切、缓入节奏和发布文案。
8. 运行 `npm run export:png` 导出全部卡片和带时间戳的 ZIP，再运行 `npm run export:video` 用同一份 CSS 动画逐帧合成视频。默认每张卡片停留 4 秒。
9. 用图片尺寸检查和 `ffprobe` 验证 PNG、视频时长、分辨率、帧率与音轨。

## 内容原则

- 一张卡片只承担一个主要信息任务。
- 产品名、版本、核心变化和真实证据要尽早出现。
- 功能说明必须与截图、命令、数据或可验证行为对应。
- 默认提供标题备选、推荐标题、正文和话题标签，并放在工作台可复制区域。
- 不为了凑页数制造弱内容；卡片数量由主题 HTML 中的 `.launch-card` 自动识别。
- 标准视频通过 Chrome 在确定时间点推进 `theme/animate.css` 并捕获真实帧，保证网页预览与视频使用同一动画来源。
- 默认 CSS 缓入及其视频采样参数是参考实现，不应被描述为唯一正确节奏；允许按品牌和内容调整。

## 质量检查

- 工作台能启动，卡片导航和文案复制正常。
- 图片上传后刷新页面仍保留，PNG 使用替换后的图片。
- 音频能上传、播放试听，并写入 `launch.config.json`。
- 新项目包含默认音频和 `theme/animate.css`，切换卡片时元素缓入正常，减少动态偏好下不会产生明显运动。
- 每张 PNG 为配置尺寸，默认 1080×1440。
- 视频包含全部卡片，默认每张 4 秒，背景音乐音量和淡入淡出符合配置。
- theme 只包含表达与样式，不包含 framework 业务代码。

叙事角度参考 `references/story-patterns.md`。
