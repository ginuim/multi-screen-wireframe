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
  MapMarker,
  MapOverlay,
  PageHeader,
  Row,
  Text,
  WireMap,
} from '../../../../starter/framework/lib/ui/index.js'
import { MobileLayout } from '../layouts/MobileLayout.jsx'

export function ExploreMapScreen() {
  return (
    <MobileLayout>
      <Column id="explore-map-page" gap={16} className="weekend-page explore-map__page">
        <PageHeader
          id="explore-map-header"
          titleId="explore-map-title"
          className="explore-map__header"
          title="目的地地图"
          subtitle="轻触标记查看推荐路线"
          actions={<Button className="explore-map__back" to="discover">列表</Button>}
        />
        <Row id="explore-map-filters" className="weekend-chip-row explore-map__filters" gap={8}>
          <Badge className="explore-map__filter">全部</Badge>
          <Badge className="explore-map__filter">步行</Badge>
          <Badge className="explore-map__filter">骑行</Badge>
          <Badge className="explore-map__filter">室内</Badge>
        </Row>
        <WireMap id="explore-map-canvas" className="weekend-map explore-map__canvas">
          <MapMarker className="explore-map__marker" data-wf-key="marker-canal" x={27} y={36} label="运河边的一天" to="route-detail" />
          <MapMarker className="explore-map__marker" data-wf-key="marker-hills" x={68} y={20} label="城北轻徒步" to="route-detail" />
          <MapMarker className="explore-map__marker" data-wf-key="marker-lanes" x={58} y={58} label="老街慢游" to="route-detail" />
          <MapMarker className="explore-map__marker" data-wf-key="marker-lake" x={22} y={72} label="环湖骑行半日" to="route-detail" />
          <MapOverlay className="explore-map__overlay" position="bottom">
            <Card className="explore-map__route-preview" to="route-detail">
              <Column className="explore-map__preview-body" gap={6}>
                <Text className="explore-map__preview-eyebrow">距离你 2.4 km</Text>
                <strong className="explore-map__preview-title">运河边的一天</strong>
                <Text className="explore-map__preview-meta">8.6 km · 约 6 小时 · 轻松</Text>
              </Column>
            </Card>
          </MapOverlay>
        </WireMap>
      </Column>
    </MobileLayout>
  )
}
