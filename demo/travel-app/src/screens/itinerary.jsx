/**
 * @wireframe-skill multi-screen-wireframe@1.8.0
 * 创建基于 v1.5.1
 * 修改基于 v1.8.0
 */
import {
  Badge,
  Button,
  Card,
  Column,
  Heading,
  PageHeader,
  Row,
  Steps,
  Text,
} from '../../../../starter/framework/lib/ui/index.js'
import { MobileLayout } from '../layouts/MobileLayout.jsx'

const EVENTS = [
  { id: 'event-meet', time: '09:10', title: '地铁口集合', note: '从 3 号口步行约 8 分钟到路线起点。', tag: '集合' },
  { id: 'event-warehouse', time: '09:30', title: '旧仓库展厅', note: '看常设展与屋顶结构，入口处可寄存背包。', tag: '参观' },
  { id: 'event-market', time: '11:00', title: '桥下周末市集', note: '先逛手作摊位，再在东侧餐车区简单午餐。', tag: '市集' },
  { id: 'event-lunch', time: '13:00', title: '水岸小馆午餐', note: '预计用餐 70 分钟，靠窗区域无需预约。', tag: '用餐' },
  { id: 'event-lanes', time: '14:20', title: '水岸小巷散步', note: '沿石阶进入旧街区，经过书店和公共洗衣房。', tag: '步行' },
  { id: 'event-garden', time: '15:20', title: '社区花园休息', note: '补水并整理随身物品，花园北门有公共设施。', tag: '休息' },
  { id: 'event-sunset', time: '17:10', title: '河湾日落平台', note: '路线终点，可继续沿堤岸步行至晚餐区域。', tag: '观景' },
]

export function ItineraryScreen() {
  return (
    <MobileLayout>
      <Column id="itinerary-page" gap={18} className="weekend-page itinerary__page">
        <PageHeader
          id="itinerary-header"
          titleId="itinerary-title"
          className="itinerary__header"
          title="每日行程"
          subtitle="周六 · 运河边的一天"
          actions={<Button className="itinerary__back" to="route-detail">路线</Button>}
        />
        <Steps
          id="itinerary-progress"
          className="itinerary__progress"
          current={1}
          items={[{ id: 'morning', label: '上午' }, { id: 'afternoon', label: '下午' }, { id: 'evening', label: '傍晚' }]}
        />
        <Column id="itinerary-events" className="itinerary__events" gap={14}>
          {EVENTS.map((event) => (
            <Row className="itinerary__event" data-wf-key={event.id} key={event.id} gap={10} alignItems="flex-start">
              <Text className="itinerary__time">{event.time}</Text>
              <Card className="itinerary__event-card">
                <Column className="itinerary__event-body" gap={8}>
                  <Row className="itinerary__event-heading" alignItems="center" justifyContent="space-between" gap={8}>
                    <Heading className="itinerary__event-title" level={3}>{event.title}</Heading>
                    <Badge className="itinerary__event-badge">{event.tag}</Badge>
                  </Row>
                  <Text className="itinerary__event-note">{event.note}</Text>
                </Column>
              </Card>
            </Row>
          ))}
        </Column>
        <Card id="itinerary-reminder" className="itinerary__reminder">
          <Column className="itinerary__reminder-body" gap={6}>
            <strong className="itinerary__reminder-title">出发提醒</strong>
            <Text className="itinerary__reminder-copy">建议携带饮用水、轻便雨具和可重复使用的购物袋。</Text>
          </Column>
        </Card>
        <Button id="itinerary-create-action" className="itinerary__create-action" variant="primary" to="trip-create">创建我的版本</Button>
      </Column>
    </MobileLayout>
  )
}
