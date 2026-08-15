import { type ReactNode } from 'react'
import '../style.css'

export interface LiquidGlassTopNavProps {
  /** Center brand/logo content. */
  brand: ReactNode
  /** Left control, typically a hamburger trigger button. */
  left?: ReactNode
  /** Right-side icon actions. */
  right?: ReactNode
  /** Hide by translating the full glass bar upward, useful for mobile chrome behavior. */
  hidden?: boolean
}

/**
 * A mobile-first top bar using the same three-layer Liquid Glass treatment as
 * the bottom tab bar and drawer. Children stay router-agnostic so you can pass
 * anchors, buttons, or framework-specific links.
 */
export default function LiquidGlassTopNav({ brand, left, right, hidden = false }: LiquidGlassTopNavProps) {
  return (
    <nav className={hidden ? 'topnav mobile-chrome-hidden-top' : 'topnav'}>
      <div className="topnav-glass-effect" />
      <div className="topnav-glass-tint" />
      <div className="topnav-glass-shine" />
      <div className="topnav-content">
        <div className="topnav-left">{left}</div>
        {brand}
        <div className="topnav-actions">{right}</div>
      </div>
    </nav>
  )
}
