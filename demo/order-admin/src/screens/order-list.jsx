import {
  Badge,
  Card,
  DataTable,
  Heading,
  PageHeader,
  Text,
} from '../../../../starter/lib/ui/index.js'
import { AdminLayout } from '../layouts/AdminLayout.jsx'

const rows = [
  { id: 'SO-1001', customer: '示例客户甲', amount: '1,280.00', status: '待处理' },
  { id: 'SO-1002', customer: '示例客户乙', amount: '860.00', status: '处理中' },
  { id: 'SO-1003', customer: '示例客户丙', amount: '2,400.00', status: '已完成' },
]

const columns = [
  { key: 'id', label: '订单号' },
  { key: 'customer', label: '客户' },
  { key: 'amount', label: '金额' },
  { key: 'status', label: '状态', render: (value) => <Badge>{value}</Badge> },
]

export function OrderListScreen() {
  return (
    <AdminLayout>
      <PageHeader title="订单列表" subtitle="共 3 条演示数据" />
      <Card to="order-detail">
        <Heading level={3}>待处理订单</Heading>
        <Text>打开 SO-1001 详情</Text>
      </Card>
      <DataTable columns={columns} rows={rows} />
    </AdminLayout>
  )
}
