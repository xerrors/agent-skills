# Framework 说明

Framework 是发布素材项目的稳定运行层。它使用 Node.js 内置模块启动工作台，调用本机 Chrome 导出 PNG，调用 ffmpeg 合成完整视频，不依赖前端打包器或运行时 npm 依赖。

## 生成项目结构

```text
launch/
├── package.json
├── launch.config.json
├── <story-id>-cards.html
├── framework/
│   ├── server.js
│   ├── framework.js
│   ├── framework.css
│   ├── export-cards.js
│   └── render-video.js
├── theme/
│   ├── DESIGN.md
│   ├── <theme-name>.css
│   └── 主题资源
├── assets/
│   ├── images/
│   └── audios/
├── previews/
└── video/
```

项目生成后是自包含目录。后续修改 Skill 不会自动改变已经生成的项目，避免发布中的项目被框架升级意外破坏。

## 配置

`launch.config.json` 是 framework 的唯一项目配置入口：

```json
{
  "entry": "product-v1-cards.html",
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
    "audio": "assets/audios/background.mp3",
    "volume": 0.2,
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
- `POST /api/export/png`：导出全部 PNG。
- `POST /api/export/video`：合成整套视频。

直接用 `file://` 打开 HTML 时可以临时预览和替换图片，但浏览器无法写回文件；需要持久化时必须启动工作台。

## PNG 导出

```bash
npm run export:png
```

导出器使用 Chrome headless 逐张访问 `?export=1&card=N`，输出到 `cards.outputDirectory`。macOS 默认查找 Google Chrome；其他位置通过 `CHROME_BIN` 指定。

## 视频导出

```bash
npm run export:video
```

视频以已导出的 PNG 为输入，按照 `secondsPerCard` 依次拼接。默认每张 4 秒、30 fps、H.264、YUV420P。配置音频后，ffmpeg 会循环背景音乐至视频结束，并应用音量及首尾淡入淡出。

背景音乐属于项目资源，应放在 `assets/audios/`。网页上传会自动完成复制、试听和配置写入，也可以手动复制文件并设置 `video.audio`。

## 环境要求

- Node.js 18 或更高版本。
- Google Chrome 或兼容 Chromium，用于 PNG 导出。
- ffmpeg 与 ffprobe，用于视频导出和验证。

## 边界

Framework 提供静态卡片序列视频，不定义主题视觉，也不负责复杂的逐元素动画。需要复杂动画时，可以将 theme 的视觉规范复用到独立 Remotion 工程，但不要把 Remotion 变成所有主题的默认依赖。
