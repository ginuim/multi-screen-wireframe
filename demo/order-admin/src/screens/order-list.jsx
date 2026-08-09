/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.3.0
 * 修改基于 v1.5.1
 */
import {
  Badge,
  Card,
  Column,
  DataTable,
  Heading,
  PageHeader,
  Text,
} from '../../../../starter/framework/lib/ui/index.js'
import { AdminLayout } from '../layouts/AdminLayout.jsx'

const rows = [
  {
    id: 'SO-1001',
    customer: '示例客户甲（华东区旗舰门店）',
    channel: '线下门店 / 上海静安',
    sku: 'WF-DESK-PRO-1200',
    warehouse: '华东一号仓-A12',
    amount: '1,280.00',
    paid: '0.00',
    logistics: '未发货 · 待调度',
    owner: '张三（客服一组）',
    createdAt: '2026-08-04 09:12:33',
    updatedAt: '2026-08-04 11:08:01',
    remark: '客户要求工作日上午配送，需开增值税专用发票',
    status: '待处理',
  },
  {
    id: 'SO-1002',
    customer: '示例客户乙（华南经销商）',
    channel: '经销商门户',
    sku: 'WF-CHAIR-STD-01',
    warehouse: '华南中转仓-B03',
    amount: '860.00',
    paid: '860.00',
    logistics: '运输中 · SF1234567890CN',
    owner: '李四（客服二组）',
    createdAt: '2026-08-03 14:22:10',
    updatedAt: '2026-08-05 08:41:55',
    remark: '已付款，收件人手机尾号 8899',
    status: '处理中',
  },
  {
    id: 'SO-1003',
    customer: '示例客户丙（华北企业采购）',
    channel: '企业采购 / 招标批次 #88',
    sku: 'WF-CABINET-XL-04',
    warehouse: '华北中央仓-C21',
    amount: '2,400.00',
    paid: '2,400.00',
    logistics: '已签收 · 2026-08-02',
    owner: '王五（大客户组）',
    createdAt: '2026-07-28 16:05:44',
    updatedAt: '2026-08-02 17:30:12',
    remark: '合同号 CN-2026-0728-004，验收合格',
    status: '已完成',
  },
]

const columns = [
  { key: 'id', label: '订单号' },
  { key: 'channel', label: '下单渠道' },
  { key: 'customer', label: '客户名称' },
  { key: 'sku', label: '主 SKU' },
  { key: 'warehouse', label: '发货仓' },
  { key: 'amount', label: '订单金额' },
  { key: 'paid', label: '已付金额' },
  { key: 'logistics', label: '物流状态' },
  { key: 'owner', label: '负责人' },
  { key: 'createdAt', label: '创建时间' },
  { key: 'updatedAt', label: '更新时间' },
  { key: 'remark', label: '备注' },
  { key: 'status', label: '状态', render: (value) => <Badge className="order-list__status">{value}</Badge> },
]

export function OrderListScreen() {
  return (
    <AdminLayout>
      <Column id="order-list-page" className="order-list__page" gap={16}>
        <PageHeader id="order-list-header" titleId="order-list-title" className="order-list__header" title="订单列表" subtitle="共 3 条演示数据 · 宽表横向滚动" />
        <Card id="order-list-featured-order" className="order-list__featured-order" to="order-detail">
          <Heading className="order-list__featured-title" level={3}>待处理订单</Heading>
          <Text className="order-list__featured-description">打开 SO-1001 详情</Text>
        </Card>
        <DataTable id="order-list-table" className="demo-wide-table order-list__table" columns={columns} rows={rows} />
      </Column>
    </AdminLayout>
  )
}
