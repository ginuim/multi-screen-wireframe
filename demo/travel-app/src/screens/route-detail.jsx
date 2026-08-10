/**
 * @wireframe-skill multi-screen-wireframe@1.6.0
 * 创建基于 v1.5.1
 * 修改基于 v1.6.0
 */
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Cell,
  Column,
  Grid,
  Heading,
  ImagePlaceholder,
  Row,
  Tabs,
  Text,
} from '../../../../starter/framework/lib/ui/index.js'
import { MobileLayout } from '../layouts/MobileLayout.jsx'

const STOPS = [
  { id: 'stop-warehouse', title: '旧仓库展厅', subtitle: '09:30 · 建议停留 60 分钟' },
  { id: 'stop-bridge', title: '桥下周末市集', subtitle: '11:00 · 建议停留 90 分钟' },
  { id: 'stop-lane', title: '水岸小巷', subtitle: '13:30 · 午餐与街区散步' },
  { id: 'stop-garden', title: '社区花园', subtitle: '15:20 · 建议停留 45 分钟' },
  { id: 'stop-bend', title: '河湾日落平台', subtitle: '17:10 · 路线终点' },
]

export function RouteDetailScreen() {
  const [tab, setTab] = React.useState('overview')
  return (
    <MobileLayout>
      <Column id="route-detail-page" gap={18} className="weekend-page route-detail__page">
        <Breadcrumbs id="route-detail-breadcrumbs" className="route-detail__breadcrumbs" items={[{ label: '发现', to: 'discover' }, { label: '运河边的一天' }]} />
        <ImagePlaceholder id="route-detail-hero" className="route-detail__hero" height={224} borderRadius={0} />
        <Column id="route-detail-summary" className="route-detail__summary" gap={10}>
          <Row className="weekend-chip-row route-detail__badges" gap={8}>
            <Badge className="route-detail__badge">城市漫步</Badge>
            <Badge className="route-detail__badge">轻松</Badge>
            <Badge className="route-detail__badge">可带宠物</Badge>
          </Row>
          <Heading id="route-detail-title" className="route-detail__title" level={1}>运河边的一天</Heading>
          <Text className="route-detail__intro">一条从工业遗存走向生活街区的水岸路线。上午看展，中午逛市集，傍晚在河湾等日落。</Text>
        </Column>
        <Grid id="route-detail-facts" className="route-detail__facts" columns={3} gap={8}>
          <Card className="route-detail__fact"><span className="route-detail__fact-value">8.6 km</span><span className="route-detail__fact-label">总路程</span></Card>
          <Card className="route-detail__fact"><span className="route-detail__fact-value">6 小时</span><span className="route-detail__fact-label">建议时长</span></Card>
          <Card className="route-detail__fact"><span className="route-detail__fact-value">5 站</span><span className="route-detail__fact-label">路线节点</span></Card>
        </Grid>
        <Tabs id="route-detail-tabs" className="route-detail__tabs" activeId={tab} onChange={setTab} items={[{ id: 'overview', label: '路线概览' }, { id: 'notes', label: '出发须知' }]} />
        {tab === 'overview' ? (
          <Column id="route-detail-stops" className="route-detail__stops" gap={0}>
            {STOPS.map((stop, index) => (
              <Cell className="route-detail__stop" data-wf-key={stop.id} key={stop.id} title={`${index + 1}. ${stop.title}`} subtitle={stop.subtitle} value={`${index + 1}`} />
            ))}
          </Column>
        ) : (
          <Card id="route-detail-notes" className="route-detail__notes">
            <Column className="route-detail__notes-body" gap={10}>
              <Text className="route-detail__note">沿途大部分路段有树荫，河湾区域下午日照较强。</Text>
              <Text className="route-detail__note">旧仓库周一闭馆，周末建议提前预约入场时段。</Text>
              <Text className="route-detail__note">路线终点距离地铁站约 900 米，也可乘坐社区接驳车。</Text>
            </Column>
          </Card>
        )}
        <Card id="route-detail-guide" className="route-detail__guide">
          <Column className="route-detail__guide-body" gap={8}>
            <Heading className="route-detail__guide-title" level={3}>路线策划人</Heading>
            <Text className="route-detail__guide-copy">林屿 · 城市步行记录者，已发布 18 条水岸路线。</Text>
          </Column>
        </Card>
        <Column id="route-detail-actions" className="route-detail__actions" gap={10}>
          <Button id="route-detail-itinerary-action" className="route-detail__itinerary-action" to="itinerary">查看完整日程</Button>
          <Button id="route-detail-create-action" className="route-detail__create-action" variant="primary" to="trip-create">用这条路线创建行程</Button>
        </Column>
      </Column>
    </MobileLayout>
  )
}
