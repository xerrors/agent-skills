# 发布卡片参考动画

`animate.css` 提供生成项目默认使用的元素缓入动画。生成器会把它复制为项目中的 `theme/animate.css`。

这套动画只是一组安全、克制的参考值，不是固定规范。可以根据品牌气质、内容密度和视频节奏调整以下变量：

- `--launch-animate-duration`：单个元素的动画时长。
- `--launch-animate-easing`：缓动曲线。
- `--launch-animate-distance`：垂直进入距离。
- `--launch-animate-stagger`：同级元素之间的延迟。

网页预览使用元素级缓入；PNG 导出会禁用动画并固定为最终状态。标准视频通过 Chrome 在确定时间点推进同一份 CSS 动画、截取真实帧，再由 ffmpeg 合成，因此网页与视频使用同一动画来源。

`launch.config.json` 中的 `animation.captureFps` 控制动画采样帧率，`animation.videoSeconds` 控制每张卡片用于播放 CSS 动画的时间。提高采样帧率会更流畅，但导出耗时和临时文件体积也会增加。

主题可以在自己的 CSS 中覆盖变量，例如：

```css
.product-showcase-card {
  --launch-animate-duration: 900ms;
  --launch-animate-easing: cubic-bezier(0.16, 1, 0.3, 1);
  --launch-animate-stagger: 110ms;
}
```

必须保留 `prefers-reduced-motion` 和导出模式的无动画规则，避免可访问性问题和 PNG 截图停留在中间帧。
