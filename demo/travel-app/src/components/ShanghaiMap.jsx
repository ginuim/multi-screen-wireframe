import { WireMap } from '../../../../starter/framework/lib/ui/index.js'

export function ShanghaiMap({ className = '', children, ...rest }) {
  return (
    <WireMap className={`shanghai-map ${className}`.trim()} {...rest}>
      {children}
    </WireMap>
  )
}
