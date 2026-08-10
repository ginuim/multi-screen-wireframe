/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.5.1
 * 修改基于 v1.5.1
 */
import {
  Badge,
  Button,
  Card,
  Column,
  Heading,
  PageHeader,
  Row,
  Text,
} from '../../../../starter/framework/lib/ui/index.js'
import { AppShell } from '../layouts/AppShell.jsx'

const COLLECTIONS = [
  {
    id: 'col-users',
    name: 'User API',
    desc: '用户列表、详情、更新与禁用',
    count: 6,
    updatedAt: '今天 10:24',
  },
  {
    id: 'col-orders',
    name: 'Order API',
    desc: '订单查询、创建、取消、履约状态',
    count: 9,
    updatedAt: '昨天 18:02',
  },
  {
    id: 'col-auth',
    name: 'Auth',
    desc: '登录、刷新 Token、登出',
    count: 4,
    updatedAt: '08-08 14:11',
  },
  {
    id: 'col-billing',
    name: 'Billing',
    desc: '账单、发票、支付回调',
    count: 5,
    updatedAt: '08-07 09:40',
  },
]

const RECENT = [
  { id: 'req-list-users', method: 'GET', name: 'List Users', path: '/v1/users', status: '200' },
  { id: 'req-create-order', method: 'POST', name: 'Create Order', path: '/v1/orders', status: '201' },
  { id: 'req-login', method: 'POST', name: 'Login', path: '/v1/auth/login', status: '200' },
  { id: 'req-get-invoice', method: 'GET', name: 'Get Invoice', path: '/v1/billing/invoices/:id', status: '404' },
]

export function WorkspaceScreen() {
  return (
    <AppShell
      aside={
        <Column id="workspace-aside" className="workspace__aside" gap={12}>
          <Row className="workspace__aside-head" alignItems="center" justifyContent="space-between">
            <Heading className="workspace__aside-title" level={3}>Collections</Heading>
            <Button className="workspace__aside-new" to="collection">新建</Button>
          </Row>
          {COLLECTIONS.map((item) => (
            <Card
              key={item.id}
              className="workspace__collection-card"
              data-wf-key={item.id}
              to="collection"
              style={{ padding: 10 }}
            >
              <Row className="workspace__collection-row" alignItems="center" justifyContent="space-between" gap={8}>
                <strong className="workspace__collection-name">{item.name}</strong>
                <Badge className="workspace__collection-count">{item.count}</Badge>
              </Row>
              <Text className="workspace__collection-desc" style={{ fontSize: 12, marginTop: 4 }}>
                {item.desc}
              </Text>
            </Card>
          ))}
        </Column>
      }
    >
      <Column id="workspace-page" className="workspace__page" gap={16} style={{ padding: 24 }}>
        <PageHeader
          id="workspace-header"
          titleId="workspace-title"
          className="workspace__header"
          title="工作区"
          subtitle="选择 Collection 打开请求，或从最近记录继续编辑"
          actions={
            <Row className="workspace__header-actions" gap={8}>
              <Button className="workspace__action-env" to="environments">切换环境</Button>
              <Button className="workspace__action-new" to="request-editor" variant="primary">新建请求</Button>
            </Row>
          }
        />

        <Card id="workspace-welcome" className="workspace__welcome" style={{ padding: 16 }}>
          <Heading className="workspace__welcome-title" level={3}>Demo Workspace</Heading>
          <Text className="workspace__welcome-copy">
            当前环境：Staging · Base URL 使用 {'{{baseUrl}}'} · 共 4 个 Collection
          </Text>
        </Card>

        <Column id="workspace-recent" className="workspace__recent" gap={10}>
          <Heading className="workspace__recent-title" level={3}>最近请求</Heading>
          {RECENT.map((item) => (
            <Card
              key={item.id}
              className="workspace__recent-item"
              data-wf-key={item.id}
              to="request-editor"
              style={{ padding: 12 }}
            >
              <Row className="workspace__recent-row" alignItems="center" gap={12}>
                <Badge className="workspace__recent-method">{item.method}</Badge>
                <Column className="workspace__recent-copy" gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <strong className="workspace__recent-name">{item.name}</strong>
                  <Text className="workspace__recent-path" style={{ fontSize: 12 }}>{item.path}</Text>
                </Column>
                <Badge className="workspace__recent-status">{item.status}</Badge>
              </Row>
            </Card>
          ))}
        </Column>

        <Row className="workspace__shortcuts" gap={12}>
          <Card className="workspace__shortcut" to="history" style={{ flex: 1, padding: 14 }}>
            <Heading className="workspace__shortcut-title" level={3}>历史记录</Heading>
            <Text className="workspace__shortcut-desc">查看本机发送过的请求</Text>
          </Card>
          <Card className="workspace__shortcut" to="settings" style={{ flex: 1, padding: 14 }}>
            <Heading className="workspace__shortcut-title" level={3}>设置</Heading>
            <Text className="workspace__shortcut-desc">代理、证书与通用偏好</Text>
          </Card>
        </Row>
      </Column>
    </AppShell>
  )
}
