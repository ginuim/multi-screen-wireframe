/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.3.0
 * 修改基于 v1.5.1
 */
import { MobileShell } from '../../../../starter/framework/lib/ui/index.js'
import { useScreenId } from '../../../../starter/framework/lib/core/ScreenIdentity.jsx'

const tabs = [
  { label: '首页', to: 'home' },
  { label: '理赔', to: 'claims' },
  { label: '我的', to: 'profile' },
]

export function MobileLayout({ children }) {
  const screenId = useScreenId()
  return (
    <MobileShell className="claims-shell claims-layout" tabs={tabs} activeId={screenId} aria-label="理赔应用">
      {children}
    </MobileShell>
  )
}
