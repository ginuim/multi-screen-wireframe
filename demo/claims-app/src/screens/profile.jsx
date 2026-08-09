/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.3.0
 * 修改基于 v1.5.1
 */
import {
  Avatar,
  Cell,
  Column,
  Heading,
  Row,
  Text,
  Toggle,
} from '../../../../starter/framework/lib/ui/index.js'
import { MobileLayout } from '../layouts/MobileLayout.jsx'

export function ProfileScreen() {
  const [notifications, setNotifications] = React.useState(true)
  return (
    <MobileLayout>
      <Column id="claims-profile-page" gap={20} className="claims-page claims-profile__page">
        <Heading id="claims-profile-title" className="claims-profile__title" level={1}>我的</Heading>
        <Row id="claims-profile-summary" className="claims-profile__summary" gap={12} alignItems="center">
          <Avatar className="claims-profile__avatar" size={56} label="用户头像占位" />
          <div className="claims-profile__identity">
            <strong className="claims-profile__name">示例用户</strong>
            <Text className="claims-profile__verification">已完成实名认证</Text>
          </div>
        </Row>
        <Cell id="claims-profile-contact" className="claims-profile__contact" title="联系方式" subtitle="138 0000 0000" />
        <Toggle
          id="claims-profile-notifications"
          className="claims-profile__notifications"
          checked={notifications}
          label="接收进度通知"
          onChange={setNotifications}
        />
      </Column>
    </MobileLayout>
  )
}
