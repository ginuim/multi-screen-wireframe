import { MobileShell } from '../../../../starter/lib/ui/index.js'
import { useScreenId } from '../../../../starter/lib/core/ScreenIdentity.jsx'

const tabs = [
  { label: '首页', to: 'home' },
  { label: '理赔', to: 'claims' },
  { label: '我的', to: 'profile' },
]

export function MobileLayout({ children }) {
  const screenId = useScreenId()
  return (
    <MobileShell className="claims-shell" tabs={tabs} activeId={screenId} aria-label="理赔应用">
      {children}
    </MobileShell>
  )
}
