[English](README.md) | 简体中文

# dsh-codex-reset-tracker

DeepSeek Harness 的 Codex 重置状态插件。它在 composer 输入区添加一个入口，打开后显示简洁的状态浮层，并注册只读智能体工具 `codex_reset`。

## 致谢

重置信号和可用译文由 [Did Codex Reset](https://didcodexreset.com/zh/) 提供。感谢其维护者收集和整理这些公开重置信号，并提供[只读 API](https://didcodexreset.com/zh/api.html) 和 [OpenAPI 规范](https://didcodexreset.com/openapi/v1/openapi.json)。本仓库将这些上游工作集成到 DSH；该 API 不包含特定账号的配额信息。

原始重置公告来自 [Tibo Sottiaux (@thsottiaux)](https://x.com/thsottiaux)。

## 截图

以下截图摄于 v0.5.1 之前，其中入口位置、文字和概率颜色仍为旧版；当前界面的行为请以下方说明为准。

| 浅色主题 | 深色主题 |
|---|---|
| <a href="assets/screenshot-light.jpg"><img src="assets/screenshot-light.jpg" alt="浅色主题" width="380"></a> | <a href="assets/screenshot-dark.jpg"><img src="assets/screenshot-dark.jpg" alt="深色主题" width="380"></a> |

## 显示内容

- composer 输入区的入口会报道原站的排期概率（例如 **≥86% 是**），并显示最近完成重置与预计下次重置时间。有有效排期时，主标题使用“接下来会有 Codex 重置吗？”。
- 概率直接取自公开 API，与原站一样四舍五入为百分比。浮层中的有效排期显示“概率 + 是”，即使概率不足 80% 或预计时间在本地明天；今天已完成的重置优先展示。排期记录仍保持排期类型，不会替换最近完成重置。“今天”按浏览器本地日历日期判断；完成时间依次使用 `completedAt`、`effectiveAt`、`announcedAt`。
- 浮层包含 Tibo Sottiaux 的来源帖子。当简体中文译文与英文原文不同时，会同时显示两者。
- 入口位于输入框下方状态栏的右侧区域；安装 auto-compact 时，紧挨其圆环左侧。入口复用浮层的排期判定：没有可报的预测时只显示图标，不显示文字；今天尚未完成重置、存在有效待执行排期，且四舍五入后的概率达到 80% 时，图标右侧空一格再显示 `≥86%`（标签即 ` ≥86%`，100% 时为 ` 100%`）；仅显示图标时，按钮左右内边距各 6px，在普通指针设备上的宽度为 28px，与 auto-compact 圆环同宽。百分比为蓝紫色，悬停或展开时颜色不变；浮层中带概率的答案也使用相同颜色。入口不再预留额外宽度，因此图标与百分比切换时宽度会有细微变化。正常刷新期间保留上次成功获取且仍有效的预测；请求失败后回到只显示图标的状态，直到新请求成功且确认有有效预测才重新显示百分比。无障碍名称与提示仍是「Codex 重置追踪状态」。不再显示未读标记或读写未读存储。
- 语音输入插件处于录制、转写或重试状态时，宿主会暂时隐藏整个右侧状态组，包括本插件入口和 auto-compact 圆环。
- 客户端加载时请求 `/status`，之后每 10 分钟刷新一次。打开浮层、恢复前台或恢复网络时，若快照已超过 60 秒则检查更新。请求在 20 秒后超时，并遵守限流冷却时间。浮层展示本地时区与获取时间；获取时间不代表上游监测时间。智能体工具可查询状态或分页记录。
- 当“今天重置了吗？”从否变为是时，发一条系统通知「Codex 已经重置」。通知需要浏览器授权：浮层底部提供「开启系统通知」按钮，点击后才会申请权限；被拒绝或不受支持时只是不发通知。按近期完成记录 ID 去重，同一记录同时出现在 Global 与 Banked 时也只通知一次。记录保存在本地存储中，刷新页面不会重复；支持 Web Locks 的浏览器还会协调多个页面同时刷新的通知，不支持时跨页面去重为尽力而为。本地存储被阻止时，仅能在当前页面内去重。首次加载只记录基线，不补发历史通知。检测依赖上面的轮询，最多可能延迟一个轮询周期（10 分钟）。

## 从源码安装

克隆仓库，然后将其添加到 DSH 配置档案：

```sh
git clone https://github.com/loshanvren/dsh-codex-reset-tracker.git
cd dsh-codex-reset-tracker
dsh plugin --profile <profile> add .
```

自 v0.4.0 起，安装包和客户端加载器名称均为 `dsh-codex-reset-tracker`。

### 从 v0.3.x 升级

旧包名为 `dsh-codex-reset`。请先从同一个 DSH 配置档案移除旧包，再安装新包，避免旧工具和 composer 入口同时启用：

```sh
dsh plugin --profile <profile> remove dsh-codex-reset
dsh plugin --profile <profile> add https://github.com/loshanvren/dsh-codex-reset-tracker/releases/latest/download/dsh-codex-reset-tracker.tgz
```

替换后重启 DSH。如果曾手工应用安装补丁，请将包 `name` 改为 `dsh-codex-reset-tracker`，保留 `codex-reset` 行 ID 及原有 `config`，不要保留第二条旧插件记录。

### 预构建安装

```sh
dsh plugin --profile <profile> add https://github.com/loshanvren/dsh-codex-reset-tracker/releases/latest/download/dsh-codex-reset-tracker.tgz
```

发布包包含与源码安装相同的 JavaScript、清单、补丁及语言文件，无需安装期构建。

## 智能体工具

`codex_reset` 支持：

- `action: "status"` — 返回最新的全局重置与 Banked 重置信号，以及下次排期的重置。
- `action: "records"` — 返回一页记录，可按 `kind`、`page` 和 `pageSize` 筛选。

工具接受可选的 `lang` 参数，用于获取记录译文。成功响应默认缓存 60 秒。

| 配置项 | 默认值 | 用途 |
|---|---:|---|
| `apiBaseUrl` | `https://didcodexreset.com/openapi/v1` | 智能体工具使用的公开 API 基础 URL |
| `cacheTtlSeconds` | `60` | 工具响应缓存时间，可设为 5 到 3600 秒 |
| `timeoutMs` | `20000` | 工具调用超时时间，可设为 1000 到 120000 毫秒 |

可在 `cordis.patch.yml` 对应插件条目的 `config` 下覆盖这些值。公开 API 文档说明，共享限额为每个 IP 每小时 60 次请求。

## 许可证

本仓库代码适用 MIT 许可证。该许可证不对 Did Codex Reset 的数据或译文，以及 Tibo Sottiaux 的帖子和个人资料图片重新授权。
