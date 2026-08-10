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
  DataTable,
  PageHeader,
  Row,
  Select,
  Text,
} from '../../../../starter/framework/lib/ui/index.js'
import { AppShell } from '../layouts/AppShell.jsx'

const ENV_LIST = [
  { id: 'env-staging', name: 'Staging', active: true, vars: 6 },
  { id: 'env-prod', name: 'Production', active: false, vars: 6 },
  { id: 'env-local', name: 'Local', active: false, vars: 4 },
]

const VAR_ROWS = [
  { id: 'v-base', key: 'baseUrl', initial: 'https://api.staging.example.com', current: 'https://api.staging.example.com' },
  { id: 'v-token', key: 'token', initial: 'st_demo_****', current: 'st_demo_****' },
  { id: 'v-tenant', key: 'tenantId', initial: 'tn_10086', current: 'tn_10086' },
  { id: 'v-timeout', key: 'timeoutMs', initial: '15000', current: '15000' },
  { id: 'v-locale', key: 'locale', initial: 'zh-CN', current: 'zh-CN' },
]

const VAR_COLUMNS = [
  { key: 'key', label: 'Variable' },
  { key: 'initial', label: 'Initial Value' },
  { key: 'current', label: 'Current Value' },
]

export function EnvironmentsScreen() {
  return (
    <AppShell>
      <Column id="environments-page" className="environments__page" gap={16} style={{ padding: 24 }}>
        <PageHeader
          id="environments-header"
          titleId="environments-title"
          className="environments__header"
          title="环境变量"
          subtitle="在请求 URL / Header / Body 中通过 {{var}} 引用"
          actions={
            <Row className="environments__header-actions" gap={8}>
              <Button className="environments__action-workspace" to="workspace">返回工作区</Button>
              <Button className="environments__action-add" variant="primary">添加变量</Button>
            </Row>
          }
        />

        <Row id="environments-picker" className="environments__picker" gap={12} alignItems="center">
          <Text className="environments__picker-label">当前环境</Text>
          <Select className="environments__select" defaultValue="Staging" style={{ width: 200 }}>
            <option>Staging</option>
            <option>Production</option>
            <option>Local</option>
          </Select>
          <Badge className="environments__active-badge">Active</Badge>
        </Row>

        <Row id="environments-cards" className="environments__cards" gap={12}>
          {ENV_LIST.map((env) => (
            <Card
              key={env.id}
              className="environments__card"
              data-wf-key={env.id}
              style={{ flex: 1, padding: 14 }}
            >
              <Row className="environments__card-row" alignItems="center" justifyContent="space-between">
                <strong className="environments__card-name">{env.name}</strong>
                {env.active ? <Badge className="environments__card-badge">使用中</Badge> : null}
              </Row>
              <Text className="environments__card-meta" style={{ fontSize: 12, marginTop: 6 }}>
                {env.vars} 个变量
              </Text>
            </Card>
          ))}
        </Row>

        <Column id="environments-table-wrap" className="environments__table-wrap" gap={10}>
          <Text className="environments__table-title" style={{ fontWeight: 600 }}>Staging 变量</Text>
          <DataTable
            id="environments-table"
            className="environments__table"
            columns={VAR_COLUMNS}
            rows={VAR_ROWS}
          />
        </Column>
      </Column>
    </AppShell>
  )
}
