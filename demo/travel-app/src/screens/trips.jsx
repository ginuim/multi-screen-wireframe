/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.5.1
 * 修改基于 v1.5.1
 */
import {
  Badge,
  Button,
  Card,
  Column,
  EmptyState,
  Heading,
  PageHeader,
  Row,
  Tabs,
  Text,
} from '../../../../starter/framework/lib/ui/index.js'
import { MobileLayout } from '../layouts/MobileLayout.jsx'

const TRIPS = [
  { id: 'trip-canal', title: '周六运河散步', date: '8 月 15 日', status: '待出发', detail: '3 人 · 5 个地点' },
  { id: 'trip-lake', title: '环湖骑行半日', date: '8 月 22 日', status: '规划中', detail: '2 人 · 4 个地点' },
  { id: 'trip-museum', title: '雨天博物馆线', date: '9 月 5 日', status: '待确认', detail: '4 人 · 3 个场馆' },
  { id: 'trip-hills', title: '城北轻徒步', date: '9 月 12 日', status: '规划中', detail: '3 人 · 6 个地点' },
]

export function TripsScreen() {
  const [tab, setTab] = React.useState('upcoming')
  return (
    <MobileLayout>
      <Column id="trips-page" gap={18} className="weekend-page trips__page">
        <PageHeader
          id="trips-header"
          titleId="trips-title"
          className="trips__header"
          title="我的行程"
          subtitle="计划、同行信息与旅行记录"
          actions={<Button id="trips-create-action" className="trips__create-action" to="trip-create">新建</Button>}
        />
        <Tabs id="trips-tabs" className="trips__tabs" activeId={tab} onChange={setTab} items={[{ id: 'upcoming', label: '待出发' }, { id: 'completed', label: '已完成' }, { id: 'saved', label: '收藏' }]} />
        {tab === 'upcoming' ? (
          <Column id="trips-upcoming" className="trips__list" gap={12}>
            {TRIPS.map((trip) => (
              <Card className="trips__card" data-wf-key={trip.id} key={trip.id} to="route-detail">
                <Column className="trips__card-body" gap={9}>
                  <Row className="trips__card-heading" alignItems="center" justifyContent="space-between" gap={8}>
                    <Heading className="trips__card-title" level={3}>{trip.title}</Heading>
                    <Badge className="trips__card-status">{trip.status}</Badge>
                  </Row>
                  <Text className="trips__card-date">{trip.date}</Text>
                  <Row className="trips__status-row" gap={10}>
                    <Text className="trips__card-detail">{trip.detail}</Text>
                    <Text className="trips__card-reminder">提醒已开启</Text>
                  </Row>
                </Column>
              </Card>
            ))}
          </Column>
        ) : tab === 'completed' ? (
          <Column id="trips-completed" className="trips__completed" gap={12}>
            <Card className="trips__card" data-wf-key="trip-old-street" to="route-detail"><Column className="trips__card-body" gap={8}><Heading className="trips__card-title" level={3}>老街慢游</Heading><Text className="trips__card-date">7 月 18 日 · 已完成</Text></Column></Card>
            <Card className="trips__card" data-wf-key="trip-night-walk" to="route-detail"><Column className="trips__card-body" gap={8}><Heading className="trips__card-title" level={3}>夜色建筑散步</Heading><Text className="trips__card-date">6 月 27 日 · 已完成</Text></Column></Card>
            <Card className="trips__card" data-wf-key="trip-riverside" to="route-detail"><Column className="trips__card-body" gap={8}><Heading className="trips__card-title" level={3}>南岸旧码头</Heading><Text className="trips__card-date">5 月 16 日 · 已完成</Text></Column></Card>
          </Column>
        ) : (
          <EmptyState id="trips-saved-empty" className="trips__empty" title="还没有收藏路线" description="在路线详情中收藏，稍后再决定什么时候出发。" action={<Button className="trips__empty-action" to="discover">去发现路线</Button>} />
        )}
      </Column>
    </MobileLayout>
  )
}
