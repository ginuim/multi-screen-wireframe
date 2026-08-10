/**
 * @wireframe-skill multi-screen-wireframe@1.8.0
 * 创建基于 v1.5.1
 * 修改基于 v1.8.0
 */
import {
  Badge,
  Button,
  Card,
  Cell,
  Column,
  ConfirmDialog,
  LoadingOverlay,
  PageHeader,
  Row,
  Steps,
  Text,
  Toast,
} from '../../../../starter/framework/lib/ui/index.js'
import { MobileLayout } from '../layouts/MobileLayout.jsx'

export function TripConfirmScreen() {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  const submitTrip = () => {
    setConfirmOpen(false)
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setSaved(true)
    }, 700)
  }

  return (
    <MobileLayout>
      <Column id="trip-confirm-page" gap={18} className="weekend-page trip-confirm__page">
        <PageHeader id="trip-confirm-header" titleId="trip-confirm-title" className="trip-confirm__header" title="确认行程" subtitle="检查信息后保存到我的行程" />
        <Steps id="trip-confirm-steps" className="trip-confirm__steps" current={2} items={[{ id: 'basic', label: '基本信息' }, { id: 'budget', label: '预算' }, { id: 'confirm', label: '确认' }]} />
        <Card id="trip-confirm-summary" className="trip-confirm__summary">
          <Column className="trip-confirm__summary-body" gap={10}>
            <Row className="trip-confirm__summary-heading" alignItems="center" justifyContent="space-between" gap={8}>
              <strong className="trip-confirm__trip-name">周六运河散步</strong>
              <Badge className="trip-confirm__status">待保存</Badge>
            </Row>
            <Text className="trip-confirm__date">2026 年 8 月 15 日 · 周六</Text>
            <Text className="trip-confirm__route">运河边的一天 · 8.6 km · 约 6 小时</Text>
          </Column>
        </Card>
        <Column id="trip-confirm-details" className="trip-confirm__details" gap={0}>
          <Cell className="trip-confirm__detail" title="集合地点" subtitle="运河路地铁站 3 号口" />
          <Cell className="trip-confirm__detail" title="行程节奏" value="轻松" />
          <Cell className="trip-confirm__detail" title="同行人数" value="3 人" />
          <Cell className="trip-confirm__detail" title="出发提醒" value="已开启" />
        </Column>
        <Card id="trip-confirm-budget" className="trip-confirm__budget" to="budget">
          <Row className="trip-confirm__budget-body" alignItems="center" justifyContent="space-between">
            <Column className="trip-confirm__budget-copy" gap={5}>
              <Text className="trip-confirm__budget-label">预计总费用</Text>
              <Text className="trip-confirm__budget-note">查看明细与同行人</Text>
            </Column>
            <span className="trip-confirm__total">428 元</span>
          </Row>
        </Card>
        <Column id="trip-confirm-actions" className="trip-confirm__actions" gap={10}>
          <Button id="trip-confirm-submit" className="trip-confirm__submit" variant="primary" onClick={() => setConfirmOpen(true)}>确认并保存</Button>
          <Button className="trip-confirm__trips-action" to="trips">查看我的行程</Button>
        </Column>
        <ConfirmDialog
          id="trip-confirm-dialog"
          className="trip-confirm__dialog"
          open={confirmOpen}
          title="保存这份行程？"
          message="保存后会同步给已加入的同行人，并在出发前发送提醒。"
          confirmLabel="确认保存"
          onConfirm={submitTrip}
          onCancel={() => setConfirmOpen(false)}
        />
        <LoadingOverlay id="trip-confirm-loading" className="trip-confirm__loading" open={loading} label="正在生成行程" />
        <Toast id="trip-confirm-toast" className="trip-confirm__toast" open={saved}>行程已保存，可在“我的行程”查看。</Toast>
      </Column>
    </MobileLayout>
  )
}
