/**
 * @wireframe-skill multi-screen-wireframe@1.7.0
 * 创建基于 v1.5.1
 * 修改基于 v1.7.0
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
} from '../../../../starter/framework/lib/ui/index.js'
import { ShanghaiMap } from '../components/ShanghaiMap.jsx'
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
        <ShanghaiMap id="explore-map-canvas" className="weekend-map explore-map__canvas">
          <MapMarker className="explore-map__marker" data-wf-key="marker-suzhou-creek" x={51} y={40} label="苏州河滨水漫步" to="route-detail" />
          <MapMarker className="explore-map__marker" data-wf-key="marker-bund" x={62} y={47} label="外滩建筑漫游" to="route-detail" />
          <MapMarker className="explore-map__marker" data-wf-key="marker-xuhui" x={49} y={55} label="衡复风貌骑行" to="route-detail" />
          <MapMarker className="explore-map__marker" data-wf-key="marker-pudong" x={75} y={43} label="陆家嘴城市漫步" to="route-detail" />
          <MapOverlay className="explore-map__overlay" position="bottom">
            <Card className="explore-map__route-preview" to="route-detail">
              <Column className="explore-map__preview-body" gap={6}>
                <Text className="explore-map__preview-eyebrow">距离你 2.4 km</Text>
                <strong className="explore-map__preview-title">苏州河滨水漫步</strong>
                <Text className="explore-map__preview-meta">8.6 km · 约 6 小时 · 轻松</Text>
              </Column>
            </Card>
          </MapOverlay>
        </ShanghaiMap>
      </Column>
    </MobileLayout>
  )
}
