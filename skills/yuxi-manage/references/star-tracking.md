---
name: yuxi-manage-star-tracking-reference
description: Star tracking reference for yuxi-manage: fetch real-time xerrors/Yuxi data, generate trend charts, and support scheduled reports.
category: github
---

# Yuxi Star Tracking Reference

监控 xerrors/Yuxi 项目的 GitHub Star 增长趋势，生成图表并发送定时报告。

## 快速使用

### 手动查看 Star

```bash
# 获取实时 Star 数（需要代理）
curl -s -x http://127.0.0.1:7890 "https://api.github.com/repos/xerrors/Yuxi" | python3 -c "import sys,json; print(json.load(sys.stdin)['stargazers_count'])"
```

### 生成趋势图

```bash
python3 scripts/yuxi_stars_report.py
```

输出：
- 终端打印近 7 天 Star 汇总（日期 / 累计 / 当日新增 / 柱状图）
- 图片保存到 `/tmp/yuxi_stars_chart.png`
- 末尾 `IMAGE:/tmp/yuxi_stars_chart.png` 标记用于 Hermes 自动发送

## 核心规则

### 时区：北京时间 (CST, UTC+8)

- 所有日期按**北京时间 24:00** 切分
- 当天（未过完）数据显示截至报告生成时的**实时数量**，标注 `← real-time`

### 图表样式

| 属性 | 值 |
|------|-----|
| 比例 | 4:3（12×9 英寸） |
| 主题 | 亮色（背景 `#f8f9fa`，文字 `#2d3436`） |
| 折线 | 蓝色 `#0984e3`，线宽 3，圆点标记 |
| 柱状 | 珊瑚色 `#e17055`，当天金色 `#fdcb6e` |
| 数字标注 | 蓝底白字气泡（累计），柱顶显示当日增量 |
| 网格 | 浅灰虚线 `#dfe6e9` |
| 标题 | `xerrors/Yuxi - Stars Growth (Beijing Time)` |
| 图例 | 左上角，白底灰边 |

### 数据获取

- **GitHub API**：`https://api.github.com/repos/xerrors/Yuxi`
- **Stargazers API**：`https://api.github.com/repos/xerrors/Yuxi/stargazers?per_page=100&page=N`（需 `Accept: application/vnd.github.v3.star+json` 头）
- **代理**：`http://127.0.0.1:7890`
- 无 GitHub Token，使用匿名请求（60 次/小时限制）

## 定时任务

如需接入 Hermes，可使用以下定时任务配置：

- **名称**：`Yuxi Stars Daily Report`
- **时间**：每天早上 8:00（北京时间）
- **脚本**：`scripts/yuxi_stars_report.py` 或复制到 `~/.hermes/scripts/yuxi_stars_report.py`
- **投递**：自动发送到当前聊天

管理命令（通过 Hermes cronjob 工具）：
- 查看：`cronjob(action='list')`
- 暂停：`cronjob(action='pause', job_id='<id>')`
- 恢复：`cronjob(action='resume', job_id='<id>')`
- 手动触发：`cronjob(action='run', job_id='<id>')`

## 脚本位置

```
skills/yuxi-manage/scripts/yuxi_stars_report.py
```

运行方式：
```bash
# 直接执行（使用系统 python3）
python3 skills/yuxi-manage/scripts/yuxi_stars_report.py

# 通过 Hermes cronjob 自动执行（每天 08:00）
```

## 扩展到其他仓库

如需监控其他仓库，修改脚本顶部的 `REPO` 变量：

```python
REPO = "owner/repo"  # 替换为目标仓库
```

## Pitfalls

- **代理必须开启**：GitHub API 在国内需要代理，端口 7890
- **匿名限速**：无 Token 时 60 次/小时，正常日报不受影响，但频繁手动触发可能触限
- **Stargazers 分页**：脚本只取最后几页数据，历史超过 300 个 Star 的仓库需要调整 `pages_to_fetch`
- **当天数据不完整**：凌晨运行时当天增量可能为 0，属正常现象
- **图表覆盖**：每次生成覆盖 `/tmp/yuxi_stars_chart.png`，如需保留请复制
