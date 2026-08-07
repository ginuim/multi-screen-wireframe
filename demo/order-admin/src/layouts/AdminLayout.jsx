import { Column, SideNav } from '../../../../starter/framework/lib/ui/index.js'
import { useScreenId } from '../../../../starter/framework/lib/core/ScreenIdentity.jsx'

export function AdminLayout({ children }) {
  const screenId = useScreenId()
  return (
    <div className="order-shell">
      <aside>
        <strong>订单管理</strong>
        <SideNav
          activeId={screenId}
          items={[{ label: '订单列表', to: 'order-list' }]}
        />
      </aside>
      <Column gap={16} className="order-main">{children}</Column>
    </div>
  )
}
