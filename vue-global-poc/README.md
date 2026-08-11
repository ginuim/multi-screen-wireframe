# Vue Global 多文件 PoC

这是 `multi-screen-wireframe` 的隔离对比实现。业务 screen 使用 Vue 3 Global Build、Composition API 和运行期字符串模板；页面按文件拆分，直接双击 `index.html` 即可运行。

## 核心目标

- `file://` 直接打开，不启动 Web Server。
- 不携带 esbuild、WASM 或包管理器。
- 不选择目录、不申请 File System Access 权限。
- `project.screens[].id` 对应 `src/screens/<id>.js`，一页一文件。
- 修改业务 screen 后刷新浏览器即可，不生成 `dist/app.js`。
- 保留原 Board 的画布、演示、修改、注释、PNG/ZIP 导出与屏级错误隔离。

## 架构

```text
index.html
  ├─ Vue Global（开发版，保留完整错误信息）
  ├─ WireframeVue 注册表与 Wf* Vue 组件
  ├─ 预编译 React Board 桥接层
  ├─ src/project.js / src/annotations.js
  └─ loader.js → 依次加载 src/screens/<id>.js → 挂载 Board
```

PoC 刻意只迁移 AI 经常生成和修改的业务页面层。现有 React Board 被预编译成 `framework/runtime/board.js`，不需要在交付物中携带编译器；Vue screen 的 DOM 仍由原 Board 统一处理导航、修改、注释和导出。共享业务布局和组件也按普通脚本先于 screen 加载，并统一使用 `Wf` 前缀注册。

## 三个完整入口

| 入口 | 内容 |
| --- | --- |
| `index.html` | starter 对比入口，2 个基础页面 |
| `demo/api-client/index.html` | API Client，6 个页面和共享桌面布局 |
| `demo/travel-app/index.html` | 周末出发，10 个页面、共享移动布局、地图组件和弹层状态 |

三个入口都可直接通过 `file://` 打开，不需要选择目录。两个 demo 共享根目录的 `framework/`，不重复携带 runtime 或 vendor。

## 运行与修改

1. 双击 `index.html`。
2. 修改 `src/screens/home.js` 或 `src/screens/detail.js`。
3. 保存并刷新浏览器。

新页面：

1. 复制 `src/screens/_template.js` 为 `src/screens/<id>.js`。
2. 修改 `WireframeVue.defineScreen('<id>', ...)` 中的 id。
3. 在 `src/project.js` 的 `screens` 中添加同一个 id。
4. 用 `links` 声明页面流，刷新浏览器。

页面不需要在 `index.html` 添加 `<script>`；loader 会从 project id 推导文件路径。共享业务组件通过 `project.components` 显式声明名称与源文件，loader 会先校验并加载它们，再加载 screen。

## 稳定性约束

- screen 文件只调用一次 `WireframeVue.defineScreen()`，不要声明顶层全局变量。
- 使用 Composition API `setup()`；需要的 API 从 factory 参数取得。
- 模板使用 `Wf*` 组件，并写完整闭合标签。
- 不使用 import/export、SFC、JSX、TypeScript、动态 import 或本地 fetch。
- 所有业务 DOM 保留语义 class；关键节点保留全局唯一 id；重复数据保留稳定 `data-wf-key`。
- 页面跳转只使用 `project.links` 和组件的 `to`，不引入 Vue Router。
- 业务样式写 `src/styles/app.css`，使用页面前缀避免样式泄漏。

注册表会在启动时校验重复 id、缺失 screen、孤儿注册和 Vue 模板编译错误。单个 screen 加载、编译或运行失败时，该 screen 显示错误卡，其他页面继续运行。

## 目录

| 路径 | 作用 |
| --- | --- |
| `src/screens/*.js` | AI 生成/修改的 Vue Global 页面 |
| `src/project.js` | viewport、screen 元数据、入口和 links |
| `src/annotations.js` | 已固化注释 |
| `src/styles/app.css` | 业务共享样式 |
| `demo/*/src/layouts` / `components` | demo 的 Vue Global 共享业务组件 |
| `demo/*/styles/demo.css` | demo 独立业务样式 |
| `framework/runtime/registry.js` | 页面注册、模板预编译和完整性检查 |
| `framework/runtime/ui.js` | `Wf*` Vue 组件库 |
| `framework/runtime/board.js` | 预编译 Board 桥接产物 |
| `framework/react-source/` | Board 桥接的维护源，仅用于复现 PoC |
| `framework/vendor/` | Vue、React 和离线导出库 |

`tools/check.mjs` 会一次校验 starter 和两个 demo，共 18 个 screen；它是仓库维护校验，不参与浏览器运行，也不是构建步骤。
