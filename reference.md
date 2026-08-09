# v2 协议与组件参考

Skill 版本见仓库根目录 `VERSION`（与 `SKILL.md` / `package.json` 同步）。框架在 `framework/`，业务在 `src/`。生成的 `src/screens`、`src/layouts` 须带 `@wireframe-skill` 版本注释；每个 `screens[].id` 必须有对应 `src/screens/<id>.jsx`；业务样式写 `src/styles/app.css` 或内联 style，禁止改 `framework/styles/prototype.css`。

## Project schema

```js
import { HomeScreen } from './screens/home.jsx'

export const project = {
  name: '项目名',
  viewports: {
    mobile: { width: 375, height: 812 },
  },
  defaultViewport: 'mobile',
  screens: [
    {
      id: 'home',
      title: '首页',
      description: '入口页面',
      component: HomeScreen,
      entry: true,
      links: ['detail'],
      edgeCases: [],
    },
  ],
}
```

不变量：

1. `screens[].id` 唯一并匹配 `/^[a-z0-9-]+$/`。
2. `defaultViewport` 必须存在于 `viewports`。
3. viewport 的 `width`、`height` 是正数。
4. `component` 是函数。
5. `links[]` 中每个目标都存在。
6. 至少一个 screen；演示模式至少一个 `entry: true`。
7. `links` 是页面流的唯一边数据。

## 上下文

`usePrototype()` 提供：

```js
{
  mode,
  viewportKey,
  viewport,
  entryId,
  currentScreenId,
  navigate,
  selectEntry,
  goBack,
  reset,
}
```

自定义点击区域优先用组件的 `to`（`Button` / `Card` / `Box` / `Row` / `Column` / `Cell` 等）。热区高亮认 `[data-flow-to]`；`ScreenFrame` 会对屏内该属性做点击委托，因此即便写成裸 `span`/`div` 只带 `data-flow-to`，演示模式也能跳转。仍推荐用库组件，以便带上 `wf-interactive` 与键盘可达性。

演示模式中 `navigate(id)` 只允许当前 screen 的 `links` 目标；入口下拉列出全部页面，`selectEntry(id)` 可把任意屏设为演示起点并清空历史，重置回到当前 `entryId`。默认入口仍取第一个 `entry: true`。画布模式可直接聚焦任意 screen。画板双击某屏进入演示；演示视口双击屏外空白退出回画板（点在 `.wf-screen-chrome` 内不退出）。

`currentScreenId` 是画板聚焦 / 演示当前页，不是“我正在渲染的这屏”。布局里 `TabBar` / `SideNav` 的选中态必须用 `useScreenId()`（由 `ScreenFrame` 注入），否则画布上所有屏会一起高亮同一个 tab。

## 审阅与 DOM 定位

Board 的「审阅」模式会拦截屏内交互。用户可以点选节点、沿面包屑切换到父节点，添加「修改建议 / 修改文字 / 调整顺序 / 删除节点」，再把修改清单生成可手动编辑和复制的 AI Prompt。开启多选或按住 Shift / Command / Ctrl 点击，可把多个节点绑定到同一条意见；所有目标旁显示同一个半透明黄色序号，点击序号浮动显示意见。按住空格时临时切换为画布拖动，松开后恢复审阅；输入框和 Prompt textarea 内的空格不触发画布。批注编号和浮层只高于画布业务内容，低于侧栏、顶栏、画布索引、沉浸控件和审阅面板等框架 chrome。审阅意见只存在于当前页面会话，不修改 JSX，也不生成 sidecar 文件。

选择器优先级：关键节点 id → screen 作用域内的业务 class → `data-wf-key` → 带框架 class 的 DOM 路径兜底。生成业务源码时必须主动提供前三级稳定锚点：

- 所有业务 JSX 节点都有英文语义 `className`，推荐 `<screen-or-module>__<role>`。
- screen 业务根、header / 标题、主内容区、关键卡片 / 表单 / 表格、主操作和弹层有以 screen id 开头的全局唯一 id。
- 重复数据节点有稳定 `data-wf-key`；`DataTable` 自动把 row key 和 column key 输出到对应 DOM。
- 共享 layout 只用 class，不写会在画布多屏渲染时重复的 id。
- 不用文字内容、`is-*` 状态 class、DOM 层级或 `nth-child` 作为业务定位协议。

## 布局

- `Box`：普通 `div`，透传 DOM props。
- `Row({ gap, alignItems, justifyContent, style })`：横向 flex。
- `Column({ gap, alignItems, justifyContent, style })`：纵向 flex。
- `Grid({ columns, gap, style })`：CSS grid。

`Box` / `Row` / `Column` / `Grid` 与 `Card` 一样接受 `to` 和 `onClick`（整块可点区域可直接写在布局上，不必再包一层 `Card`）。

`style` 最后合并，可覆盖组件默认值。`Grid.columns` 接受正整数、非空 CSS 模板字符串，或按 viewport key 映射的值，例如：

```jsx
<Grid columns={{ mobile: 1, desktop: 4 }} gap={12}>
  {children}
</Grid>
```

## 内容与表单

- 内容：`Heading`、`Text`、`Card`、`Badge`、`Avatar`、`ImagePlaceholder`
- 表单：`Button`、`TextInput`、`TextArea`、`Select`、`Checkbox`、`Radio`、`Toggle`、`FormField`

`PageHeader` 的页面标题需要精确审阅定位时传 `titleId`，副标题可传 `subtitleId`；header 自身仍用普通 `id`。例如 `<PageHeader id="order-detail-header" titleId="order-detail-title" ... />`。

`Avatar` 只表达圆形几何占位。`ImagePlaceholder` 只表达矩形尺寸、比例和圆角。

## 导航与数据

- 导航：`PageHeader`、`SideNav`、`TabBar`、`MobileShell`、`Breadcrumbs`
- 数据：`Cell`、`DataTable`、`Tabs`、`Steps`、`EmptyState`

`MobileShell` 是移动端整屏壳：上内容区可滚，下 `TabBar` 贴底。App / 小程序底栏优先用它；`activeId` 传 `useScreenId()`。`TabBar` 自身带 `margin-top: auto`，放在全高 flex Column 末尾也会贴底。不要用 `position: fixed` 钉底栏。

`Steps` 支持 `items=[{ id, label, description? }]`、`current`、`direction="horizontal|vertical"`。完成态用 CSS 几何勾，当前态实心圆，待办态空心圆，步骤之间有连接线。

`EmptyState` 只用于列表无数据。不要把它放在已有记录下面当“没有更多”。

生成默认：列表 / 表格 / Cell 组至少 3 条有区分度的演示数据，并尽量让列表区超过一屏可滚；仅当用户明确要求空态或少量样例时例外。完整页面流与屏内内容要求见 `SKILL.md`「内容完整度」。

`Card`、`Button`、`Cell`、`Box`、`Row`、`Column`、`Grid` 接受 `to="screen-id"`。`SideNav` 和 `TabBar` 接受 `items={[{ label, to }]}` 与 `activeId`。`activeId` 应传 `useScreenId()`，不要传 `usePrototype().currentScreenId`。它们统一写入 `data-flow-to`，调用上下文导航，并在演示模式维护历史。

## 反馈与地图

- 反馈：`Modal`、`ConfirmDialog`、`Toast`、`LoadingOverlay`
- 地图：`WireMap`、`MapMarker`、`MapOverlay`

反馈组件相对 `.wf-screen-content` 绝对定位。`ConfirmDialog` 组合 `Modal`。

```jsx
<WireMap>
  <MapMarker x={40} y={60} label="位置 A" to="detail" />
  <MapOverlay position="bottom">说明</MapOverlay>
</WireMap>
```

## 构建产物

`src/app.jsx` 是入口，从 `lib/` 引入 Board / core。构建使用 classic JSX transform、browser platform、ES2018、IIFE 和 inline source map，原子替换 `dist/app.js`。生成文件顶部固定包含：

```js
/* GENERATED FILE. EDIT src/, THEN RUN BUILD. */
```

构建失败不会覆盖上一次可运行产物。
