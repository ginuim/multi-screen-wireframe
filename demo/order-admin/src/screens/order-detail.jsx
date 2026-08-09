/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.3.0
 * 修改基于 v1.5.1
 */
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
      <Column id="order-detail-page" className="order-detail__page" gap={16}>
        <PageHeader
          id="order-detail-header"
          titleId="order-detail-title"
          className="order-detail__header"
          title="订单 SO-1001"
          subtitle="创建于 2026-08-04"
          actions={<Button id="order-detail-cancel-action" className="order-detail__cancel-action" to="order-cancel">取消订单</Button>}
        />
        <Grid id="order-detail-summary" className="order-detail__summary" columns={2} gap={16}>
          <Card id="order-detail-customer-card" className="order-detail__customer-card">
            <Column className="order-detail__customer-content" gap={8}>
              <strong className="order-detail__section-title">客户信息</strong>
              <Text className="order-detail__customer-name">示例客户甲</Text>
              <Text className="order-detail__customer-type">企业客户</Text>
            </Column>
          </Card>
          <Card id="order-detail-amount-card" className="order-detail__amount-card">
            <Column className="order-detail__amount-content" gap={8}>
              <strong className="order-detail__section-title">订单金额</strong>
              <Text className="order-detail__amount-value">1,280.00</Text>
              <Text className="order-detail__payment-status">待支付</Text>
            </Column>
          </Card>
        </Grid>
      </Column>
    </AdminLayout>
  )
}
