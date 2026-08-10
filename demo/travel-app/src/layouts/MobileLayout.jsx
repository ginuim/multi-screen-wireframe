/**
 * @wireframe-skill multi-screen-wireframe@1.6.0
 * 创建基于 v1.5.1
 * 修改基于 v1.6.0
 */
import { MobileShell } from '../../../../starter/framework/lib/ui/index.js'
import { useScreenId } from '../../../../starter/framework/lib/core/ScreenIdentity.jsx'

const tabs = [
  { label: '发现', to: 'discover' },
  { label: '行程', to: 'trips' },
  { label: '我的', to: 'profile' },
]

export function MobileLayout({ children }) {
  const screenId = useScreenId()
  return (
    <MobileShell className="weekend-shell weekend-layout" tabs={tabs} activeId={screenId} aria-label="周末出发旅行助手">
      {children}
    </MobileShell>
  )
}
