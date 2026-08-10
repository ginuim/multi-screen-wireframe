/**
 * @wireframe-skill multi-screen-wireframe@1.8.0
 * 创建基于 v1.5.1
 * 修改基于 v1.8.0
 */
import {
  Badge,
  Button,
  Card,
  Column,
  PageHeader,
  Row,
  Text,
} from '../../../../starter/framework/lib/ui/index.js'
import { AppShell } from '../layouts/AppShell.jsx'

const HISTORY = [
  {
    id: 'hist-1',
    method: 'GET',
    name: 'List Users',
    url: 'https://api.staging.example.com/v1/users?page=1',
    status: '200',
    time: '142 ms',
    at: '今天 14:21:08',
  },
  {
    id: 'hist-2',
    method: 'POST',
    name: 'Create Order',
    url: 'https://api.staging.example.com/v1/orders',
    status: '201',
    time: '310 ms',
    at: '今天 13:55:41',
  },
  {
    id: 'hist-3',
    method: 'POST',
    name: 'Login',
    url: 'https://api.staging.example.com/v1/auth/login',
    status: '200',
    time: '98 ms',
    at: '今天 11:02:17',
  },
  {
    id: 'hist-4',
    method: 'GET',
    name: 'Get Invoice',
    url: 'https://api.staging.example.com/v1/billing/invoices/inv_88',
    status: '404',
    time: '67 ms',
    at: '昨天 19:44:03',
  },
  {
    id: 'hist-5',
    method: 'PATCH',
    name: 'Update User',
    url: 'https://api.staging.example.com/v1/users/u_1001',
    status: '200',
    time: '188 ms',
    at: '昨天 16:12:50',
  },
  {
    id: 'hist-6',
    method: 'DELETE',
    name: 'Revoke Token',
    url: 'https://api.staging.example.com/v1/auth/token',
    status: '204',
    time: '54 ms',
    at: '08-08 21:06:22',
  },
]

export function HistoryScreen() {
  return (
    <AppShell>
      <Column id="history-page" className="history__page" gap={16} style={{ padding: 24 }}>
        <PageHeader
          id="history-header"
          titleId="history-title"
          className="history__header"
          title="历史记录"
          subtitle="本机最近发送的请求，可重新打开到编辑器"
          actions={
            <Row className="history__header-actions" gap={8}>
              <Button className="history__action-clear">清空历史</Button>
              <Button className="history__action-workspace" to="workspace">返回工作区</Button>
            </Row>
          }
        />

        <Column id="history-list" className="history__list" gap={10}>
          {HISTORY.map((item) => (
            <Card
              key={item.id}
              className="history__item"
              data-wf-key={item.id}
              to="request-editor"
              style={{ padding: 12 }}
            >
              <Row className="history__item-row" alignItems="center" gap={12}>
                <Badge className="history__item-method">{item.method}</Badge>
                <Column className="history__item-copy" gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <strong className="history__item-name">{item.name}</strong>
                  <Text className="history__item-url" style={{ fontSize: 12 }}>{item.url}</Text>
                  <Text className="history__item-at" style={{ fontSize: 12, color: 'var(--wf-600)' }}>
                    {item.at}
                  </Text>
                </Column>
                <Badge className="history__item-status">{item.status}</Badge>
                <Badge className="history__item-time">{item.time}</Badge>
                <Button className="history__item-open" to="request-editor">打开</Button>
              </Row>
            </Card>
          ))}
        </Column>
      </Column>
    </AppShell>
  )
}
