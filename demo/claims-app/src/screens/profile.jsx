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
      <Column gap={20} className="claims-page">
        <Heading level={1}>我的</Heading>
        <Row gap={12} alignItems="center">
          <Avatar size={56} label="用户头像占位" />
          <div>
            <strong>示例用户</strong>
            <Text>已完成实名认证</Text>
          </div>
        </Row>
        <Cell title="联系方式" subtitle="138 0000 0000" />
        <Toggle
          checked={notifications}
          label="接收进度通知"
          onChange={setNotifications}
        />
      </Column>
    </MobileLayout>
  )
}
