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
  Grid,
  Heading,
  ImagePlaceholder,
  PageHeader,
  Row,
  Text,
} from '../../../../starter/framework/lib/ui/index.js'
import { MobileLayout } from '../layouts/MobileLayout.jsx'

const ROUTES = [
  { id: 'route-canal', title: '运河边的一天', meta: '步行 8.6 km · 6 小时', note: '旧仓库、桥下市集与傍晚河岸' },
  { id: 'route-hills', title: '城北轻徒步', meta: '徒步 11 km · 7 小时', note: '林间缓坡、观景台与山脚小馆' },
  { id: 'route-lanes', title: '老街慢游', meta: '步行 5.2 km · 4 小时', note: '巷口早餐、旧书店与社区花园' },
  { id: 'route-lake', title: '环湖骑行半日', meta: '骑行 18 km · 5 小时', note: '湿地栈道、堤岸与日落平台' },
  { id: 'route-museum', title: '雨天博物馆线', meta: '公交 4 站 · 6 小时', note: '三个展馆与一间安静咖啡馆' },
  { id: 'route-night', title: '夜色建筑散步', meta: '步行 6.4 km · 3 小时', note: '广场、剧院与江边灯光带' },
]

export function DiscoverScreen() {
  return (
    <MobileLayout>
      <Column id="discover-page" gap={18} className="weekend-page discover__page">
        <PageHeader
          id="discover-header"
          titleId="discover-title"
          subtitleId="discover-subtitle"
          className="discover__header"
          title="这个周末，去哪走走"
          subtitle="为你挑了几条不用赶时间的城市路线"
          actions={<Button id="discover-map-action" className="discover__map-action" to="explore-map">地图</Button>}
        />
        <Card id="discover-featured" className="weekend-route-card discover__featured" to="route-detail">
          <ImagePlaceholder className="discover__featured-image" height={176} borderRadius={0} />
          <Column className="weekend-route-card__body discover__featured-body" gap={10}>
            <Row className="weekend-chip-row discover__featured-badges" gap={8}>
              <Badge className="discover__featured-badge">本周推荐</Badge>
              <Badge className="discover__featured-badge">适合初次到访</Badge>
            </Row>
            <Heading className="discover__featured-title" level={2}>运河边的一天</Heading>
            <Text className="discover__featured-copy">从旧仓库出发，沿水岸走到桥下市集，在日落前抵达河湾平台。</Text>
            <Row className="weekend-card-meta discover__featured-meta" gap={12}>
              <Text className="discover__featured-meta-item">8.6 km</Text>
              <Text className="discover__featured-meta-item">约 6 小时</Text>
              <Text className="discover__featured-meta-item">轻松</Text>
            </Row>
          </Column>
        </Card>
        <Heading id="discover-routes-title" className="weekend-section-heading discover__routes-title" level={2}>更多路线</Heading>
        <Grid id="discover-routes" className="discover__routes" columns={1} gap={14}>
          {ROUTES.map((route, index) => (
            <Card className="weekend-route-card discover__route-card" data-wf-key={route.id} key={route.id} to="route-detail">
              <ImagePlaceholder className="discover__route-image" height={index % 2 === 0 ? 116 : 136} borderRadius={0} />
              <Column className="weekend-route-card__body discover__route-body" gap={7}>
                <Heading className="discover__route-title" level={3}>{route.title}</Heading>
                <Text className="discover__route-meta">{route.meta}</Text>
                <Text className="discover__route-note">{route.note}</Text>
              </Column>
            </Card>
          ))}
        </Grid>
      </Column>
    </MobileLayout>
  )
}
