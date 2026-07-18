# Theme 制作规范

Theme 是发布素材的表达层。同一 framework 可以承载产品版本发布、教程、案例复盘、品牌故事等不同类型的 theme。

## 最小目录

```text
resources/themes/<theme-name>/
├── DESIGN.md
├── <theme-name>.css
└── <theme-name>-template.html
```

可以额外包含 SVG、字体或其他只属于该主题的静态资源。生成器会把这些资源复制到项目的 `theme/` 目录。

## DESIGN.md

使用中文说明：

- 主题适用和不适用的内容类型。
- 信息层级和推荐卡片顺序。
- 可使用组件及其优先级。
- 画布、网格、间距、字体、颜色和截图规则。
- 文案语气、标题长度和信息密度。
- 视频节奏建议，但不实现导出逻辑。

设计文件应描述稳定决策，不记录某一次项目的具体产品文案。

## HTML 模板

模板必须：

- 引用 `framework/framework.css`、`theme/<theme-name>.css` 和 `framework/framework.js`。
- 每张卡片使用 `.launch-card`；当前卡片由 framework 添加 `.is-active`。
- 保留 framework 所需的 `data-launch-*`、`data-export-*`、`data-copy-target` 和 `data-audio-*` 接口。
- 使用 `{{STORY_ID}}`、`{{PROJECT_NAME}}`、`{{VERSION}}`、`{{CARD_PREFIX}}` 作为生成变量。
- 可替换图片必须是真实 `<img data-replaceable-image>`，并提供可访问的初始 `src` 和明确 `alt`。每个独立替换槽位必须使用不同的初始 `src`；复用同一占位 SVG 时可使用 `placeholder.svg?slot=cover` 这样的查询标识。
- 把标题、正文、标签等发布文案放在可见侧栏，不隐藏在脚本常量中。

Theme 可以改变卡片内部结构，但不能复制或改写图片上传、音频上传、文案复制、PNG 导出和视频导出代码。

## CSS

Theme CSS 只负责 `.launch-card` 内部和主题专属组件。工作台外壳、工具栏、侧栏、缩放、按钮和提示由 `framework.css` 管理。

建议把品牌变量集中在 `:root`：

```css
:root {
  --theme-ink: #102128;
  --theme-paper: #f4f8f7;
  --theme-primary: #087f86;
  --theme-highlight: #c9f35a;
}
```

竖版卡片默认采用从上到下的阅读路径。避免把桌面网站的左右分栏直接压进 3:4 画布；同级模块可以使用网格，但不能破坏标题、解释、证据的顺序。

## 新主题检查

1. 用 `create-project.js --theme <theme-name>` 成功生成项目。
2. 页面包含至少一张 `.launch-card`，卡片数量与配置一致。
3. 所有占位图都能点击上传并在刷新后保留。
4. 文案复制、音频上传与试听正常。
5. PNG 导出尺寸正确，卡片无溢出。
6. 视频包含所有页面，视觉切换和背景音乐节奏合理。
7. 主题目录没有服务器或导出实现。
