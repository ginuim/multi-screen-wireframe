/**
 * @wireframe-skill multi-screen-wireframe@1.7.0
 * 创建基于 v1.5.1
 * 修改基于 v1.7.0
 */
import { Column, Row, SideNav, Text } from '../../../../starter/framework/lib/ui/index.js'
import { useScreenId } from '../../../../starter/framework/lib/core/ScreenIdentity.jsx'

const NAV_ITEMS = [
  { label: '工作区', to: 'workspace' },
  { label: 'Collections', to: 'collection' },
  { label: '环境', to: 'environments' },
  { label: '历史', to: 'history' },
  { label: '设置', to: 'settings' },
]

const ACTIVE_ALIAS = {
  'request-editor': 'collection',
}

export function AppShell({ children, aside }) {
  const screenId = useScreenId()
  const activeId = ACTIVE_ALIAS[screenId] || screenId

  return (
    <Row className="postman-shell" style={{ width: '100%', height: '100%', gap: 0 }}>
      <Column
        className="postman-shell__rail"
        gap={16}
        style={{
          width: 200,
          flexShrink: 0,
          padding: '20px 12px',
          borderRight: '1px solid var(--wf-300)',
          background: 'var(--wf-50)',
        }}
      >
        <Column className="postman-shell__brand" gap={4}>
          <strong className="postman-shell__brand-name" style={{ fontSize: 15 }}>API Client</strong>
          <Text className="postman-shell__brand-meta" style={{ fontSize: 12, color: 'var(--wf-600)' }}>
            Workspace · Demo
          </Text>
        </Column>
        <SideNav className="postman-shell__nav" activeId={activeId} items={NAV_ITEMS} />
      </Column>
      {aside ? (
        <Column
          className="postman-shell__aside"
          gap={12}
          style={{
            width: 260,
            flexShrink: 0,
            padding: '16px 12px',
            borderRight: '1px solid var(--wf-300)',
            overflow: 'auto',
            background: 'var(--wf-100)',
          }}
        >
          {aside}
        </Column>
      ) : null}
      <Column
        className="postman-shell__main"
        gap={0}
        style={{ flex: 1, minWidth: 0, overflow: 'auto' }}
      >
        {children}
      </Column>
    </Row>
  )
}
