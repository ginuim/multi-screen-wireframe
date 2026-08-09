/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.3.0
 * 修改基于 v1.5.1
 */
import { Column, SideNav } from '../../../../starter/framework/lib/ui/index.js'
import { useScreenId } from '../../../../starter/framework/lib/core/ScreenIdentity.jsx'

export function AdminLayout({ children }) {
  const screenId = useScreenId()
  return (
    <div className="order-shell">
      <aside className="order-shell__sidebar">
        <strong className="order-shell__brand">订单管理</strong>
        <SideNav
          className="order-shell__navigation"
          activeId={screenId}
          items={[{ label: '订单列表', to: 'order-list' }]}
        />
      </aside>
      <Column gap={16} className="order-main order-shell__main">{children}</Column>
    </div>
  )
}
