# 线框原型编辑约定

本目录是可独立编辑和离线运行的交付物。无需读取生成它的 skill。

## 目录分界

| 路径 | 角色 |
|------|------|
| `src/` | 业务：screens、layouts、`project.js`、`app.jsx` |
| `lib/` | 库：board、core、ui |
| `styles/prototype.css` | 库样式（主题 token 可按需改） |

升级库时，用新 starter 的 `lib/` + `styles/prototype.css`（及需要时的 `vendor/` / `tools/`）覆盖对应路径；**不要覆盖 `src/`**。

## 数据模型

`src/project.js` 直接导入 screen 函数。`project.viewports` 定义视口，`project.screens` 定义页面；`screens[].links` 是唯一页面流边。screen id 必须唯一并匹配 `^[a-z0-9-]+$`，每个 link 必须指向现有 id，演示模式至少需要一个 `entry: true`。

## 允许修改

- 业务只修改 `src/` 中的 JSX、布局和 `src/project.js`。
- 按明确需求调整 `styles/prototype.css` 中的主题 token；不要改画板定位和组件契约。
- 库缺陷只在 `lib/` 修，不要在业务文件里打补丁。
- 新页面从 `src/screens/_template.jsx` 复制，使用标准 JSX 与 ESM import/export。
- UI 组件从 `../../lib/ui/index.js` 导入（layouts 同理按层级调整相对路径）。

禁止修改 `dist/app.js`。它是构建产物。禁止改 `vendor/`、`tools/` 和构建脚本来绕过源码错误。

## 构建

- macOS：双击 `build.command`，或终端运行 `./build.command`。
- Windows x64：双击 `build.cmd`，或命令行运行 `build.cmd`。

构建不需要 Node、包管理器、网络或本地服务器。失败时修复 esbuild 指出的 JSX 文件、行和列；旧的 `dist/app.js` 会保留。

## 编辑步骤

1. 复制 `src/screens/_template.jsx`，重命名组件和文件。
2. 在 `src/project.js` 导入组件并加入 `screens`。
3. 只用 `links` 声明页面流；交互组件使用 `to="target-id"`。
4. 运行构建。
5. 构建成功后双击 `index.html`，检查画布、演示、导航和目标视口。

完整可复制写法见 `EDITING.md`。
