# AGENTS.md — Vue Global Multi-Screen Wireframe Skill

本目录是独立的 Vue Global 多屏线框 Skill。生成流程见 `SKILL.md`，业务协议见 `reference.md`，当前版本见 `VERSION`。

## 维护边界

- 交付复制源永远是整个 `starter/`。
- 生成项目时使用 `scripts/create-project.mjs`，随后只修改目标副本的 `src/`。
- 不得用 `demo/` 作为复制源；demo 只覆盖复杂交互和长内容。
- demo 共享 `starter/framework/`，不携带自己的 runtime 或 vendor。
- demo 的 `../../starter/framework/` 仅为仓库内覆盖测试路径，禁止复制进交付物；生成任务只复制完整 `starter/`。
- 根目录的 `framework/`、`src/`、`index.html` 是早期 PoC 预览镜像；新增功能以 `starter/` 为准。
- 根目录 `framework/react-source/` 与 `framework/runtime/bridge-entry.jsx` 仅供维护，不进入 starter。
- 修改公共 runtime 后重新生成根目录 `framework/runtime/board.js`，再把交付所需的 runtime JS、styles、vendor 同步到 `starter/framework/`，验证 starter 和两个 demo。
- 不添加 esbuild、WASM、Node runtime、包管理器或服务器到交付物。

## 组件契约维护

- `starter/COMPONENTS.md` 是交付物内 Wf 公共组件的权威 API 文档；生成业务代码应先读它，不应通过扫描 framework 源码猜测用法。
- `starter/framework/runtime/ui.js` 的组件增删/改名，以及 props、默认值、事件、插槽、属性透传、DOM/ARIA、导航、布局行为变化，必须在同一次改动中同步更新 `starter/COMPONENTS.md`。
- `starter/framework/styles/prototype.css` 中影响组件公开布局或交互行为的改动，也必须同步更新 `starter/COMPONENTS.md`。
- 组件实现变更后必须更新文档中的 `ui-contract-sha256`，并运行 `node tools/check.mjs`；只改指纹、不审阅正文不算完成。

## 版本

`VERSION` 与 `package.json` 必须一致。`src/screens/*.js`、`src/layouts/*.js` 的 `@wireframe-skill` 和“修改基于”必须使用当前版本；bump 时同步 starter、根预览和两个 demo。

## 验证

1. `node scripts/check-project.mjs starter`
2. `node tools/check.mjs`
3. 使用 `file://` 回归 `starter/index.html`、`demo/api-client/index.html`、`demo/travel-app/index.html`
4. 验证控制台、错误隔离、主路径导航、弹层、TabBar、修改与注释能力

## 文件修改

- 使用 `apply_patch` 编辑文本文件；机械版本替换可使用格式化/批处理命令。
- 用户未明确要求时，不修改 `vue-global-poc/` 之外的文件。
- 不覆盖用户在其他目录的未提交修改。
