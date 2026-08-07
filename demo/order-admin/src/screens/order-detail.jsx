import {
  Button,
  Card,
  Column,
  Grid,
  PageHeader,
  Text,
} from '../../../../starter/framework/lib/ui/index.js'
import { AdminLayout } from '../layouts/AdminLayout.jsx'

export function OrderDetailScreen() {
  return (
    <AdminLayout>
      <PageHeader
        title="订单 SO-1001"
        subtitle="创建于 2026-08-04"
        actions={<Button to="order-cancel">取消订单</Button>}
      />
      <Grid columns={2} gap={16}>
        <Card>
          <Column gap={8}>
            <strong>客户信息</strong>
            <Text>示例客户甲</Text>
            <Text>企业客户</Text>
          </Column>
        </Card>
        <Card>
          <Column gap={8}>
            <strong>订单金额</strong>
            <Text>1,280.00</Text>
            <Text>待支付</Text>
          </Column>
        </Card>
      </Grid>
    </AdminLayout>
  )
}
