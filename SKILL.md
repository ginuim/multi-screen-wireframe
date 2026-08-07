---
name: multi-screen-wireframe
description: Use when creating or revising an offline multi-page wireframe, multi-screen prototype, page-flow board, desktop admin flow, or mobile app flow from product requirements or visual references.
version: 1.3.0
---

# Multi-Screen Wireframe

生成可双击打开、可继续编辑和构建的 JSX 多屏线框交付物。

**Skill 版本**：`1.3.0`（与仓库根目录 `VERSION`、`package.json` 保持一致；升级 skill 时三处同步 bump）。

## 生成流程

1. 先让用户确认输出目录。不得默认覆盖现有目录。
2. 整目录复制 `starter/` 到确认路径。不要从 `demo/` 复制。
3. 先定义数据：viewport 映射、screen 列表、唯一 id、入口和唯一页面流边 `links`。
4. 只修改目标副本的业务源码：`src/screens/*.jsx`、`src/layouts/*.jsx`、`src/project.js`（必要时 `src/app.jsx`、`src/styles/app.css`、`index.html` title / css link）。
5. **每个新建或改动的 `src/screens/*.jsx`、`src/layouts/*.jsx` 文件顶部必须写 skill 版本注释**（见下节）。
6. macOS 运行 `./build.command`；Windows x64 运行 `build.cmd`。
7. **交付前自检**（不通过不得交付）：见「源码齐全」与「样式落点」。
8. 构建成功后检查 `dist/app.js`，再双击 `index.html` 验证画布、演示、视口、导航、热区和错误隔离。
9. 需要导出时实际验证单页 PNG；多页选择实际验证 ZIP 文件数。

## 目录分界

```
交付根/
  framework/     # lib + styles + vendor + tools —— 升级整夹替换，生成任务禁止改
  src/           # 业务 —— 只改这里
  index.html
  build.command / build.cmd
  dist/
```

升级已有交付物：用新 starter 的 `framework/` 覆盖目标的 `framework/`，不要动 `src/`。

## 源码齐全（必须）

交付物必须可再次编辑。禁止只改 `dist/app.js`、禁止「画布能开但 `src/` 缺页」。

对 `src/project.js` 里每一个 `screens[].id`：

1. 必须存在 `src/screens/<id>.jsx`（文件名与 id 完全一致）。
2. 该文件必须 `export` project 中引用的同名组件。
3. `src/project.js` 必须从该文件 `import` 组件，并挂进 `screens` 数组。
4. 若使用 layouts：对应 `src/layouts/*.jsx` 也必须落盘，不能只在 `dist` 里出现。

构建前用目录核对：`project.screens.map(s => s.id)` 与 `src/screens/*.jsx`（除 `_template.jsx`）一一对应，缺一即失败。删屏时同步删文件并改 `project.js`。

## 样式落点（必须）

**禁止**修改 `framework/styles/prototype.css`（以及整个 `framework/`）。

业务外观只允许：

1. **优先**：JSX 内联 `style={{ ... }}`，或库组件已有 class / props。
2. **需要共享业务 CSS 时**：写 `src/styles/app.css`，并在 `index.html` 增加 `<link rel="stylesheet" href="src/styles/app.css">`。
3. 若只需改灰阶色板：在 `src/styles/app.css` 覆盖 `:root` 变量（如 `--wf-900`）。

## 版本注释（必须）

生成或修改业务页面时，在文件最顶部（`import` 之前）写如下块注释，版本号取自本 skill 当前 `version`（现为 `1.3.0`）：

```jsx
/**
 * @wireframe-skill multi-screen-wireframe@1.3.0
 * 创建基于 v1.3.0
 * 修改基于 v1.3.0
 */
```

规则：

- **新建**：`创建基于` 与 `修改基于` 都写成当前 skill 版本。
- **后续修改**：保留原有 `创建基于`；把 `修改基于` 更新为**本次使用的** skill 版本；`@wireframe-skill` 行同步为当前版本。
- 从 `_template.jsx` 复制时，保留注释块并填入真实版本，不要删掉。
- `src/project.js`、`src/app.jsx` 不强制；screens / layouts 强制。

## 实现约束

- screen 使用标准 JSX 和 ESM import/export。UI 从 `../../framework/lib/ui/index.js` 导入（layouts 同层级）。不要手改 `dist/app.js`。
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
- 生成任务禁止修改目标副本的 `framework/`、`dist/app.js`。
- 维护公共组件或 Board 时才修改 `starter/framework/`，随后构建 starter 和两个 demo 并运行测试。
- `starter/AGENTS.md` 与 `starter/EDITING.md` 是交付后的编辑依据；不要要求后续编辑者重新加载源 skill。

组件、project schema 和不变量见 `reference.md`。完整覆盖示例见 `demo/order-admin` 与 `demo/claims-app`。
