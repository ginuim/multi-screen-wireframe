/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.3.0
 * 修改基于 v1.5.1
 */
import {
  Button,
  Cell,
  Column,
  EmptyState,
  Heading,
} from '../../../../starter/framework/lib/ui/index.js'
import { MobileLayout } from '../layouts/MobileLayout.jsx'

const claims = []

export function ClaimsScreen() {
  return (
    <MobileLayout>
      <Column id="claims-list-page" gap={20} className="claims-page claims-list__page">
        <Heading id="claims-list-title" className="claims-list__title" level={1}>我的理赔</Heading>
        {claims.length === 0 ? (
          <EmptyState
            id="claims-list-empty-state"
            className="claims-list__empty-state"
            title="暂无理赔记录"
            description="新的申请会显示在这里。"
            action={<Button id="claims-list-apply-action" className="claims-list__apply-action" to="claim-apply">发起理赔</Button>}
          />
        ) : (
          <Column className="claims-list__records" gap={0}>
            {claims.map((claim) => (
              <Cell
                className="claims-list__record"
                data-wf-key={claim.id}
                key={claim.id}
                title={claim.title}
                subtitle={claim.status}
                value={claim.date}
              />
            ))}
          </Column>
        )}
      </Column>
    </MobileLayout>
  )
}
