'use client'

import { useEffect, useRef, useState } from 'react'

// ─── Mountain slope ────────────────────────────────────────────────────────────
// ViewBox "0 0 160 800" — fixed right side, spans full viewport height.
// Path BASE → SUMMIT so getPointAtLength(0) = foot of mountain.
// BASE at lower-right of the strip (near screen's right edge, bottom).
// SUMMIT at upper-left of the strip (upper area, well inside the strip).
// Single organic slope — no symmetric angles, bezier curves only.
const CLIMB_D = [
  'M 136 788',
  'C 124 752, 120 716, 114 678',  // lower slope
  'C 108 640, 120 612, 112 574',  // bump right
  'C 104 536, 90 512, 100 474',   // lean back left
  'C 110 436, 124 410, 114 372',  // rocky rightward section
  'C 103 334, 86 310, 96 272',    // back left
  'C 106 234, 120 208, 108 168',  // upper section
  'C 95 128, 78 106, 88 68',      // near-summit rocky
  'C 92 42, 56 38, 22 92',        // final push — summit at (22, 92)
].join(' ')

const BASE   = { x: 136, y: 788 }  // lower-right → near screen's right edge, bottom
const SUMMIT = { x: 22,  y: 92  }  // upper-left of strip, y=92 → ~11.5% from top

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
// Feet at (0,0) local space. Proportions scaled up so it reads at small sizes.
function Stickman({ angle, progress, tumble }: {
  angle: number; progress: number; tumble: number
}) {
  const ph     = progress * 55
  const lFootX = -6 + Math.sin(ph) * 6
  const rFootX =  6 - Math.sin(ph) * 6
  const lArmX  = -10 - Math.sin(ph) * 3.5
  const rArmX  =  10 + Math.sin(ph) * 3.5

  return (
    <g transform={`rotate(${angle + tumble})`}>
      {/* head */}
      <circle cx="0" cy="-44" r="7.5"
        fill="none" stroke="white" strokeWidth="2" />
      {/* body */}
      <line x1="0" y1="-36" x2="0" y2="-14"
        stroke="white" strokeWidth="2" />
      {/* arms */}
      <line x1="0" y1="-28" x2={lArmX} y2="-20"
        stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="0" y1="-28" x2={rArmX} y2="-20"
        stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      {/* legs */}
      <line x1="0" y1="-14" x2={lFootX} y2="2"
        stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="0" y1="-14" x2={rFootX} y2="2"
        stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  )
}

// ─── Laptop reward ────────────────────────────────────────────────────────────
// Positioned above & left of summit so it's clearly in the viewBox
function Laptop({ visible }: { visible: boolean }) {
  return (
    <g
      transform={`translate(${SUMMIT.x + 18}, ${SUMMIT.y - 38})`}
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease' }}
    >
      <rect x="-20" y="-26" width="40" height="24" rx="2"
        fill="none" stroke="white" strokeWidth="1.5" />
      <line x1="-14" y1="-20" x2=" 4" y2="-20" stroke="white" strokeWidth="0.8" opacity="0.45" />
      <line x1="-14" y1="-15" x2="12" y2="-15" stroke="white" strokeWidth="0.8" opacity="0.45" />
      <line x1="-14" y1="-10" x2=" 8" y2="-10" stroke="white" strokeWidth="0.8" opacity="0.45" />
      <rect x="-23" y="-2" width="46" height="5" rx="1.5"
        fill="none" stroke="white" strokeWidth="1.5" />
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

  const isFalling      = useRef(false)
  const baselineScroll = useRef(0)
  const lastRaw        = useRef(0)
  const initAngle      = useRef(0)
  const maxScrollRef   = useRef(0)   // cached so resize keeps it accurate
  const fallRaf        = useRef<number | undefined>(undefined)
  const nguTimer       = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const len = path.getTotalLength()

    // Keep max scroll accurate on resize (dynamic content can change page height)
    const syncMaxScroll = () => {
      maxScrollRef.current = document.documentElement.scrollHeight - window.innerHeight
    }
    syncMaxScroll()
    window.addEventListener('resize', syncMaxScroll)

    // Slope angle at any path position
    const slopeAngle = (t: number) => {
      const d = 7
      const a = path.getPointAtLength(Math.max(0, t - d))
      const b = path.getPointAtLength(Math.min(len, t + d))
      return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI)
    }

    // Prime initial angle
    initAngle.current = slopeAngle(0)
    setMan(m => ({ ...m, angle: initAngle.current }))

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

      const tick = (now: number) => {
        const p    = Math.min(1, (now - t1) / 620)
        const ease = p * p        // quadratic ease-in = accelerating fall
        setMan({
          x:        pt0.x + (BASE.x - pt0.x) * ease,
          y:        pt0.y + (BASE.y - pt0.y) * ease,
          angle:    ang0,
          progress: fromCP * (1 - ease),
          tumble:   ease * 540,   // 1.5 rotations while falling
        })
        if (p < 1) {
          fallRaf.current = requestAnimationFrame(tick)
        } else {
          isFalling.current = false
          // New baseline: stickman must re-climb from current scroll position
          baselineScroll.current = Math.min(rawAtFall, 0.75)
          setMan({ x: BASE.x, y: BASE.y, angle: initAngle.current, progress: 0, tumble: 0 })
          nguTimer.current = setTimeout(() => setShowNgu(false), 950)
        }
      }
      cancelAnimationFrame(fallRaf.current!)
      fallRaf.current = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      const maxScroll = maxScrollRef.current
      if (maxScroll <= 0) return

      const raw = Math.max(0, Math.min(1, window.scrollY / maxScroll))
      const span = 1 - baselineScroll.current
      const cp   = span > 0
        ? Math.max(0, Math.min(1, (raw - baselineScroll.current) / span))
        : 0

      // Scrolling back up by > 1.2% of total page → trigger fall
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
      window.removeEventListener('resize', syncMaxScroll)
      clearTimeout(nguTimer.current)
      cancelAnimationFrame(fallRaf.current!)
    }
  }, [])

  // Map stickman SVG y (0–800) → vh percentage for HTML overlay alignment
  const manVh = (man.y / 800) * 100

  return (
    <>
      {/* ── Mountain + stickman (fixed right edge) ──────────────────────── */}
      <div style={{
        position: 'fixed', right: 0, top: 0,
        height: '100vh', width: 'auto',
        pointerEvents: 'none', zIndex: 10,
        overflow: 'visible',
      }}>
        <svg
          viewBox="0 0 160 800"
          style={{ height: '100vh', width: 'auto', display: 'block', overflow: 'visible' }}
        >
          {/* Mountain slope — faint so it reads as background */}
          <path d={CLIMB_D} fill="none" stroke="white" strokeWidth="1.5" opacity="0.18" />

          {/* Hidden path for getPointAtLength() math */}
          <path ref={pathRef} d={CLIMB_D} fill="none" stroke="none" />

          {/* Laptop at summit */}
          <Laptop visible={atTop} />

          {/* Stickman */}
          <g transform={`translate(${man.x}, ${man.y})`}>
            <Stickman angle={man.angle} progress={man.progress} tumble={man.tumble} />
          </g>
        </svg>
      </div>

      {/* ── Grind message — floats just left of the mountain ────────────── */}
      {/* right: 20vh matches SVG width (160/800 × 100vh = 20vh)            */}
      <div style={{
        position: 'fixed',
        right: 'calc(20vh + 16px)',
        top: `calc(${manVh}vh - 7px)`,
        pointerEvents: 'none', zIndex: 10,
        opacity: grindMsg && !showNgu ? 1 : 0,
        transition: 'opacity 0.45s ease',
        textAlign: 'right',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--violet-soft)',
          letterSpacing: '0.04em', whiteSpace: 'nowrap',
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
          color: 'var(--text-secondary)',
          letterSpacing: '0.08em',
        }}>
          never give up.
        </span>
      </div>

      {/* ── "got the internship." — near the summit ─────────────────────── */}
      <div style={{
        position: 'fixed',
        top: '13%',
        right: 'calc(20vh + 16px)',
        pointerEvents: 'none', zIndex: 20,
        opacity: atTop ? 1 : 0,
        transition: 'opacity 1s ease',
        textAlign: 'right',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'var(--amber-bright)',
          letterSpacing: '0.06em', whiteSpace: 'nowrap',
        }}>
          got the internship.
        </span>
      </div>
    </>
  )
}
