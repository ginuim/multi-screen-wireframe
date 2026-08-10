# AGENTS.md — multi-screen-wireframe

本目录是独立的多屏线框 skill。生成流程见 `SKILL.md`，组件与数据协议见 `reference.md`，人类使用说明见 `README.md`。

**当前版本**：见根目录 `VERSION`（现 `1.5.1`）。`SKILL.md` frontmatter 的 `version` 与 `package.json` 必须与之一致。

## 维护边界

- 交付复制源永远是整个 `starter/`。
- 生成原型时，先把 `starter/` 复制到用户确认的目标目录，只修改目标副本的 `src/`（screens / layouts / project / app / `src/styles/app.css`）；必要时改 `index.html` 的 title 与业务 css link。
- 框架在 `starter/framework/`（`lib` / `styles` / `vendor` / `tools`）。升级时整夹覆盖交付物的 `framework/`，**不要覆盖 `src/`**。
- **禁止**生成任务修改 `framework/`（含 `prototype.css`）。
- 不得修改相邻的 `multi-screen-wireframe`。
- 不提供旧版 API 兼容层，不复制旧版 runtime 或业务实现。
- `framework/vendor/` 仅含有版本和许可证记录的第三方静态库。
- `demo/` 是覆盖测试，不是复制源；共享 `starter/framework/`，不携带 `tools/`。demo 业务样式放各自 `styles/demo.css`，不得写入 `framework/styles/prototype.css`。

## 技术约束

- 业务源码是标准 JSX + ESM；`src/app.jsx` 编译为单个 IIFE `dist/app.js`。
- `project.screens` 每个 id 必须有对应的 `src/screens/<id>.jsx` 源文件；禁止只交付 `dist`。
- 交付构建只用 `framework/tools/` 随包 esbuild，不依赖 Node、包管理器、网络或服务器。
- 默认灰阶。图标和图片只用方形、圆形、线框块等抽象几何占位。
- 弹层必须使用组件库并相对单个 screen 定位，禁止 `position: fixed`。
- 有参考图时先测量 viewport、区域、尺寸、间距、对齐和圆角，再实现。
- 生成默认求完整：主路径多屏 + 屏内可演示内容；列表类至少 3 条并尽量超过一屏可滚（用户另有要求除外）。细节见 `SKILL.md`「内容完整度」。
- 生成/修改 `src/screens`、`src/layouts` 时必须在文件顶注释写明基于的 skill 版本（见 `SKILL.md`「版本注释」）。
- 生成的业务 JSX 节点必须有语义 class；关键节点有全局唯一 id；重复数据节点有稳定 `data-wf-key`，以支持 Board 审阅模式生成可定位的 AI 修改 Prompt。

## 维护

- 修改 `framework/` 公共实现后，重新构建 starter 和两个 demo。
- demo 构建：`scripts/build-demo.sh demo/api-client` 或 `scripts/build-demo.sh demo/claims-app`。
- 运行 `tests/*.test.mjs`，再做浏览器回归。
- bump 版本时同步：`VERSION`、`package.json`、`SKILL.md` frontmatter、`starter/src/screens/_template.jsx` 注释中的版本号。
