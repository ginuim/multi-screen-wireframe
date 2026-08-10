# JSX 编辑示例

以下五段都是完整 screen，可直接保存到 `src/screens/`。保存后在 `src/project.js` 导入组件、加入 screen，并更新相关 `links`。

组件从 `../../framework/lib/ui/index.js` 导入（`src/layouts/` 同层级）。

为了让 Board 的「修改」意见能用 DOM 选择器准确定位源码，所有业务 JSX 节点都写语义 `className`；页面根、标题、主内容、关键卡片 / 表单 / 表格 / 操作 / 弹层写以 screen id 开头的全局唯一 `id`；重复数据节点写稳定 `data-wf-key`。

## 页面示例

```jsx
/**
 * @wireframe-skill multi-screen-wireframe@1.7.0
 * 创建基于 v1.7.0
 * 修改基于 v1.7.0
 */
import { Column, Heading, Text } from '../../framework/lib/ui/index.js'

export function AboutScreen() {
  return (
    <Column id="about-page" className="about-page" gap={12} style={{ padding: 24 }}>
      <Heading id="about-title" className="about-page__title" level={1}>关于项目</Heading>
      <Text className="about-page__description">这里填写页面说明。</Text>
    </Column>
  )
}
```

## 布局示例

```jsx
/**
 * @wireframe-skill multi-screen-wireframe@1.7.0
 * 创建基于 v1.7.0
 * 修改基于 v1.7.0
 */
import { Card, Column, Grid, Heading, Row, Text } from '../../framework/lib/ui/index.js'

export function DashboardScreen() {
  return (
    <Column id="dashboard-page" className="dashboard-page" gap={16} style={{ padding: 24 }}>
      <Row id="dashboard-header" className="dashboard-page__header" alignItems="center" justifyContent="space-between">
        <Heading id="dashboard-title" className="dashboard-page__title" level={1}>概览</Heading>
        <Text className="dashboard-page__period">今日</Text>
      </Row>
      <Grid id="dashboard-metrics" className="dashboard-page__metrics" columns={{ mobile: 1, desktop: 3 }} gap={12}>
        <Card className="dashboard-page__metric" data-wf-key="pending">待处理 8</Card>
        <Card className="dashboard-page__metric" data-wf-key="processing">处理中 5</Card>
        <Card className="dashboard-page__metric" data-wf-key="completed">已完成 21</Card>
      </Grid>
    </Column>
  )
}
```

## 导航示例

```jsx
/**
 * @wireframe-skill multi-screen-wireframe@1.7.0
 * 创建基于 v1.7.0
 * 修改基于 v1.7.0
 */
import { Card, Column, Heading, Row } from '../../framework/lib/ui/index.js'

export function ProductsScreen() {
  return (
    <Column id="products-page" className="products-page" gap={12} style={{ padding: 24 }}>
      <Heading id="products-title" className="products-page__title" level={1}>产品</Heading>
      <Card id="products-featured" className="products-page__featured" to="product-detail">打开产品详情</Card>
      <Row className="products-page__detail-row" to="product-detail" gap={8} alignItems="center">
        <Heading className="products-page__detail-title" level={3}>也可直接点整行</Heading>
      </Row>
    </Column>
  )
}
```

同时在 `src/project.js` 中保证目标存在，并把边写入来源 screen：

```js
{
  id: 'products',
  component: ProductsScreen,
  links: ['product-detail'],
}
```

## 移动端示例

App / 小程序带底栏时，用 `MobileShell`（或全高 Column 末尾放 `TabBar`，库样式会 `margin-top: auto` 贴底）。不要把 TabBar 夹在内容中间。

```jsx
/**
 * @wireframe-skill multi-screen-wireframe@1.7.0
 * 创建基于 v1.7.0
 * 修改基于 v1.7.0
 */
import { Column, Heading, MobileShell, Text } from '../../framework/lib/ui/index.js'
import { useScreenId } from '../../framework/lib/core/ScreenIdentity.jsx'

const tabs = [
  { label: '首页', to: 'home' },
  { label: '发现', to: 'discover' },
  { label: '我的', to: 'profile' },
]

export function DiscoverScreen() {
  const screenId = useScreenId()
  return (
    <MobileShell className="discover-layout" tabs={tabs} activeId={screenId}>
      <Column id="discover-page" className="discover-page" gap={12} style={{ padding: 16 }}>
        <Heading id="discover-title" className="discover-page__title" level={1}>发现</Heading>
        <Text className="discover-page__description">页面内容放在壳子里，底栏自动贴底。</Text>
      </Column>
    </MobileShell>
  )
}
```

## 弹窗示例

```jsx
/**
 * @wireframe-skill multi-screen-wireframe@1.7.0
 * 创建基于 v1.7.0
 * 修改基于 v1.7.0
 */
import { Button, Column, ConfirmDialog, Heading } from '../../framework/lib/ui/index.js'

export function DeleteScreen() {
  const [open, setOpen] = React.useState(false)

  return (
    <Column id="delete-page" className="delete-page" gap={16} style={{ padding: 24 }}>
      <Heading id="delete-title" className="delete-page__title" level={1}>删除记录</Heading>
      <Button id="delete-open-dialog" className="delete-page__open-dialog" onClick={() => setOpen(true)}>删除</Button>
      <ConfirmDialog
        id="delete-confirm-dialog"
        className="delete-page__confirm-dialog"
        open={open}
        title="确认删除"
        message="删除后无法恢复。"
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      />
    </Column>
  )
}
```
