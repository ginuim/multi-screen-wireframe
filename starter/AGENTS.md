# 线框原型编辑约定

本目录是可独立编辑和离线运行的交付物。无需读取生成它的 skill。

## 目录分界

| 路径 | 角色 |
|------|------|
| `src/` | 业务：screens、layouts、`project.js`、`annotations.js`、`app.jsx`、`styles/app.css` |
| `framework/lib/` | 库：board、core、ui |
| `framework/styles/prototype.css` | 库样式（升级时整夹替换；业务不要改） |
| `framework/vendor/` | React 与导出库 |
| `framework/tools/` | 本地 esbuild |
| `src/styles/app.css` | 可选业务共享样式（在 `index.html` 引入） |

升级框架：用新 starter 的 `framework/` **整目录覆盖**本目录的 `framework/`；**不要覆盖 `src/`**。

## 数据模型

`src/project.js` 直接导入 screen 函数。`project.viewports` 定义视口，`project.screens` 定义页面；`screens[].links` 是唯一页面流边。screen id 必须唯一并匹配 `^[a-z0-9-]+$`，每个 link 必须指向现有 id，演示模式至少需要一个 `entry: true`。`src/annotations.js` 保存已经固化的页面 / 模块注释，由 project 暴露 `annotationsRevision` 与 `annotations`。

每个 `screens[].id` 必须对应真实文件 `src/screens/<id>.jsx`。缺源码等于无法再编辑，禁止只改 `dist/app.js`。

## 允许修改

- 业务只修改 `src/` 中的 JSX、布局、`src/project.js`、`src/annotations.js` 和 `src/styles/app.css`。
- **禁止**修改 `framework/`（含 `framework/styles/prototype.css`）。业务样式用 JSX `style` 或 `src/styles/app.css`。
- 库缺陷只在 `framework/lib/` 修（skill 源头），不要在业务文件里打补丁。
- 新页面从 `src/screens/_template.jsx` 复制，使用标准 JSX 与 ESM import/export。
- UI 组件从 `../../framework/lib/ui/index.js` 导入（layouts 同层级）。
- **版本注释**：每个 `src/screens/*.jsx`、`src/layouts/*.jsx` 文件顶部保留 `@wireframe-skill` 注释块。新建时填写当前 skill 版本；修改时保留「创建基于」，更新「修改基于」为本次 skill 版本。
- **修改定位**：所有业务 JSX 节点写语义 `className`；页面根、header / 标题、主内容、关键卡片 / 表单 / 表格、主操作和弹层写以 screen id 开头的全局唯一 `id`；重复数据节点写稳定 `data-wf-key`。不得用文字、状态 class、DOM 层级或 `nth-child` 作为业务定位协议。

禁止修改 `dist/app.js`。它是构建产物。禁止改 `framework/vendor/`、`framework/tools/` 和构建脚本来绕过源码错误。

## 构建

- macOS：双击 `build.command`，或终端运行 `./build.command`。
- Windows x64：双击 `build.cmd`，或命令行运行 `build.cmd`。

构建不需要 Node、包管理器、网络或本地服务器。失败时修复 esbuild 指出的 JSX 文件、行和列；旧的 `dist/app.js` 会保留。

## 编辑步骤

1. 复制 `src/screens/_template.jsx`，重命名组件和文件；保留并填写版本注释。
2. 在 `src/project.js` 导入组件并加入 `screens`（确认 `src/screens/<id>.jsx` 已存在）。
3. 只用 `links` 声明页面流；交互组件使用 `to="target-id"`。
4. 运行构建。
5. 构建成功后双击 `index.html`，检查画布、演示、导航和目标视口。
6. 打开「修改」，分别点选关键 id、普通业务 class 和重复数据节点；多选两个节点加入同一条修改，确认两个目标显示同一黄色编号且点击可查看意见；验证 Prompt 可编辑、可复制，并确认按住空格可拖动画布。
7. 打开「注释」，分别添加页面注释和模块注释；刷新后确认本机草稿仍在，验证编辑 / 删除、默认 Marker 显示开关、同步 Prompt，以及注释 JSON 导出 / 导入。

完整可复制写法见 `EDITING.md`。
