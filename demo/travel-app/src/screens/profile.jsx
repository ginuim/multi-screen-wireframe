/**
 * @wireframe-skill multi-screen-wireframe@1.8.0
 * 创建基于 v1.5.1
 * 修改基于 v1.8.0
 */
import {
  Avatar,
  Cell,
  Column,
  PageHeader,
  Row,
  Text,
  Toggle,
} from '../../../../starter/framework/lib/ui/index.js'
import { MobileLayout } from '../layouts/MobileLayout.jsx'

export function ProfileScreen() {
  const [notifications, setNotifications] = React.useState(true)
  const [offlineMaps, setOfflineMaps] = React.useState(false)
  return (
    <MobileLayout>
      <Column id="profile-page" gap={20} className="weekend-page profile__page">
        <PageHeader id="profile-header" titleId="profile-title" className="profile__header" title="我的" subtitle="个人偏好与旅行设置" />
        <Row id="profile-summary" className="profile__summary" gap={12} alignItems="center">
          <Avatar className="profile__avatar" size={58} label="用户头像占位" />
          <div className="profile__identity">
            <strong className="profile__name">林晓野</strong>
            <Text className="profile__bio">已走过 12 座城市</Text>
          </div>
        </Row>
        <Column id="profile-account" className="profile__account" gap={0}>
          <Cell className="profile__account-cell" title="旅行档案" subtitle="偏好、足迹与收藏" />
          <Cell className="profile__account-cell" title="同行人" subtitle="3 位常用同行人" />
          <Cell className="profile__account-cell" title="紧急联系人" subtitle="已设置" />
        </Column>
        <Column id="profile-settings" className="profile__settings" gap={12}>
          <Row className="profile__setting-row" alignItems="center" justifyContent="space-between">
            <Text className="profile__setting-label">行程提醒</Text>
            <Toggle id="profile-notifications" className="profile__notifications" checked={notifications} onChange={setNotifications} />
          </Row>
          <Row className="profile__setting-row" alignItems="center" justifyContent="space-between">
            <Text className="profile__setting-label">自动下载离线地图</Text>
            <Toggle id="profile-offline-maps" className="profile__offline-maps" checked={offlineMaps} onChange={setOfflineMaps} />
          </Row>
        </Column>
        <Column id="profile-support" className="profile__support" gap={0}>
          <Cell className="profile__support-cell" title="帮助与反馈" />
          <Cell className="profile__support-cell" title="隐私设置" />
          <Cell className="profile__support-cell" title="关于周末出发" value="1.0" />
        </Column>
      </Column>
    </MobileLayout>
  )
}
