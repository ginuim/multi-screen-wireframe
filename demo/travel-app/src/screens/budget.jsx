/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.5.1
 * 修改基于 v1.5.1
 */
import {
  Avatar,
  Button,
  Card,
  Column,
  DataTable,
  FormField,
  Modal,
  PageHeader,
  Row,
  Text,
  TextInput,
} from '../../../../starter/framework/lib/ui/index.js'
import { MobileLayout } from '../layouts/MobileLayout.jsx'

const COSTS = [
  { id: 'cost-transit', item: '市内交通', owner: '共同', amount: '48' },
  { id: 'cost-ticket', item: '展厅门票', owner: '林晓野', amount: '80' },
  { id: 'cost-lunch', item: '午餐', owner: '共同', amount: '180' },
  { id: 'cost-market', item: '市集预留', owner: '个人', amount: '120' },
]

export function BudgetScreen() {
  const [inviteOpen, setInviteOpen] = React.useState(false)
  return (
    <MobileLayout>
      <Column id="budget-page" gap={18} className="weekend-page budget__page">
        <PageHeader id="budget-header" titleId="budget-title" className="budget__header" title="预算与同行人" subtitle="为行程预留费用并邀请伙伴" actions={<Button className="budget__back" to="trip-confirm">返回</Button>} />
        <Card id="budget-summary" className="budget__summary">
          <Column className="budget__summary-body" gap={6}>
            <Text className="budget__summary-label">预计总费用</Text>
            <strong className="budget__summary-value">428 元</strong>
            <Text className="budget__summary-note">按 3 位同行人计算，人均约 143 元</Text>
          </Column>
        </Card>
        <DataTable id="budget-table" className="budget__table" columns={[{ key: 'item', label: '项目' }, { key: 'owner', label: '承担' }, { key: 'amount', label: '金额' }]} rows={COSTS} getRowKey={(row) => row.id} />
        <Column id="budget-members" className="budget__members" gap={12}>
          <Row className="budget__members-heading" alignItems="center" justifyContent="space-between">
            <Text className="budget__members-label">同行人</Text>
            <Button id="budget-invite-action" className="budget__invite-action" onClick={() => setInviteOpen(true)}>邀请</Button>
          </Row>
          <Row className="budget__member-stack" gap={14}>
            <Column className="budget__member" data-wf-key="member-lin" gap={5} alignItems="center"><Avatar className="budget__member-avatar" label="林晓野" /><Text className="budget__member-name">林晓野</Text></Column>
            <Column className="budget__member" data-wf-key="member-chen" gap={5} alignItems="center"><Avatar className="budget__member-avatar" label="陈榆" /><Text className="budget__member-name">陈榆</Text></Column>
            <Column className="budget__member" data-wf-key="member-zhou" gap={5} alignItems="center"><Avatar className="budget__member-avatar" label="周岸" /><Text className="budget__member-name">周岸</Text></Column>
          </Row>
        </Column>
        <Button id="budget-done" className="budget__done" variant="primary" to="trip-confirm">保存预算</Button>
        <Modal
          id="budget-invite-modal"
          className="budget__invite-modal"
          open={inviteOpen}
          title="邀请同行人"
          onClose={() => setInviteOpen(false)}
          actions={<Button className="budget__invite-submit" variant="primary" onClick={() => setInviteOpen(false)}>发送邀请</Button>}
        >
          <FormField className="budget__invite-field" label="手机号或用户名" htmlFor="budget-invite-input">
            <TextInput id="budget-invite-input" className="budget__invite-input" placeholder="输入同行人信息" />
          </FormField>
        </Modal>
      </Column>
    </MobileLayout>
  )
}
