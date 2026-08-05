---
name: multi-screen-wireframe
description: Use when creating or revising an offline multi-page wireframe, multi-screen prototype, page-flow board, desktop admin flow, or mobile app flow from product requirements or visual references.
---

# Multi-Screen Wireframe

生成可双击打开、可继续编辑和构建的 JSX 多屏线框交付物。

## 生成流程

1. 先让用户确认输出目录。不得默认覆盖现有目录。
2. 整目录复制 `starter/` 到确认路径。不要从 `demo/` 复制。
3. 先定义数据：viewport 映射、screen 列表、唯一 id、入口和唯一页面流边 `links`。
4. 只修改目标副本的 `src/screens/*.jsx`、`src/layouts/*.jsx`、`src/project.js`，以及明确需要的主题 token。
5. macOS 运行 `./build.command`；Windows x64 运行 `build.cmd`。
6. 构建成功后检查 `dist/app.js`，再双击 `index.html` 验证画布、演示、视口、导航、热区和错误隔离。
7. 需要导出时实际验证单页 PNG；多页选择实际验证 ZIP 文件数。

## 实现约束

- screen 使用标准 JSX 和 ESM import/export。不要手改 `dist/app.js`。
- 页面跳转只用 project `links` 声明；`Card`、`Button`、`Cell`、`Box`、`Row`、`Column`、`Grid`、`SideNav`、`TabBar` 使用 `to`。裸标签若只写了 `data-flow-to` 也能点（屏内委托兜底），但仍应优先用库组件。
- 移动端 / 小程序带底栏：优先 `MobileShell` + `TabBar`（或全高 Column 末尾放 `TabBar`）。禁止把 TabBar 夹在内容中间；禁止用 `position: fixed` 钉底栏。
- 默认灰黑白。图标只用方形、圆形、线框块；图片只还原外框尺寸、比例、圆角和位置。
- 不使用 emoji、Unicode 图标、语义化 SVG、在线资源或真实后端。
- 有视觉参考时，先测量 viewport、区域边界、宽高、间距、对齐、层级和圆角；按测量值写布局，不能用通用卡片大概拼版。

## 内容完整度（默认）

除非用户明确要求「单页 / 单屏 / 空态 / 少量样例」，否则按完整可演示原型生成，禁止只交一页空壳或半截流程。

- **页面流**：覆盖主路径相关屏（如列表 → 详情 → 操作确认），用 `links` 串起来；不要只做入口一屏。
- **屏内内容**：关键区域写满可演示的真实结构（标题、筛选项、操作、正文块），不要用一两行占位糊弄。
- **列表 / 表格 / Cell 组**：默认至少 **3 条** 有区分度的演示数据；在移动端或短视口上，尽量让列表区内容高度超过一屏，能滚出首屏（除非用户指定条数、空态或「不要滚动」）。
- **空态例外**：仅当需求明确是空状态时才用 `EmptyState`，且不要和已有记录叠在一起。

## 边界

- 生成任务禁止修改本 skill 的 `starter/` 和 `demo/`。
- 维护公共组件或 Board 时才修改 `starter/`，随后构建 starter 和两个 demo 并运行测试。
- `starter/AGENTS.md` 与 `starter/EDITING.md` 是交付后的编辑依据；不要要求后续编辑者重新加载源 skill。

组件、project schema 和不变量见 `reference.md`。完整覆盖示例见 `demo/order-admin` 与 `demo/claims-app`。
