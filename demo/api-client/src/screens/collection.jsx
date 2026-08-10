/**
 * @wireframe-skill multi-screen-wireframe@1.6.0
 * 创建基于 v1.5.1
 * 修改基于 v1.6.0
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

const FOLDERS = [
  {
    id: 'folder-users',
    name: 'Users',
    requests: [
      { id: 'req-list-users', method: 'GET', name: 'List Users', path: '/v1/users' },
      { id: 'req-get-user', method: 'GET', name: 'Get User', path: '/v1/users/:id' },
      { id: 'req-update-user', method: 'PATCH', name: 'Update User', path: '/v1/users/:id' },
      { id: 'req-disable-user', method: 'POST', name: 'Disable User', path: '/v1/users/:id/disable' },
    ],
  },
  {
    id: 'folder-roles',
    name: 'Roles',
    requests: [
      { id: 'req-list-roles', method: 'GET', name: 'List Roles', path: '/v1/roles' },
      { id: 'req-assign-role', method: 'PUT', name: 'Assign Role', path: '/v1/users/:id/roles' },
    ],
  },
  {
    id: 'folder-audit',
    name: 'Audit',
    requests: [
      { id: 'req-audit-log', method: 'GET', name: 'Audit Log', path: '/v1/audit/logs' },
      { id: 'req-export-audit', method: 'POST', name: 'Export Audit', path: '/v1/audit/export' },
    ],
  },
]

export function CollectionScreen() {
  return (
    <AppShell
      aside={
        <Column id="collection-tree" className="collection__tree" gap={14}>
          <Row className="collection__tree-head" alignItems="center" justifyContent="space-between">
            <Heading className="collection__tree-title" level={3}>User API</Heading>
            <Button className="collection__tree-new" to="request-editor">+</Button>
          </Row>
          {FOLDERS.map((folder) => (
            <Column
              key={folder.id}
              className="collection__folder"
              data-wf-key={folder.id}
              gap={6}
            >
              <Text className="collection__folder-name" style={{ fontSize: 12, fontWeight: 600 }}>
                {folder.name}
              </Text>
              {folder.requests.map((req) => (
                <Card
                  key={req.id}
                  className="collection__request"
                  data-wf-key={req.id}
                  to="request-editor"
                  style={{ padding: '8px 10px' }}
                >
                  <Row className="collection__request-row" alignItems="center" gap={8}>
                    <Badge className="collection__request-method">{req.method}</Badge>
                    <Text className="collection__request-name" style={{ fontSize: 13 }}>{req.name}</Text>
                  </Row>
                </Card>
              ))}
            </Column>
          ))}
        </Column>
      }
    >
      <Column id="collection-page" className="collection__page" gap={16} style={{ padding: 24 }}>
        <PageHeader
          id="collection-header"
          titleId="collection-title"
          className="collection__header"
          title="User API"
          subtitle="Collection · 3 个文件夹 · 8 个请求"
          actions={
            <Row className="collection__header-actions" gap={8}>
              <Button className="collection__action-run" to="request-editor">Run collection</Button>
              <Button className="collection__action-new" to="request-editor" variant="primary">新建请求</Button>
            </Row>
          }
        />

        <Card id="collection-meta" className="collection__meta" style={{ padding: 14 }}>
          <Row className="collection__meta-row" gap={24}>
            <Column className="collection__meta-item" gap={4}>
              <Text className="collection__meta-label" style={{ fontSize: 12 }}>Base URL</Text>
              <strong className="collection__meta-value">{'{{baseUrl}}'}</strong>
            </Column>
            <Column className="collection__meta-item" gap={4}>
              <Text className="collection__meta-label" style={{ fontSize: 12 }}>授权</Text>
              <strong className="collection__meta-value">Bearer Token</strong>
            </Column>
            <Column className="collection__meta-item" gap={4}>
              <Text className="collection__meta-label" style={{ fontSize: 12 }}>更新</Text>
              <strong className="collection__meta-value">今天 10:24</strong>
            </Column>
          </Row>
        </Card>

        <Column id="collection-list" className="collection__list" gap={10}>
          <Heading className="collection__list-title" level={3}>全部请求</Heading>
          {FOLDERS.flatMap((folder) =>
            folder.requests.map((req) => (
              <Card
                key={req.id}
                className="collection__list-item"
                data-wf-key={`list-${req.id}`}
                to="request-editor"
                style={{ padding: 12 }}
              >
                <Row className="collection__list-row" alignItems="center" gap={12}>
                  <Badge className="collection__list-method">{req.method}</Badge>
                  <Column className="collection__list-copy" gap={2} style={{ flex: 1 }}>
                    <strong className="collection__list-name">{req.name}</strong>
                    <Text className="collection__list-path" style={{ fontSize: 12 }}>
                      {folder.name} · {req.path}
                    </Text>
                  </Column>
                  <Button className="collection__list-open" to="request-editor">打开</Button>
                </Row>
              </Card>
            )),
          )}
        </Column>
      </Column>
    </AppShell>
  )
}
