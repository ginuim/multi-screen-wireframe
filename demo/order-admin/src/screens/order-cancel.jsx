/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.3.0
 * 修改基于 v1.5.1
 */
import {
  Button,
  Card,
  Column,
  ConfirmDialog,
  FormField,
  PageHeader,
  Select,
  TextArea,
} from '../../../../starter/framework/lib/ui/index.js'
import { AdminLayout } from '../layouts/AdminLayout.jsx'

export function OrderCancelScreen() {
  const [open, setOpen] = React.useState(false)
  return (
    <AdminLayout>
      <Column id="order-cancel-page" className="order-cancel__page" gap={16}>
        <PageHeader id="order-cancel-header" titleId="order-cancel-title" className="order-cancel__header" title="取消订单" subtitle="订单 SO-1001" />
        <Card id="order-cancel-form-card" className="order-cancel__form-card">
          <Column className="order-cancel__form" gap={16}>
            <FormField className="order-cancel__reason-field" label="取消原因" htmlFor="order-cancel-reason">
              <Select id="order-cancel-reason" className="order-cancel__reason-select" defaultValue="customer">
                <option className="order-cancel__reason-option" value="customer">客户申请</option>
                <option className="order-cancel__reason-option" value="inventory">库存不足</option>
              </Select>
            </FormField>
            <FormField className="order-cancel__note-field" label="备注" htmlFor="order-cancel-note">
              <TextArea id="order-cancel-note" className="order-cancel__note-input" placeholder="填写补充说明" />
            </FormField>
            <Button id="order-cancel-submit" className="order-cancel__submit" variant="primary" onClick={() => setOpen(true)}>提交取消</Button>
          </Column>
        </Card>
        <ConfirmDialog
          id="order-cancel-confirm-dialog"
          className="order-cancel__confirm-dialog"
          open={open}
          title="确认取消订单"
          message="此操作将更新订单状态。"
          onCancel={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
        />
      </Column>
    </AdminLayout>
  )
}
