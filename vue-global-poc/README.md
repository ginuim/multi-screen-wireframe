# Vue Global Multi-Screen Wireframe Skill

这是 `multi-screen-wireframe` 的无构建 Vue Global 方案。它生成可直接通过 `file://` 打开的多屏原型，业务源码按页面拆成普通 `.js` 文件，不携带 esbuild、WASM、Node、包管理器或服务器，也不要求用户选择项目目录。

## Skill 结构

| 路径 | 作用 |
| --- | --- |
| `SKILL.md` | AI 生成和修改流程 |
| `reference.md` | Project、Vue factory、组件和注释协议 |
| `starter/` | 唯一交付复制源 |
| `demo/api-client/` | 6 屏桌面复杂示例 |
| `demo/travel-app/` | 10 屏移动端复杂示例 |
| `scripts/create-project.mjs` | 安全复制 starter 到新目录 |
| `scripts/check-project.mjs` | 校验任意生成交付物 |
| `tools/check.mjs` | 校验整个 Skill 包、starter 与 demos |

## 使用

```sh
node scripts/create-project.mjs /absolute/path/to/new-prototype
node scripts/check-project.mjs /absolute/path/to/new-prototype
```

随后只修改目标目录的 `src/`，保存后刷新 `index.html`。最终用户不需要运行上述命令；这些脚本只用于 AI 创建和交付检查。

## 离线架构

业务 screen 和共享布局由 Vue Global compiler 在浏览器中编译。稳定的 Board 以预编译脚本提供画板、演示、导航、修改、注释、PNG/ZIP 导出和屏级错误隔离。Board 的 React/JSX 维护源只留在 Skill 根目录，不进入交付复制源；两个 demo 共享 `starter/framework/`，不重复携带 runtime。

版本见 `VERSION`，Skill UI 元数据见 `agents/openai.yaml`。
