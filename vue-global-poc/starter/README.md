# Vue Global 多屏线框原型

直接双击 `index.html` 运行，无需安装依赖、启动服务器、执行构建或选择目录。

业务源码位于 `src/`：

- `src/project.js`：viewport、页面列表和页面流。
- `src/screens/*.js`：一页一个 Vue Global screen。
- `src/annotations.js`：已固化注释。
- `src/styles/app.css`：业务共享样式。
- `src/layouts/`、`src/components/`：可选共享业务组件。

生成或修改页面前先读 `COMPONENTS.md`，它是 Wf 组件 props、事件、插槽和组合方式的权威说明；普通业务任务无需读取 framework 源码。

修改 `.js` 或 CSS 后保存并刷新浏览器。完整编辑约束见 `EDITING.md` 和 `AGENTS.md`。
