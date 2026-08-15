// ---------- Hamburger drawer ----------
// Framework-free reimplementation of the React version: a backdrop + drawer
// pair, closing plays a reverse slide-out animation before actually
// unmounting (must match .hamburger-drawer.closing / .hamburger-drawer-backdrop.closing
// animation-duration in style.css, or it'd either flash unstyled or snap
// away before the animation finishes), Escape closes, and Tab is trapped
// inside the drawer while it's open.

const DRAWER_CLOSE_MS = 350

const DRAWER_LINKS = [
  { href: '#', label: 'Pricing' },
  { href: '#', label: 'Company' },
  { href: '#', label: 'Disclaimer' },
  { href: '#', label: 'Terms' },
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Legal Notice' },
]

const drawerRoot = document.getElementById('drawer-root')
const hamburgerTrigger = document.getElementById('hamburger-trigger')

let drawerKeydownHandler = null

function closeDrawer() {
  const backdrop = drawerRoot.querySelector('.hamburger-drawer-backdrop')
  const drawer = drawerRoot.querySelector('.hamburger-drawer')
  if (!backdrop || !drawer) return

  backdrop.classList.add('closing')
  drawer.classList.add('closing')

  if (drawerKeydownHandler) {
    document.removeEventListener('keydown', drawerKeydownHandler)
    drawerKeydownHandler = null
  }

  setTimeout(() => {
    drawerRoot.innerHTML = ''
  }, DRAWER_CLOSE_MS)

  hamburgerTrigger.setAttribute('aria-expanded', 'false')
  hamburgerTrigger.focus()
}

function openDrawer() {
  hamburgerTrigger.setAttribute('aria-expanded', 'true')

  const linksHtml = DRAWER_LINKS.map((l) => `<a href="${l.href}" class="hamburger-drawer-link">${l.label}</a>`).join('')

  drawerRoot.innerHTML = `
    <div class="hamburger-drawer-backdrop">
      <div class="hamburger-drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="hamburger-drawer-glass-effect"></div>
        <div class="hamburger-drawer-glass-tint"></div>
        <div class="hamburger-drawer-glass-shine"></div>
        <div class="hamburger-drawer-content">
          <button type="button" class="hamburger-drawer-close" aria-label="Close menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div class="hamburger-drawer-links">${linksHtml}</div>
        </div>
      </div>
    </div>
  `

  const backdrop = drawerRoot.querySelector('.hamburger-drawer-backdrop')
  const drawer = drawerRoot.querySelector('.hamburger-drawer')
  const closeBtn = drawerRoot.querySelector('.hamburger-drawer-close')

  backdrop.addEventListener('click', closeDrawer)
  drawer.addEventListener('click', (e) => e.stopPropagation())
  closeBtn.addEventListener('click', closeDrawer)
  drawerRoot.querySelectorAll('.hamburger-drawer-link').forEach((link) => link.addEventListener('click', closeDrawer))

  closeBtn.focus()

  drawerKeydownHandler = (e) => {
    if (e.key === 'Escape') {
      closeDrawer()
      return
    }
    if (e.key !== 'Tab') return
    const focusables = drawer.querySelectorAll('a[href], button:not([disabled])')
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
  document.addEventListener('keydown', drawerKeydownHandler)
}

hamburgerTrigger.addEventListener('click', openDrawer)

// ---------- Bottom tab bar ----------
// The FAB is a raised circular button, not inline with the other tabs, so
// it's deliberately excluded from the sliding indicator.

const bottomTabbar = document.getElementById('bottom-tabbar')
const bottomTabbarContent = document.getElementById('bottom-tabbar-content')
const indicator = document.getElementById('bottom-tab-indicator')
const indicatorGlass = document.getElementById('bottom-tab-indicator-glass')

function slidableTabs() {
  return Array.from(bottomTabbarContent.querySelectorAll('.bottom-tab'))
}

function activeTab() {
  return bottomTabbarContent.querySelector('.bottom-tab.active')
}

function measureIndicator() {
  const el = activeTab()
  if (!el) {
    indicator.style.opacity = '0'
    return
  }
  const containerRect = bottomTabbarContent.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  indicator.style.transform = `translateX(${elRect.left - containerRect.left}px)`
  indicator.style.width = `${elRect.width}px`
  indicator.style.opacity = '0.4'
  indicator.style.background = 'var(--color-faint)'
  indicator.style.borderRadius = '99px'
}

measureIndicator()
// Recompute on resize/rotation — tab widths are percentage-based (flex: 1),
// so the pixel offsets shift with viewport width.
window.addEventListener('resize', measureIndicator)

slidableTabs().forEach((tab) => {
  tab.addEventListener('click', (e) => {
    e.preventDefault()
    slidableTabs().forEach((t) => t.classList.remove('active'))
    tab.classList.add('active')
    measureIndicator()
  })
})

// Momentary "bloom" on touch/press — tracked by the exact tab being pressed
// so the indicator glass only blooms if the pressed tab is the active one
// (pressing an unrelated tab shouldn't make the active indicator swell).
// Driven by pointer events rather than CSS :active — :active is unreliable
// on iOS Safari without a touchstart listener, and two elements (the whole
// bar + the indicator) need to bloom together from one shared state.
function clearPressed() {
  bottomTabbar.classList.remove('pressed')
  indicatorGlass.classList.remove('pressed')
}

bottomTabbarContent.addEventListener('pointerdown', (e) => {
  const tab = e.target.closest('[data-tab-key]')
  if (!tab) return
  bottomTabbar.classList.add('pressed')
  if (tab.classList.contains('active')) {
    indicatorGlass.classList.add('pressed')
  }
})
bottomTabbarContent.addEventListener('pointerup', clearPressed)
bottomTabbarContent.addEventListener('pointercancel', clearPressed)
bottomTabbarContent.addEventListener('pointerleave', clearPressed)
