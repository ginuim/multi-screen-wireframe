# Vue Global 多屏线框交付物约定

本目录是可直接双击运行的离线原型。日常生成与修改只写 `src/`，不要修改 `framework/`。

## 源码完整性

- `project.screens` 每个 id 都有对应 `src/screens/<id>.js`。
- screen 文件调用同 id 的 `WireframeVue.defineScreen()`。
- 共享业务组件写入 `src/layouts/` 或 `src/components/`，以 `Wf` 前缀注册，并在 `project.components` 声明。
- 不使用 import/export、JSX、SFC、TypeScript、动态 import 或 npm 依赖。
- 保存后刷新 `index.html`，不执行构建。

## 修改边界

- 业务页面、状态、文案和样式只改 `src/`。
- 页面 title 或新增业务样式 link 时可以改 `index.html`。
- 不修改 `framework/` 来规避 screen 错误。
- 不添加 `dist/`、build 脚本、esbuild、WASM、服务器或目录选择流程。

## 稳定性

- 使用 Composition API；定时器和监听器在 `onUnmounted()` 清理。
- 所有业务节点使用语义 class；关键节点使用唯一 id；重复节点使用稳定 `data-wf-key`。
- 页面流只写 `project.links`；导航使用 Wf 组件的 `to`。
- 移动端使用 `WfMobileShell`，让内容区内部滚动、TabBar 留在 screen 底部。
- 弹层只使用 Wf 反馈组件并相对当前 screen 定位。

完成后检查画板、演示、主路径、屏内状态、修改、注释、导出和错误隔离。
