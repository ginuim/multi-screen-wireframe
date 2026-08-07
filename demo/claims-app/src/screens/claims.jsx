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
      <Column gap={20} className="claims-page">
        <Heading level={1}>我的理赔</Heading>
        {claims.length === 0 ? (
          <EmptyState
            title="暂无理赔记录"
            description="新的申请会显示在这里。"
            action={<Button to="claim-apply">发起理赔</Button>}
          />
        ) : (
          <Column gap={0}>
            {claims.map((claim) => (
              <Cell
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
