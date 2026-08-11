# Vue Global PoC 编辑约定

本目录是独立实验。只能修改本目录内文件，不得修改上级 `starter/`、`demo/`、`tests/` 或其他 `experiments/`。

## 业务边界

- AI 生成和日常修改只写 `src/`。
- 每个 `src/project.js` 中的 screen id 必须对应 `src/screens/<id>.js`。
- screen 文件必须调用同 id 的 `WireframeVue.defineScreen(id, factory)`。
- 共享业务组件必须在 `project.components` 声明，并以 `Wf` 前缀调用 `WireframeVue.defineComponent(name, factory)`；声明顺序就是依赖加载顺序。
- 不修改 `framework/` 来绕过业务错误。
- 修改 `src/` 后不构建，刷新 `index.html` 验证。

## Vue 代码约束

- 使用 Vue 3 Composition API 的 `setup()`；禁止 Options API 的 `data` / `methods` 混写。
- factory 参数按需解构 `ref`、`computed`、`watch`、`onMounted`、`useScreenId` 等。
- 禁止 import/export、`.vue` SFC、`<script setup>`、JSX、TypeScript 和 npm 裸依赖。
- 禁止在 screen 文件顶层写 `const` / `let` 等共享声明；状态和函数写在 factory 或 `setup()` 内。
- template 必须是当前文件内的字符串，禁止 fetch HTML/JSON。
- 全局组件只使用有 `Wf` 前缀的组件；业务组件/节点使用页面语义 class。
- `v-for` 必须提供稳定 `:key`，实际重复 DOM 同时提供 `:data-wf-key`。
- 模板表达式只写单一表达式；复杂逻辑移入 computed 或函数。
- 不使用 `v-html`、在线资源、真实后端、emoji、Unicode 图标或语义 SVG。

## 导航和定位

- `project.screens[].links` 是唯一页面流边。
- 导航使用 `to="screen-id"`，不要引入 Vue Router 或操作 location hash。
- 页面根、标题、主内容、关键卡片/表单/表格/操作/弹层使用以 screen id 开头的全局唯一 id。
- 所有业务节点使用英文语义 class；重复数据使用稳定 `data-wf-key`。
- 弹层只用 `WfModal` / `WfConfirmDialog`，保持相对单个 screen 定位。

## 验证

1. 可选在 PoC 根目录运行 `node tools/check.mjs`，一次检查 starter 与两个 demo。
2. 双击任一 `index.html`，确认无需目录授权即可进入 Board。
3. 检查画布、演示、viewport、导航、屏内交互、修改、注释与导出。
4. 故意破坏一个测试 screen 时，应只显示该 screen 的错误卡，不影响其他 screen。
