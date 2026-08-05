# JSX 编辑示例

以下四段都是完整 screen，可直接保存到 `src/screens/`。保存后在 `src/project.js` 导入组件、加入 screen，并更新相关 `links`。

组件从 `../../lib/ui/index.js` 导入（`src/layouts/` 下按层级使用正确相对路径）。

## 页面示例

```jsx
import { Column, Heading, Text } from '../../lib/ui/index.js'

export function AboutScreen() {
  return (
    <Column gap={12} style={{ padding: 24 }}>
      <Heading level={1}>关于项目</Heading>
      <Text>这里填写页面说明。</Text>
    </Column>
  )
}
```

## 布局示例

```jsx
import { Card, Column, Grid, Heading, Row, Text } from '../../lib/ui/index.js'

export function DashboardScreen() {
  return (
    <Column gap={16} style={{ padding: 24 }}>
      <Row alignItems="center" justifyContent="space-between">
        <Heading level={1}>概览</Heading>
        <Text>今日</Text>
      </Row>
      <Grid columns={{ mobile: 1, desktop: 3 }} gap={12}>
        <Card>待处理 8</Card>
        <Card>处理中 5</Card>
        <Card>已完成 21</Card>
      </Grid>
    </Column>
  )
}
```

## 导航示例

```jsx
import { Card, Column, Heading, Row } from '../../lib/ui/index.js'

export function ProductsScreen() {
  return (
    <Column gap={12} style={{ padding: 24 }}>
      <Heading level={1}>产品</Heading>
      <Card to="product-detail">打开产品详情</Card>
      <Row to="product-detail" gap={8} alignItems="center">
        <Heading level={3}>也可直接点整行</Heading>
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
import { Column, Heading, MobileShell, Text } from '../../lib/ui/index.js'
import { useScreenId } from '../../lib/core/ScreenIdentity.jsx'

const tabs = [
  { label: '首页', to: 'home' },
  { label: '发现', to: 'discover' },
  { label: '我的', to: 'profile' },
]

export function DiscoverScreen() {
  const screenId = useScreenId()
  return (
    <MobileShell tabs={tabs} activeId={screenId}>
      <Column gap={12} style={{ padding: 16 }}>
        <Heading level={1}>发现</Heading>
        <Text>页面内容放在壳子里，底栏自动贴底。</Text>
      </Column>
    </MobileShell>
  )
}
```

## 弹窗示例

```jsx
import { Button, Column, ConfirmDialog, Heading } from '../../lib/ui/index.js'

export function DeleteScreen() {
  const [open, setOpen] = React.useState(false)

  return (
    <Column gap={16} style={{ padding: 24 }}>
      <Heading level={1}>删除记录</Heading>
      <Button onClick={() => setOpen(true)}>删除</Button>
      <ConfirmDialog
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
