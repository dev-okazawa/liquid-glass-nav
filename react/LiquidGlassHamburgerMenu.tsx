import { useEffect, useRef, useState } from 'react'
import '../style.css'

export interface LiquidGlassMenuLink {
  href: string
  label: string
}

export interface LiquidGlassHamburgerMenuProps {
  links: LiquidGlassMenuLink[]
  /** Controls whether the drawer is open. This component owns its own close animation timing internally. */
  open: boolean
  onClose: () => void
}

// Closing plays a reverse slide-out animation before the drawer actually
// unmounts — must match .hamburger-drawer.closing / .hamburger-drawer-backdrop.closing
// animation-duration in style.css, or the drawer would either flash
// unstyled or visibly snap away before the animation finishes.
const CLOSE_MS = 350

/**
 * A slide-in hamburger drawer with the same "Liquid Glass" layered
 * backdrop-filter treatment as LiquidGlassBottomNav. Render this
 * conditionally on `open` from the parent; it manages its own exit
 * animation before calling `onClose`.
 */
export default function LiquidGlassHamburgerMenu({ links, open, onClose }: LiquidGlassHamburgerMenuProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const [closing, setClosing] = useState(false)

  const requestClose = () => setClosing(true)

  useEffect(() => {
    if (!open) setClosing(false)
  }, [open])

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, CLOSE_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  useEffect(() => {
    if (!open) return
    closeBtnRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        requestClose()
        return
      }
      if (e.key !== 'Tab' || !drawerRef.current) return
      const focusables = drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  if (!open) return null

  return (
    <div
      className={closing ? 'hamburger-drawer-backdrop closing' : 'hamburger-drawer-backdrop'}
      onClick={requestClose}
    >
      <div
        ref={drawerRef}
        className={closing ? 'hamburger-drawer closing' : 'hamburger-drawer'}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hamburger-drawer-glass-effect" />
        <div className="hamburger-drawer-glass-tint" />
        <div className="hamburger-drawer-glass-shine" />
        <div className="hamburger-drawer-content">
          <button ref={closeBtnRef} type="button" onClick={requestClose} aria-label="Close menu" className="hamburger-drawer-close">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="hamburger-drawer-links">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="hamburger-drawer-link" onClick={requestClose}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
