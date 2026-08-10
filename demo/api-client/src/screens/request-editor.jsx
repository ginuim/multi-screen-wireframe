/**
 * @wireframe-skill multi-screen-wireframe@1.7.0
 * 创建基于 v1.5.1
 * 修改基于 v1.7.0
 */
import {
  Badge,
  Button,
  Card,
  Column,
  DataTable,
  Heading,
  PageHeader,
  Row,
  Select,
  Tabs,
  Text,
  TextArea,
  TextInput,
} from '../../../../starter/framework/lib/ui/index.js'
import { AppShell } from '../layouts/AppShell.jsx'

const PARAM_ROWS = [
  { id: 'p-page', key: 'page', value: '1', desc: '页码' },
  { id: 'p-size', key: 'size', value: '20', desc: '每页条数' },
  { id: 'p-q', key: 'q', value: 'alice', desc: '关键字搜索' },
  { id: 'p-status', key: 'status', value: 'active', desc: '用户状态' },
]

const HEADER_ROWS = [
  { id: 'h-auth', key: 'Authorization', value: 'Bearer {{token}}', desc: '访问令牌' },
  { id: 'h-accept', key: 'Accept', value: 'application/json', desc: '' },
  { id: 'h-trace', key: 'X-Request-Id', value: '{{$guid}}', desc: '链路追踪' },
  { id: 'h-client', key: 'X-Client', value: 'api-client-demo', desc: '' },
]

const PARAM_COLUMNS = [
  { key: 'key', label: 'Key' },
  { key: 'value', label: 'Value' },
  { key: 'desc', label: 'Description' },
]

const RESPONSE_JSON = `{
  "data": [
    { "id": "u_1001", "name": "Alice", "role": "admin" },
    { "id": "u_1002", "name": "Bob", "role": "editor" },
    { "id": "u_1003", "name": "Carol", "role": "viewer" }
  ],
  "page": 1,
  "total": 128
}`

export function RequestEditorScreen() {
  const [tab, setTab] = React.useState('params')
  const [respTab, setRespTab] = React.useState('body')

  return (
    <AppShell>
      <Column id="request-editor-page" className="request-editor__page" gap={0} style={{ height: '100%' }}>
        <Column className="request-editor__top" gap={12} style={{ padding: '16px 24px 12px', borderBottom: '1px solid var(--wf-300)' }}>
          <PageHeader
            id="request-editor-header"
            titleId="request-editor-title"
            className="request-editor__header"
            title="List Users"
            subtitle="User API / Users"
            actions={
              <Row className="request-editor__header-actions" gap={8}>
                <Button className="request-editor__action-collection" to="collection">返回 Collection</Button>
                <Button className="request-editor__action-save" to="collection">Save</Button>
              </Row>
            }
          />

          <Row id="request-editor-urlbar" className="request-editor__urlbar" gap={8} alignItems="center">
            <Select className="request-editor__method" defaultValue="GET" style={{ width: 110 }}>
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
              <option>DELETE</option>
            </Select>
            <TextInput
              id="request-editor-url"
              className="request-editor__url"
              defaultValue="{{baseUrl}}/v1/users"
              style={{ flex: 1 }}
            />
            <Select className="request-editor__env" defaultValue="Staging" style={{ width: 140 }}>
              <option>Staging</option>
              <option>Production</option>
              <option>Local</option>
            </Select>
            <Button id="request-editor-send" className="request-editor__send" variant="primary">
              Send
            </Button>
          </Row>

          <Tabs
            id="request-editor-tabs"
            className="request-editor__tabs"
            activeId={tab}
            onChange={setTab}
            items={[
              { id: 'params', label: 'Params' },
              { id: 'headers', label: 'Headers' },
              { id: 'body', label: 'Body' },
              { id: 'auth', label: 'Authorization' },
            ]}
          />

          {tab === 'params' ? (
            <DataTable
              id="request-editor-params"
              className="request-editor__params"
              columns={PARAM_COLUMNS}
              rows={PARAM_ROWS}
            />
          ) : null}

          {tab === 'headers' ? (
            <DataTable
              id="request-editor-headers"
              className="request-editor__headers"
              columns={PARAM_COLUMNS}
              rows={HEADER_ROWS}
            />
          ) : null}

          {tab === 'body' ? (
            <Card id="request-editor-body" className="request-editor__body" style={{ padding: 12 }}>
              <Row className="request-editor__body-toolbar" gap={8} style={{ marginBottom: 8 }}>
                <Badge className="request-editor__body-type">raw</Badge>
                <Badge className="request-editor__body-format">JSON</Badge>
              </Row>
              <TextArea
                className="request-editor__body-input"
                rows={6}
                defaultValue={'{\n  "note": "GET 请求通常无 Body，此处仅示意编辑区"\n}'}
              />
            </Card>
          ) : null}

          {tab === 'auth' ? (
            <Card id="request-editor-auth" className="request-editor__auth" style={{ padding: 14 }}>
              <Column className="request-editor__auth-fields" gap={10}>
                <Row className="request-editor__auth-row" gap={12} alignItems="center">
                  <Text className="request-editor__auth-label" style={{ width: 80 }}>Type</Text>
                  <Select className="request-editor__auth-type" defaultValue="Bearer Token" style={{ width: 200 }}>
                    <option>Bearer Token</option>
                    <option>API Key</option>
                    <option>Basic Auth</option>
                    <option>No Auth</option>
                  </Select>
                </Row>
                <Row className="request-editor__auth-row" gap={12} alignItems="center">
                  <Text className="request-editor__auth-label" style={{ width: 80 }}>Token</Text>
                  <TextInput
                    className="request-editor__auth-token"
                    defaultValue="{{token}}"
                    style={{ flex: 1 }}
                  />
                </Row>
              </Column>
            </Card>
          ) : null}
        </Column>

        <Column
          id="request-editor-response"
          className="request-editor__response"
          gap={10}
          style={{ flex: 1, padding: 24, background: 'var(--wf-50)', minHeight: 280 }}
        >
          <Row className="request-editor__response-head" alignItems="center" justifyContent="space-between">
            <Heading className="request-editor__response-title" level={3}>Response</Heading>
            <Row className="request-editor__response-meta" gap={8}>
              <Badge className="request-editor__status">200 OK</Badge>
              <Badge className="request-editor__time">142 ms</Badge>
              <Badge className="request-editor__size">3.2 KB</Badge>
            </Row>
          </Row>

          <Tabs
            id="request-editor-response-tabs"
            className="request-editor__response-tabs"
            activeId={respTab}
            onChange={setRespTab}
            items={[
              { id: 'body', label: 'Body' },
              { id: 'headers', label: 'Headers' },
              { id: 'cookies', label: 'Cookies' },
            ]}
          />

          {respTab === 'body' ? (
            <Card id="request-editor-response-body" className="request-editor__response-body" style={{ padding: 12 }}>
              <pre
                className="request-editor__response-json"
                style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, monospace' }}
              >
                {RESPONSE_JSON}
              </pre>
            </Card>
          ) : null}

          {respTab === 'headers' ? (
            <DataTable
              id="request-editor-response-headers"
              className="request-editor__response-headers"
              columns={[
                { key: 'key', label: 'Header' },
                { key: 'value', label: 'Value' },
              ]}
              rows={[
                { id: 'rh-ct', key: 'content-type', value: 'application/json; charset=utf-8' },
                { id: 'rh-cache', key: 'cache-control', value: 'no-store' },
                { id: 'rh-req', key: 'x-request-id', value: 'req_8f3a2c' },
              ]}
            />
          ) : null}

          {respTab === 'cookies' ? (
            <Card id="request-editor-cookies" className="request-editor__cookies" style={{ padding: 16 }}>
              <Text className="request-editor__cookies-empty">本次响应未设置 Cookie</Text>
            </Card>
          ) : null}
        </Column>
      </Column>
    </AppShell>
  )
}
