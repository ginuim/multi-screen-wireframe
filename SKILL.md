---
name: multi-screen-wireframe
description: Use when creating or revising an offline multi-page wireframe, multi-screen prototype, page-flow board, desktop admin flow, or mobile app flow from product requirements or visual references.
version: 1.5.1
---

# Multi-Screen Wireframe

生成可双击打开、可继续编辑和构建的 JSX 多屏线框交付物。

**Skill 版本**：`1.5.1`（与仓库根目录 `VERSION`、`package.json` 保持一致；升级 skill 时三处同步 bump）。

## 生成流程

1. 先让用户确认输出目录。不得默认覆盖现有目录。
2. 整目录复制 `starter/` 到确认路径。不要从 `demo/` 复制。
3. 先定义数据：viewport 映射、screen 列表、唯一 id、入口和唯一页面流边 `links`。
4. 只修改目标副本的业务源码：`src/screens/*.jsx`、`src/layouts/*.jsx`、`src/project.js`（必要时 `src/app.jsx`、`src/styles/app.css`、`index.html` title / css link）。
5. **每个新建或改动的 `src/screens/*.jsx`、`src/layouts/*.jsx` 文件顶部必须写 skill 版本注释**（见下节）。
6. macOS 运行 `./build.command`；Windows x64 运行 `build.cmd`。
7. **交付前自检**（不通过不得交付）：见「源码齐全」与「样式落点」。
8. 构建成功后检查 `dist/app.js`，再双击 `index.html` 验证画布、演示、视口、导航、热区、审阅和错误隔离。
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

## DOM 可审阅性（必须）

生成的原型带「审阅」模式：用户可单选或多选页面节点，添加文字 / 顺序 / 删除 / 自由修改意见；每条意见会在目标旁显示半透明黄色编号，点击编号可浮动查看意见，最后生成可编辑并可复制给 AI 的 Prompt。审阅时按住空格可临时拖动画布。为了让 Prompt 中的 DOM 选择器和批注标记能稳定映射回 JSX，生成或修改业务源码时必须遵守：

1. **所有业务 JSX 节点都写语义 class**：组件和裸 DOM 元素都要有业务 `className`；使用英文 kebab-case，推荐按页面或模块使用 BEM，如 `order-detail__summary-title`。不得只依赖框架自带的 `wf-*` class。
2. **关键节点写全局唯一 id**：至少覆盖 screen 的业务根、页面标题 / header、主内容区、关键卡片 / 表单 / 表格、主操作与关键弹层。id 以 screen id 开头，如 `order-detail-summary`；共享 layout 不得写会在多屏重复的 id。
3. **重复数据写稳定 key**：列表行、表格行、重复卡片除 React `key` 外，还要在实际 DOM 组件上写 `data-wf-key={item.id}`（`DataTable` 会自动把 row key 输出为 `data-wf-key`）。禁止把数组下标作为业务 key，除非数据确实没有稳定标识。
4. **选择器必须耐修改**：不得依赖文字内容、临时状态 class、DOM 层级或 `nth-child` 作为业务定位协议。重排后原节点的业务 class / id / `data-wf-key` 必须保留。
5. **语义而非唯一堆砌**：class 要表达节点职责，不要求每个 class 全局唯一；精确定位由 screen 作用域、关键 id 与 `data-wf-key` 组合完成。

示例：

```jsx
<Column id="order-detail-page" className="order-detail__page">
  <Heading id="order-detail-title" className="order-detail__title" level={1}>订单详情</Heading>
  <Column id="order-detail-items" className="order-detail__items">
    {orders.map((order) => (
      <Cell
        className="order-detail__item"
        data-wf-key={order.id}
        key={order.id}
        title={order.title}
      />
    ))}
  </Column>
</Column>
```

交付前在审阅模式中至少实际选择：一个关键 id 节点、一个普通业务 class 节点、一个重复数据节点；确认选择器与 `src/` 中的源码可互相定位，并验证「多选两个节点 → 加入修改清单 → 两个目标显示同一黄色编号 → 点击编号查看浮动意见 → 生成 Prompt → 手动编辑 Prompt → 复制 Prompt」。同时验证按住空格可拖动画布，松开后恢复节点审阅。

## 版本注释（必须）

生成或修改业务页面时，在文件最顶部（`import` 之前）写如下块注释，版本号取自本 skill 当前 `version`（现为 `1.5.1`）：

```jsx
/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.5.1
 * 修改基于 v1.5.1
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
- 生成业务代码（`src/screens`、`src/layouts`、业务样式）不使用 emoji、Unicode 图标、语义化 SVG、在线资源或真实后端。框架画板 chrome（`framework/`）可用 SVG 画控件图标。
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
