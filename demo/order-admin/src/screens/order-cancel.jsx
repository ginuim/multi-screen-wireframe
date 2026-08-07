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
      <PageHeader title="取消订单" subtitle="订单 SO-1001" />
      <Card>
        <Column gap={16}>
          <FormField label="取消原因" htmlFor="reason">
            <Select id="reason" defaultValue="customer">
              <option value="customer">客户申请</option>
              <option value="inventory">库存不足</option>
            </Select>
          </FormField>
          <FormField label="备注" htmlFor="note">
            <TextArea id="note" placeholder="填写补充说明" />
          </FormField>
          <Button variant="primary" onClick={() => setOpen(true)}>提交取消</Button>
        </Column>
      </Card>
      <ConfirmDialog
        open={open}
        title="确认取消订单"
        message="此操作将更新订单状态。"
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      />
    </AdminLayout>
  )
}
