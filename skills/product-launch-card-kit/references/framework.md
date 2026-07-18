# Framework 说明

Framework 是发布素材项目的稳定运行层。它使用 Node.js 内置模块启动工作台，调用本机 Chrome 导出 PNG，调用 ffmpeg 合成完整视频，不依赖前端打包器或运行时 npm 依赖。生成项目默认通过软链接共享本 Skill 的 framework 源目录。

## 生成项目结构

```text
launch/
├── package.json
├── launch.config.json
├── <story-id>-cards.html
├── framework -> <skill>/resources/framework/
├── theme/
│   ├── DESIGN.md
│   ├── <theme-name>.css
│   ├── animate.css
│   └── 主题资源
├── assets/
│   ├── images/
│   └── audios/
│       └── default.mp3
├── previews/
└── video/
```

项目的 theme、HTML、assets、配置和导出结果位于项目目录，但 `framework/` 默认不是实体副本，而是指向 Skill 源目录的软链接。后续修改 Skill framework 会立即影响所有生成项目。

## 共享软链接与修改确认

生成器会自动创建软链接，等价于：

```bash
ln -s /absolute/path/to/product-launch-card-kit/resources/framework framework
```

必须遵守以下边界：

- 日常制作只修改项目 HTML、theme、assets 与 `launch.config.json`，不要修改 `framework/`。
- `framework/` 中的文件就是 Skill 源文件。修改会同时影响所有软链接项目。
- 用户未明确要求修改共享 framework 时，不允许修改。
- 修改前必须明确告知影响范围，并取得用户确认。
- 构建结果必须报告软链接状态与真实源路径。

软链接项目依赖本机 Skill 的绝对路径，不是完全自包含工程。跨机器移动或独立归档时，需要另外制作包含实体 framework 副本的便携版本，并明确标记该版本不再自动同步。

## 配置

`launch.config.json` 是 framework 的唯一项目配置入口，同时记录共享 framework 的链接模式和真实来源：

```json
{
  "entry": "product-v1-cards.html",
  "framework": {
    "mode": "symlink",
    "source": "/absolute/path/to/product-launch-card-kit/resources/framework",
    "sharedSource": true
  },
  "animation": {
    "stylesheet": "theme/animate.css",
    "referenceOnly": true,
    "captureFps": 20,
    "videoSeconds": 1.5
  },
  "cards": {
    "count": 6,
    "width": 1080,
    "height": 1440,
    "prefix": "product-v1-card",
    "outputDirectory": "previews"
  },
  "video": {
    "secondsPerCard": 4,
    "fps": 30,
    "audio": "assets/audios/default.mp3",
    "volume": 0.18,
    "fadeSeconds": 1,
    "output": "video/product-v1.mp4"
  }
}
```

生成器会根据主题模板中 `.launch-card` 的实际数量写入 `cards.count`。增删卡片后同步更新配置，或重新生成项目。

## 网页工作台

运行：

```bash
npm run serve
```

默认地址为 `http://127.0.0.1:8765/`。服务提供：

- `GET /api/health`：检查服务并读取配置。
- `GET /api/config`：读取项目配置。
- `GET /api/assets`：列出图片和音频。
- `POST /api/upload/image`：保存图片并更新 HTML 中对应的 `src`。
- `POST /api/upload/audio`：保存音频并更新视频配置。
- `POST /api/export/png`：导出全部 PNG，并生成带日期时间的 ZIP。
- `POST /api/export/video`：合成整套视频。

直接用 `file://` 打开 HTML 时可以临时预览和替换图片，但浏览器无法写回文件；需要持久化时必须启动工作台。

工作台工具栏保持紧凑，只显示卡片导航、导出和下载操作。卡片在工作台中默认缩小预览，导出时仍按 `cards.width` 与 `cards.height` 使用完整尺寸。

项目默认加载 `theme/animate.css`。它提供元素缓入参考值，可直接修改 CSS 变量调整速率、曲线、距离和错峰时间。PNG 导出模式会禁用动画并固定为最终状态。

## PNG 导出

```bash
npm run export:png
```

导出器使用 Chrome headless 逐张访问 `?export=1&card=N`，输出到 `cards.outputDirectory`，随后把全部 PNG 压缩为 `<prefix>-YYYYMMDD-HHmmss.zip`。网页点击“生成 PNG”会自动下载这个 ZIP，不再下载单张当前卡片。

压缩包默认位于 `previews/archives/`。macOS 默认查找 Google Chrome；其他位置通过 `CHROME_BIN` 指定。

## 视频导出

```bash
npm run export:video
```

视频直接加载项目 HTML，并通过 Chrome DevTools Protocol 暂停、推进和捕获 `theme/animate.css` 的真实动画帧，再由 ffmpeg 合成。默认每张 4 秒、30 fps、H.264、YUV420P。`animation.captureFps` 控制动画采样流畅度，`animation.videoSeconds` 控制每张卡片的动画时间。

新项目自动复制 Skill 的默认背景音乐到 `assets/audios/default.mp3` 并写入配置。网页上传会自动完成复制、试听和配置写入，也可以手动复制文件并设置 `video.audio`。

网页预览和标准视频使用同一份 CSS 动画。PNG 导出会进入无动画末帧模式。需要复杂交互、三维或长时间线时，再建立独立动画工程。

## 环境要求

- Node.js 18 或更高版本。
- Google Chrome 或兼容 Chromium，用于 PNG 导出。
- ffmpeg 与 ffprobe，用于视频导出和验证。
- `zip`，用于把全部 PNG 打包为带时间戳的压缩包。

## 边界

Framework 提供 CSS 动画逐帧捕获和标准序列视频，不定义主题视觉，也不负责复杂交互、三维或长时间线。需要更复杂动画时，可以将 theme 与 `animate.css` 的节奏规范复用到独立 Remotion 工程，但不要把 Remotion 变成所有主题的默认依赖。
