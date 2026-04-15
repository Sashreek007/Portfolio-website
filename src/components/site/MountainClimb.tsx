'use client'

import { useEffect, useRef, useState } from 'react'

// ─── Mountain slope path ───────────────────────────────────────────────────────
// ViewBox: "0 0 160 800"   (tall and narrow — spans the full left side)
// Path defined bottom → summit so getPointAtLength(0) = base, (totalLen) = peak.
// Curves go generally up-left with organic bumps — no symmetric triangle.
const CLIMB_D = [
  'M 135 785',
  'C 122 748, 118 712, 112 675',  // lower slope
  'C 106 638, 118 608, 110 570',  // first bump right
  'C 102 532, 88  508,  97 470',  // curves left then slight right
  'C 106 432, 120 406, 110 368',  // another rightward lean (rocky)
  'C  99 330,  84 307,  92 268',  // back left
  'C 101 229, 116 204, 104 165',  // upper section, rightward lean
  'C  91 126,  76 102,  84  63',  // near-summit rocky
  'C  88  34,  54  16,  16  12',  // final push to summit
].join(' ')

const BASE   = { x: 135, y: 785 }
const SUMMIT = { x: 16,  y: 12  }

const GRIND_MSGS = [
  { from: 0.04, text: 'grinding...' },
  { from: 0.18, text: 'solving leetcode...' },
  { from: 0.33, text: 'debugging at 3am...' },
  { from: 0.48, text: 'reading the docs...' },
  { from: 0.63, text: 'shipping side projects...' },
  { from: 0.78, text: 'one more commit...' },
  { from: 0.90, text: 'almost there...' },
]

// ─── Stickman ─────────────────────────────────────────────────────────────────
function Stickman({ angle, progress, tumble }: {
  angle: number; progress: number; tumble: number
}) {
  const ph     = progress * 55
  const lFootX = -5 + Math.sin(ph) * 5.5
  const rFootX =  5 - Math.sin(ph) * 5.5
  const lArmX  = -8 - Math.sin(ph) * 3
  const rArmX  =  8 + Math.sin(ph) * 3

  return (
    <g transform={`rotate(${angle + tumble})`}>
      <circle cx="0" cy="-30" r="5.5"
        fill="none" stroke="white" strokeWidth="1.8" />
      <line x1="0" y1="-24" x2="0" y2="-10"
        stroke="white" strokeWidth="1.8" />
      <line x1="0" y1="-18" x2={lArmX} y2="-12"
        stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="0" y1="-18" x2={rArmX} y2="-12"
        stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="0" y1="-10" x2={lFootX} y2="2"
        stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="0" y1="-10" x2={rFootX} y2="2"
        stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  )
}

// ─── Laptop at summit ─────────────────────────────────────────────────────────
function Laptop({ visible }: { visible: boolean }) {
  return (
    <g
      transform={`translate(${SUMMIT.x + 24}, ${SUMMIT.y + 4})`}
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease' }}
    >
      <rect x="-18" y="-28" width="36" height="22" rx="2"
        fill="none" stroke="white" strokeWidth="1.4" />
      <line x1="-13" y1="-22" x2=" 4" y2="-22" stroke="white" strokeWidth="0.8" opacity="0.4" />
      <line x1="-13" y1="-17" x2="10" y2="-17" stroke="white" strokeWidth="0.8" opacity="0.4" />
      <line x1="-13" y1="-12" x2=" 7" y2="-12" stroke="white" strokeWidth="0.8" opacity="0.4" />
      <rect x="-21" y="-6" width="42" height="5" rx="1.5"
        fill="none" stroke="white" strokeWidth="1.4" />
    </g>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MountainClimb() {
  const pathRef = useRef<SVGPathElement>(null)

  const [man, setMan] = useState({
    x: BASE.x, y: BASE.y,
    angle: 0, progress: 0, tumble: 0,
  })
  const [atTop, setAtTop]       = useState(false)
  const [showNgu, setShowNgu]   = useState(false)
  const [grindMsg, setGrindMsg] = useState<string | null>(null)

  const isFalling       = useRef(false)
  const baselineScroll  = useRef(0)
  const lastRaw         = useRef(0)
  const initAngle       = useRef(0)
  const fallRaf         = useRef<number | undefined>(undefined)
  const nguTimer        = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const len = path.getTotalLength()

    // Slope angle at base
    const p0 = path.getPointAtLength(0)
    const p1 = path.getPointAtLength(6)
    initAngle.current = Math.atan2(p1.y - p0.y, p1.x - p0.x) * (180 / Math.PI)
    setMan(m => ({ ...m, angle: initAngle.current }))

    const slopeAngle = (t: number) => {
      const d = 6
      const a = path.getPointAtLength(Math.max(0, t - d))
      const b = path.getPointAtLength(Math.min(len, t + d))
      return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI)
    }

    const applyProgress = (cp: number) => {
      const t  = cp * len
      const pt = path.getPointAtLength(t)
      const msg = [...GRIND_MSGS].reverse().find(m => m.from <= cp)?.text ?? null
      setMan({ x: pt.x, y: pt.y, angle: slopeAngle(t), progress: cp, tumble: 0 })
      setAtTop(cp > 0.93)
      setGrindMsg(cp >= 0.02 ? msg : null)
    }

    const triggerFall = (fromCP: number, rawAtFall: number) => {
      if (isFalling.current) return
      isFalling.current = true
      setShowNgu(true)
      setGrindMsg(null)
      setAtTop(false)
      clearTimeout(nguTimer.current)

      const t0   = fromCP * len
      const pt0  = path.getPointAtLength(t0)
      const ang0 = slopeAngle(t0)
      const t1   = performance.now()
      const DUR  = 600

      const tick = (now: number) => {
        const p    = Math.min(1, (now - t1) / DUR)
        const ease = p * p   // accelerate like gravity
        setMan({
          x:        pt0.x + (BASE.x - pt0.x) * ease,
          y:        pt0.y + (BASE.y - pt0.y) * ease,
          angle:    ang0,
          progress: fromCP * (1 - ease),
          tumble:   ease * 540,
        })
        if (p < 1) {
          fallRaf.current = requestAnimationFrame(tick)
        } else {
          isFalling.current = false
          // New baseline = where user currently is — they must scroll the rest to re-summit
          baselineScroll.current = Math.min(rawAtFall, 0.75)
          setMan({ x: BASE.x, y: BASE.y, angle: initAngle.current, progress: 0, tumble: 0 })
          nguTimer.current = setTimeout(() => setShowNgu(false), 900)
        }
      }
      cancelAnimationFrame(fallRaf.current!)
      fallRaf.current = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll <= 0) return
      const raw = Math.max(0, Math.min(1, window.scrollY / maxScroll))

      const span = 1 - baselineScroll.current
      const cp   = span > 0 ? Math.max(0, Math.min(1, (raw - baselineScroll.current) / span)) : 0

      // Scroll-up with meaningful climb progress → fall
      if (!isFalling.current && raw < lastRaw.current - 0.012 && cp > 0.08) {
        triggerFall(cp, raw)
      }
      lastRaw.current = raw
      if (!isFalling.current) applyProgress(cp)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(nguTimer.current)
      cancelAnimationFrame(fallRaf.current!)
    }
  }, [])

  // Map stickman SVG y (0-800) to a vh percentage for HTML overlay positioning
  const manTopVh = (man.y / 800) * 100

  return (
    <>
      {/* ── Mountain + stickman (fixed, left edge) ──────────────────────── */}
      <div style={{
        position: 'fixed', left: 0, top: 0,
        height: '100vh', width: 'auto',
        pointerEvents: 'none', zIndex: 10,
      }}>
        <svg
          viewBox="0 0 160 800"
          style={{ height: '100vh', width: 'auto', display: 'block', overflow: 'visible' }}
        >
          {/* Mountain slope — subtle white outline */}
          <path
            d={CLIMB_D}
            fill="none" stroke="white" strokeWidth="1.5" opacity="0.18"
          />

          {/* Hidden path used only for getPointAtLength() math */}
          <path ref={pathRef} d={CLIMB_D} fill="none" stroke="none" />

          {/* Laptop at summit */}
          <Laptop visible={atTop} />

          {/* Stickman — full opacity so it pops against the faint mountain */}
          <g transform={`translate(${man.x}, ${man.y})`}>
            <Stickman angle={man.angle} progress={man.progress} tumble={man.tumble} />
          </g>
        </svg>
      </div>

      {/* ── Grind message — floats just right of the mountain ───────────── */}
      {/* left: 20vh matches the SVG width (160/800 * 100vh = 20vh)         */}
      <div style={{
        position: 'fixed',
        left: 'calc(20vh + 10px)',
        top: `calc(${manTopVh}vh - 8px)`,
        pointerEvents: 'none', zIndex: 10,
        opacity: grindMsg && !showNgu ? 0.45 : 0,
        transition: 'opacity 0.45s ease',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'white', letterSpacing: '0.05em', whiteSpace: 'nowrap',
        }}>
          {grindMsg}
        </span>
      </div>

      {/* ── "never give up." — center screen on fall ────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 20,
        opacity: showNgu ? 1 : 0,
        transition: 'opacity 0.35s ease',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '13px',
          color: 'white', letterSpacing: '0.08em',
        }}>
          never give up.
        </span>
      </div>

      {/* ── "got the internship." — appears when stickman summits ───────── */}
      <div style={{
        position: 'fixed', top: '10%', left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none', zIndex: 20,
        opacity: atTop ? 1 : 0,
        transition: 'opacity 1s ease',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'white', letterSpacing: '0.06em', whiteSpace: 'nowrap',
        }}>
          got the internship.
        </span>
      </div>
    </>
  )
}
