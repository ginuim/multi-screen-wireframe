# AGENTS.md — multi-screen-wireframe

本目录是独立的多屏线框 skill。生成流程见 `SKILL.md`，组件与数据协议见 `reference.md`，人类使用说明见 `README.md`。

## 维护边界

- 交付复制源永远是整个 `starter/`。
- 生成原型时，先把 `starter/` 复制到用户确认的目标目录，只修改目标副本的 `src/`（screens / layouts / project / app）和明确允许的主题 token。
- 库代码在 `starter/lib/`；升级库时覆盖交付物的 `lib/` + `styles/prototype.css`，不要覆盖 `src/`。
- 不得修改相邻的 `multi-screen-wireframe`。
- 不提供旧版 API 兼容层，不复制旧版 runtime 或业务实现。
- `starter/vendor/` 仅含有版本和许可证记录的第三方静态库。
- `demo/` 是覆盖测试，不是复制源；共享 starter 的 `lib/`、CSS 和 vendor，不携带 `tools/`。

## 技术约束

- 业务源码是标准 JSX + ESM；`src/app.jsx` 编译为单个 IIFE `dist/app.js`。
- 交付构建只用随包携带的 esbuild，不依赖 Node、包管理器、网络或服务器。
- 默认灰阶。图标和图片只用方形、圆形、线框块等抽象几何占位。
- 弹层必须使用组件库并相对单个 screen 定位，禁止 `position: fixed`。
- 有参考图时先测量 viewport、区域、尺寸、间距、对齐和圆角，再实现。
- 生成默认求完整：主路径多屏 + 屏内可演示内容；列表类至少 3 条并尽量超过一屏可滚（用户另有要求除外）。细节见 `SKILL.md`「内容完整度」。

## 维护

- 修改 starter 的公共实现（`lib/`、库样式）后，重新构建 starter 和两个 demo。
- demo 构建：`scripts/build-demo.sh demo/order-admin` 或 `scripts/build-demo.sh demo/claims-app`。
- 运行 `tests/*.test.mjs`，再做浏览器回归。
