/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.5.1
 * 修改基于 v1.5.1
 */
import {
  Button,
  Card,
  Column,
  FormField,
  PageHeader,
  Row,
  Text,
  TextInput,
  Toggle,
} from '../../../../starter/framework/lib/ui/index.js'
import { AppShell } from '../layouts/AppShell.jsx'

export function SettingsScreen() {
  const [ssl, setSsl] = React.useState(true)
  const [followRedirect, setFollowRedirect] = React.useState(true)
  const [proxy, setProxy] = React.useState(false)

  return (
    <AppShell>
      <Column id="settings-page" className="settings__page" gap={16} style={{ padding: 24 }}>
        <PageHeader
          id="settings-header"
          titleId="settings-title"
          className="settings__header"
          title="设置"
          subtitle="通用偏好、代理与证书（线框示意）"
          actions={
            <Button className="settings__action-workspace" to="workspace">返回工作区</Button>
          }
        />

        <Card id="settings-general" className="settings__section" style={{ padding: 16 }}>
          <Column className="settings__section-body" gap={14}>
            <Text className="settings__section-title" style={{ fontWeight: 600 }}>通用</Text>
            <FormField className="settings__field" label="默认超时（ms）" htmlFor="settings-timeout">
              <TextInput id="settings-timeout" className="settings__timeout" defaultValue="15000" />
            </FormField>
            <Row className="settings__toggle-row" alignItems="center" justifyContent="space-between">
              <Text className="settings__toggle-label">自动跟随重定向</Text>
              <Toggle
                id="settings-redirect"
                className="settings__redirect"
                checked={followRedirect}
                onChange={setFollowRedirect}
              />
            </Row>
            <Row className="settings__toggle-row" alignItems="center" justifyContent="space-between">
              <Text className="settings__toggle-label">校验证书（SSL）</Text>
              <Toggle
                id="settings-ssl"
                className="settings__ssl"
                checked={ssl}
                onChange={setSsl}
              />
            </Row>
          </Column>
        </Card>

        <Card id="settings-proxy" className="settings__section" style={{ padding: 16 }}>
          <Column className="settings__section-body" gap={14}>
            <Row className="settings__proxy-head" alignItems="center" justifyContent="space-between">
              <Text className="settings__section-title" style={{ fontWeight: 600 }}>代理</Text>
              <Toggle
                id="settings-proxy-toggle"
                className="settings__proxy-toggle"
                checked={proxy}
                onChange={setProxy}
                label={proxy ? '开启' : '关闭'}
              />
            </Row>
            <FormField className="settings__field" label="Host" htmlFor="settings-proxy-host">
              <TextInput id="settings-proxy-host" className="settings__proxy-host" defaultValue="127.0.0.1" />
            </FormField>
            <FormField className="settings__field" label="Port" htmlFor="settings-proxy-port">
              <TextInput id="settings-proxy-port" className="settings__proxy-port" defaultValue="7890" />
            </FormField>
          </Column>
        </Card>

        <Card id="settings-certs" className="settings__section" style={{ padding: 16 }}>
          <Column className="settings__section-body" gap={10}>
            <Text className="settings__section-title" style={{ fontWeight: 600 }}>证书</Text>
            <Text className="settings__certs-empty" style={{ fontSize: 13 }}>
              尚未添加客户端证书。生产环境可在此挂载 .pem / .p12。
            </Text>
            <Button className="settings__certs-add">添加证书</Button>
          </Column>
        </Card>
      </Column>
    </AppShell>
  )
}
