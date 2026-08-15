import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import '../style.css'

export interface LiquidGlassTab {
  key: string
  href: string
  label: string
  icon: ReactNode
}

export interface LiquidGlassFab {
  href: string
  label: string
  icon: ReactNode
}

export interface LiquidGlassBottomNavProps {
  /** Regular tabs, rendered in order. The FAB (if given) is inserted after `fabIndex` of these. */
  tabs: LiquidGlassTab[]
  /** Raised circular center button — excluded from the sliding indicator. Omit for a plain tab bar. */
  fab?: LiquidGlassFab
  /** Index within `tabs` after which the FAB renders. Defaults to the middle. */
  fabIndex?: number
  /** Key of the currently active tab (matches LiquidGlassTab.key), or null if none are active. */
  activeKey: string | null
  /** Called when a tab (not the FAB) is clicked, with its key — wire this up to your router. */
  onNavigate?: (key: string) => void
}

/**
 * A bottom tab bar with a "Liquid Glass"-style sliding highlight and
 * press-bloom. See the repo README for a full writeup of the layered glass
 * technique and the Safari/backdrop-filter caveats baked into the CSS.
 */
export default function LiquidGlassBottomNav({ tabs, fab, fabIndex, activeKey, onNavigate }: LiquidGlassBottomNavProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Record<string, HTMLElement | null>>({})
  const [indicator, setIndicator] = useState<{ left: number; width: number; visible: boolean }>({
    left: 0,
    width: 0,
    visible: false,
  })
  // Momentary "bloom" on touch/press — tracked by the exact tab being pressed
  // so the indicator glass only blooms if the pressed tab is the active one.
  const [pressedKey, setPressedKey] = useState<string | null>(null)
  const pressed = pressedKey !== null
  const activeIndicatorPressed = activeKey !== null && pressedKey === activeKey
  const clearPressed = () => setPressedKey(null)

  useLayoutEffect(() => {
    const measure = () => {
      const container = contentRef.current
      const el = activeKey ? tabRefs.current[activeKey] : null
      if (!container || !el) {
        setIndicator((prev) => ({ ...prev, visible: false }))
        return
      }
      const containerRect = container.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      setIndicator({ left: elRect.left - containerRect.left, width: elRect.width, visible: true })
    }
    measure()
    // Recompute on resize/rotation — tab widths are percentage-based
    // (flex: 1), so the pixel offsets shift with viewport width.
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeKey])

  const resolvedFabIndex = fabIndex ?? Math.ceil(tabs.length / 2)
  const before = tabs.slice(0, resolvedFabIndex)
  const after = tabs.slice(resolvedFabIndex)

  const renderTab = (tab: LiquidGlassTab) => (
    <a
      key={tab.key}
      href={tab.href}
      data-tab-key={tab.key}
      ref={(el) => {
        tabRefs.current[tab.key] = el
      }}
      onClick={(e) => {
        if (onNavigate) {
          e.preventDefault()
          onNavigate(tab.key)
        }
      }}
      className={tab.key === activeKey ? 'bottom-tab active' : 'bottom-tab'}
    >
      {tab.icon}
      {tab.label}
    </a>
  )

  return (
    <nav className={pressed ? 'bottom-tabbar pressed' : 'bottom-tabbar'}>
      <svg aria-hidden="true" focusable="false" className="bottom-tabbar-liquid-defs">
        <filter id="bottom-tab-liquid-lens" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.026" numOctaves="1" seed="11" result="lensNoise" />
          <feDisplacementMap in="SourceGraphic" in2="lensNoise" scale="18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="bottom-tabbar-glass-effect" />
      <div className="bottom-tabbar-glass-tint" />
      <div className="bottom-tabbar-glass-shine" />
      <div
        className="bottom-tabbar-content"
        ref={contentRef}
        onPointerDown={(e) => {
          const tabEl = (e.target as HTMLElement).closest<HTMLElement>('[data-tab-key]')
          setPressedKey(tabEl?.dataset.tabKey ?? null)
        }}
        onPointerUp={clearPressed}
        onPointerCancel={clearPressed}
        onPointerLeave={clearPressed}
      >
        <div
          className="bottom-tab-indicator"
          style={{
            transform: `translateX(${indicator.left}px)`,
            width: indicator.width,
            opacity: indicator.visible ? 0.4 : 0,
            background: 'var(--color-faint)',
            borderRadius: 99,
          }}
        >
          <div className={activeIndicatorPressed ? 'bottom-tab-indicator-glass pressed' : 'bottom-tab-indicator-glass'} />
        </div>

        {before.map(renderTab)}

        {fab && (
          <a href={fab.href} data-tab-key="fab" className="bottom-tab-fab" aria-label={fab.label}>
            <span className="bottom-tab-fab-circle">{fab.icon}</span>
            <span className="bottom-tab-fab-label">{fab.label}</span>
          </a>
        )}

        {after.map(renderTab)}
      </div>
    </nav>
  )
}
