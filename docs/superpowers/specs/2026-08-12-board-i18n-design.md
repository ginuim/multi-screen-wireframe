# Board Chrome 多语言设计

日期：2026-08-12  
范围：画板 chrome（framework Board UI）  
版本意向：`2.1.0`（不改 `vue-global@2` 格式契约）

## 目标

为 Board 工具栏、帮助/设置、修改与注释面板、导出反馈、未保存提示，以及 AI Prompt 模板，提供 **简体中文 / 繁体中文 / 英文** 三语支持。业务屏 `src/screens` 文案不在本次范围。

## 决策摘要

| 项 | 选择 |
|---|---|
| 覆盖范围 | 仅画板 chrome（方案 A） |
| 实现方式 | 轻量字典 + `t()` + React context（无新依赖） |
| 默认语言 | 跟随 `navigator.language`；全失败兜底 `en` |
| Prompt 语言 | 跟随当前 UI locale |
| 偏好存储 | 全局 `localStorage['wf-board-locale']`，不按 project |
| 切换入口 | 「帮助 / 快捷键 / 设置」面板内「画板设置」一行 `<select>` |

## 架构

### 目录

```
framework-source/react-source/board/i18n/
  locales.js      # zh-CN / zh-TW / en 扁平字典
  detect.js       # navigator → locale 映射
  storage.js      # read/write wf-board-locale
  context.jsx     # LocaleProvider + useT() / useLocale()
  index.js        # 对外导出
```

维护源改动后重建 `starter/framework/runtime/board.js`。两个 demo 共享该 framework，不改业务屏。

### Locale 集合

`'zh-CN' | 'zh-TW' | 'en'`

### 解析顺序

1. `localStorage['wf-board-locale']` 合法则用之  
2. 否则读 `navigator.language` / `navigator.languages[0]`：
   - `zh-TW` / `zh-HK` / `zh-Hant*` → `zh-TW`
   - 其他 `zh*` → `zh-CN`
   - 其余可识别语言 → `en`
3. 都失败 → **`en`**

### API

- `t(key)` → 字符串  
- `t(key, { name })` → 简单 `{name}` 插值  
- `setLocale(locale)` → 写 storage + 触发重渲  
- `useLocale()` / `useT()` 供 React 组件使用  
- 纯函数模块（`review.js`、annotations Prompt 构建等）接收 `t` 或 `locale`，不直接读全局 DOM

### 缺失 key

开发期 `console.warn`；运行时先回退 `en` 同 key，再没有则显示 key 本身。

## UI

设置面板新增一行：

- 标签：`界面语言` / `介面語言` / `Language`
- 控件：`<select>`，选项文案固定为各自语言名：`简体中文` / `繁體中文` / `English`（不随当前 locale 改写选项名）
- 变更立即生效并持久化

## 覆盖范围

### 翻译

- 顶栏：模式、视口、热区、入口、返回、帮助、修改、注释、沉浸、展开/收起、导出、缩放、可交互锁及相关 `title` / `aria-label`
- 帮助面板：快捷键说明、设置项、关闭按钮、说明文字
- 修改 / 注释：面板文案、类型标签、空态、标记、确认与操作按钮
- 导出反馈、离开未保存提示
- AI Prompt 模板（修改 Prompt、注释同步 Prompt）

### 不翻译

- 业务屏内容与 `project` 里的 screen 标题 / 名称
- 用户输入的修改意见、注释正文原文
- 代码注释
- 快捷键 key 本身（`Ctrl+1`、`Esc`、`?` 等）

## 数据与不变式

- 语言偏好与 `wf-board-settings:<project>` 分离，全局共享  
- 不引入 npm / vendor i18n 库  
- 不改 Wf 业务组件 API；`COMPONENTS.md` 与 `ui-contract-sha256` 无需因本功能更新  
- 不改 `project.format` / `FORMAT_VERSION`

## 版本与文档

- bump `VERSION`、`package.json`、相关 `@wireframe-skill` /「修改基于」至 `2.1.0`
- `CHANGELOG.md` 增加 `2.1.0` feat 条目
- `README.md` 功能列表补充「界面语言」
- `framework-source/README.md` 注明 i18n 目录职责

## 验证

1. `node tools/check.mjs`
2. `node scripts/check-project.mjs starter`
3. `file://` 回归 `starter/index.html`、`demo/api-client/index.html`、`demo/travel-app/index.html`
4. 无 storage：浏览器语言分别覆盖 `zh-CN`、`zh-TW|zh-HK`、`en`、未知 → 未知应落 `en`
5. 设置内切换三语：工具栏、帮助、修改/注释、Prompt 预览即时切换
6. 刷新后语言保持；清除 `wf-board-locale` 后重新跟浏览器
7. 导航、导出、未保存离开提示、快捷键说明语言正确

## 明确不做

- 业务屏 / 交付物内容 i18n
- 按 project 记忆语言
- 外挂 JSON 异步加载
- 新第三方 i18n 依赖
- 复数规则、日期本地化等重型 i18n 能力
