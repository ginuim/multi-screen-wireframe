# Changelog

## 2.0.0

`multi-screen-wireframe` 的新主线，交付格式升级为 `vue-global@2`。

### 主要变化

- 业务页面由 React/JSX + ESM 改为 Vue 3 Global Build + 多文件经典 JavaScript。
- 移除交付物中的构建步骤、esbuild、WASM 和平台相关构建脚本。
- 新增 `project.format`、`project.formatVersion` 和 `framework/FORMAT_VERSION`，阻止跨 major framework 覆盖。
- 新增交付物创建与静态检查脚本、Wf 组件契约文档和 Vue screen 注册协议。
- 保留离线 `file://`、多屏画板、演示导航、修改、注释、PNG/ZIP 导出和屏级错误隔离。

### Breaking changes

- v1 `.jsx` screen、ESM import/export、`src/app.jsx` 和 build 脚本不能在 v2 runtime 中运行。
- v1 与 v2 framework 不可互换，组件 API 不提供兼容层。
- v1 项目不会自动迁移；需要迁移时在新目录中转换并保留原项目。

## 1.8.0

React/JSX 交付格式的最终版本，冻结在 Git tag `v1.8.0`。已有 v1 原型继续按照其自带 `AGENTS.md`、`EDITING.md` 和 build 脚本维护。
