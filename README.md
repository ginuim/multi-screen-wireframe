# Multi-Screen Wireframe

**Skill 版本 / Version：`1.6.0`**（见 `VERSION`）

从产品需求或视觉参考，生成**可双击打开**的多屏线框原型。

Generate **double-clickable** multi-screen wireframe prototypes from product requirements or visual references.

交付物自带源码、React、esbuild 与导出能力。运行与构建都不需要 Node、包管理器、网络或本地服务器。

The deliverable ships with source, React, esbuild, and export utilities. Runtime and build need no Node, package manager, network, or local server.

## 能做什么 / What it does

- **多屏页面流**：画布总览 + 演示模式跳转（`links` / `to`）  
  Multi-screen flows: canvas overview + demo-mode navigation
- **桌面 / 移动**：SideNav、TabBar、表格、表单、弹层等线框组件  
  Desktop admin and mobile shells with wireframe UI primitives
- **灰阶线框**：几何占位图标；有参考图时按测量还原布局  
  Grayscale wireframes; measure-then-layout when references exist
- **导出**：单页 PNG / 多页 ZIP  
  Export single-page PNG or multi-page ZIP
- **修改 Prompt**：单选 / 多选 DOM 节点添加意见，以黄色编号标记并浮动查看，生成可继续编辑和复制给 AI 的 Prompt
  Select DOM nodes and turn scoped comments into an editable AI prompt
- **帮助与快捷操作**：键盘切换画板、演示、交互锁、修改、沉浸、全屏与热区；按 `?` 查看完整清单
  Keyboard shortcuts for board modes, interaction lock, review, immersive/fullscreen, and hotspots
- **可配置索引**：画板索引可拖拽、关闭，并按项目记住显示开关
  Draggable canvas index with a per-project visibility preference
- **可继续改**：改 `src/`，本地 `./build.command`（macOS）或 `build.cmd`（Windows）重建  
  Keep editing `src/` and rebuild locally

## 不适合 / Not for

- 高保真视觉稿 / 设计系统落地 — high-fidelity visual design systems
- 真实后端联调、鉴权、路由框架 — real backends, auth, app routers
- 只要单页静态说明、不要多屏画板 — single static page with no multi-screen board

## 目录说明 / Layout

| 路径 | 作用 |
|------|------|
| `starter/` | 复制源：生成原型时整目录复制到目标路径 |
| `demo/` | 覆盖示例（后台 / 移动），不是复制源 |
| `SKILL.md` | 给 AI Agent 的生成流程与约束 |
| `reference.md` | 组件与 project schema |
| `AGENTS.md` | 维护边界与技术约束 |
| `tests/` | 契约与行为测试 |

## 安装 / Install

克隆本仓库，把目录交给支持 Skills / 项目约定的 AI Agent（或按你的工具习惯放到 skills 目录）。

```sh
git clone https://github.com/ginuim/multi-screen-wireframe.git
```

生成新原型时：确认输出路径 → 整目录复制 `starter/` → 只改业务 `src/` → 构建 → 双击 `index.html`。

Clone this repo and point your AI agent at it (or place it in whatever skills folder your tool uses). To generate a prototype: confirm the output path → copy all of `starter/` → edit only business `src/` → build → open `index.html`.

## 修改交付物 / Edit a deliverable

进入交付目录后先读：

- `AGENTS.md`：数据模型、允许修改范围和验证步骤
- `EDITING.md`：页面、布局、导航、弹窗四个完整 JSX 示例
- `src/screens/_template.jsx`：唯一页面模板

业务修改只放在 `src/`。库代码在 `framework/lib/`；升级库时整夹覆盖 `framework/`，不要覆盖 `src/`。`dist/app.js` 是生成物，不要手改。业务 JSX 节点保留语义 class，关键节点保留全局唯一 id，重复数据节点保留 `data-wf-key`，这样修改 Prompt 中的 DOM 选择器才能稳定映射回源码。

## 修改并生成 Prompt / Modify to prompt

打开原型后点击工具栏「修改」：点选屏内节点，通过层级面包屑切换到父组件，添加修改建议、文字替换、顺序调整或删除要求。开启「多选」或按住 Shift / Command / Ctrl 点击，可以把多个节点绑定到同一条意见。每条意见会在所有目标旁显示同一个半透明黄色编号；点击编号浮动查看意见。按住空格可临时拖动画布，松开后继续修改。修改清单会生成 Prompt；Prompt 可继续手动编辑，再一键复制给 AI。

修改记录只保留在当前页面会话中，不会直接改 JSX，也不会生成额外状态文件。AI 应按 Prompt 中的 id / class / `data-wf-key` 搜索 `src/`，修改源码后重新构建。

## 快捷键与画板设置 / Shortcuts and board settings

macOS 使用 `Ctrl+1` / `Ctrl+2` 切换画板与演示，`Ctrl+I` 切换交互锁，`Ctrl+M` 切换修改模式；Windows/Linux 保持使用 `Alt+1` / `Alt+2`、`Alt+I`、`Alt+M`。浏览器全屏使用当前平台修饰键加 `Shift+F`，沉浸模式使用当前平台修饰键加 `3`；缩放使用 `Ctrl+滚轮`。按住 `Space` 临时拖动画布，按 `Esc` 关闭当前面板或退出模式，按 `?` 打开“帮助 / 快捷键”面板。输入框和可编辑内容不会响应普通快捷键；沉浸工具栏同样提供帮助和设置入口。

画板底部索引可通过独立把手拖动，也可直接关闭。工具栏“帮助 / 快捷键 / 设置”面板中的“显示画板索引”可重新开启索引；显示状态按项目保存在浏览器本地，拖拽位置只在当前页面会话中保留。

## 构建 / Build

macOS：

```sh
./build.command
```

脚本按当前机器自动选择 arm64 或 x64 esbuild。

Windows x64：

```bat
build.cmd
```

构建成功后双击 `index.html`。页面通过 `file://` 加载本地 React 和单个 `dist/app.js`。

## Demo

打开（需能解析到共享的 `starter/`）：

- `demo/api-client/index.html` — desktop API Client（SideNav、DataTable、Tabs、表单）
- `demo/travel-app/index.html` — mobile 旅行助手（长页面展开、地图、TabBar、完整表单、弹层与反馈）

维护者修改公共源码后，在仓库根目录运行：

```sh
scripts/build-demo.sh demo/api-client
scripts/build-demo.sh demo/travel-app
```

demo 不携带编译器，只在维护时使用 `starter/framework/tools/`。

## 给 AI Agent / For AI agents

按 `SKILL.md` 执行：确认输出目录 → 复制 `starter/` → 只改业务 `src/` → 构建 → 用 `index.html` 验证画布、演示、视口与导航。组件与 project schema 见 `reference.md`。

Follow `SKILL.md`: confirm output path → copy `starter/` → edit only business `src/` → build → verify canvas, demo mode, viewports, and navigation via `index.html`. See `reference.md` for components and project schema.

## 平台与版本 / Platforms

携带 esbuild 0.28.1 的 macOS arm64、macOS x64、Windows x64 官方二进制。来源、版本、许可证和 SHA-256 位于 `starter/framework/tools/`。第三方浏览器库的版本与许可证位于 `starter/framework/vendor/`。

Ships official esbuild 0.28.1 binaries for macOS arm64, macOS x64, and Windows x64. Provenance, versions, licenses, and SHA-256 sums live under `starter/framework/tools/`. Browser vendor libs are under `starter/framework/vendor/`.
