'use client'

import { useEffect, useRef, useState } from 'react'

// ─── Scene constants ───────────────────────────────────────────────────────────
const PEAK   = { x: 500, y: 60 }
const L_BASE = { x: 120, y: 530 }
const R_BASE = { x: 880, y: 530 }

const MOUNTAIN_D = `M 0 532 L ${L_BASE.x} ${L_BASE.y} L ${PEAK.x} ${PEAK.y} L ${R_BASE.x} ${R_BASE.y} L 1000 532`
const CLIMB_D    = `M ${L_BASE.x} ${L_BASE.y} L ${PEAK.x} ${PEAK.y}`

// ─── Motivational grind messages tied to climb progress ───────────────────────
const GRIND_MSGS = [
  { from: 0.02, text: 'grinding...' },
  { from: 0.18, text: 'solving leetcode...' },
  { from: 0.33, text: 'debugging at 3am...' },
  { from: 0.48, text: 'reading the docs...' },
  { from: 0.63, text: 'shipping side projects...' },
  { from: 0.78, text: 'one more commit...' },
  { from: 0.90, text: 'almost there...' },
]

// ─── Stickman ─────────────────────────────────────────────────────────────────
// Feet at (0,0) local space. Rotated by slope angle to stand on the mountain face.
function Stickman({ angle, progress, tumble }: {
  angle: number
  progress: number
  tumble: number  // extra rotation for fall animation
}) {
  const ph     = progress * 55
  const lFootX = -4 + Math.sin(ph) * 4.5
  const rFootX =  4 - Math.sin(ph) * 4.5
  const lArmX  = -7 - Math.sin(ph) * 2.5
  const rArmX  =  7 + Math.sin(ph) * 2.5

  return (
    <g transform={`rotate(${angle + tumble})`}>
      <circle cx="0" cy="-22" r="4.5"
        fill="none" stroke="white" strokeWidth="1.5" />
      <line x1="0" y1="-17" x2="0" y2="-6"
        stroke="white" strokeWidth="1.5" />
      <line x1="0" y1="-13" x2={lArmX} y2="-9"
        stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="0" y1="-13" x2={rArmX} y2="-9"
        stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="0" y1="-6" x2={lFootX} y2="1"
        stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="0" y1="-6" x2={rFootX} y2="1"
        stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  )
}

// ─── Laptop reward ────────────────────────────────────────────────────────────
function Laptop({ visible }: { visible: boolean }) {
  return (
    <g
      transform={`translate(${PEAK.x}, 18)`}
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease' }}
    >
      <rect x="-17" y="-26" width="34" height="22" rx="2"
        fill="none" stroke="white" strokeWidth="1.3" />
      <line x1="-12" y1="-21" x2=" 3" y2="-21" stroke="white" strokeWidth="0.7" opacity="0.4" />
      <line x1="-12" y1="-16" x2=" 9" y2="-16" stroke="white" strokeWidth="0.7" opacity="0.4" />
      <line x1="-12" y1="-11" x2=" 6" y2="-11" stroke="white" strokeWidth="0.7" opacity="0.4" />
      <rect x="-20" y="-4" width="40" height="5" rx="1.5"
        fill="none" stroke="white" strokeWidth="1.3" />
    </g>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MountainClimb() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const pathRef       = useRef<SVGPathElement>(null)

  // Visual state (updated every frame / scroll tick)
  const [man, setMan] = useState({
    x: L_BASE.x, y: L_BASE.y,
    angle: 0, progress: 0, tumble: 0,
  })
  const [atTop, setAtTop]           = useState(false)
  const [showNeverGiveUp, setNgu]   = useState(false)
  const [scrollStarted, setStarted] = useState(false)
  const [grindMsg, setGrindMsg]     = useState<string | null>(null)

  // Scroll tracking refs (no re-render needed)
  const isFalling        = useRef(false)
  const baselineScroll   = useRef(0)       // rawProgress when current climb began
  const lastRawProgress  = useRef(0)
  const initialAngle     = useRef(0)       // slope angle at L_BASE
  const fallAnimRef      = useRef<number | undefined>(undefined)
  const nguTimeout       = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    const totalLen = path.getTotalLength()

    // Compute initial slope angle at L_BASE
    const p0 = path.getPointAtLength(0)
    const p1 = path.getPointAtLength(4)
    initialAngle.current = Math.atan2(p1.y - p0.y, p1.x - p0.x) * (180 / Math.PI)
    setMan(m => ({ ...m, angle: initialAngle.current }))

    // ── Helpers ────────────────────────────────────────────────────────────
    const computeAngle = (t: number) => {
      const d  = 4
      const pa = path.getPointAtLength(Math.max(0, t - d))
      const pb = path.getPointAtLength(Math.min(totalLen, t + d))
      return Math.atan2(pb.y - pa.y, pb.x - pa.x) * (180 / Math.PI)
    }

    const applyClimbProgress = (cp: number) => {
      const t  = cp * totalLen
      const pt = path.getPointAtLength(t)
      const msg = [...GRIND_MSGS].reverse().find(m => m.from <= cp)?.text ?? null
      setMan({ x: pt.x, y: pt.y, angle: computeAngle(t), progress: cp, tumble: 0 })
      setAtTop(cp > 0.93)
      setGrindMsg(cp >= 0.01 ? msg : null)
    }

    // ── Fall animation ──────────────────────────────────────────────────────
    const triggerFall = (fromCP: number, rawAtFall: number) => {
      if (isFalling.current) return
      isFalling.current = true

      setNgu(true)
      setGrindMsg(null)
      setAtTop(false)
      clearTimeout(nguTimeout.current)

      // Snapshot where the stickman is right now
      const fromT  = fromCP * totalLen
      const fromPt = path.getPointAtLength(fromT)
      const fromAng = computeAngle(fromT)

      const startTime  = performance.now()
      const DURATION   = 600

      const animate = (now: number) => {
        const elapsed = now - startTime
        const t       = Math.min(1, elapsed / DURATION)
        const ease    = t * t           // quadratic ease-in → accelerating fall

        setMan({
          x:        fromPt.x + (L_BASE.x - fromPt.x) * ease,
          y:        fromPt.y + (L_BASE.y - fromPt.y) * ease,
          angle:    fromAng,
          progress: fromCP * (1 - ease),
          tumble:   ease * 540,         // tumble 1.5 rotations while falling
        })

        if (t < 1) {
          fallAnimRef.current = requestAnimationFrame(animate)
        } else {
          // Landed — reset climb baseline to current raw scroll position
          isFalling.current = false
          baselineScroll.current = Math.min(rawAtFall, 0.85)
          setMan({ x: L_BASE.x, y: L_BASE.y,
                   angle: initialAngle.current, progress: 0, tumble: 0 })

          nguTimeout.current = setTimeout(() => setNgu(false), 900)
        }
      }

      cancelAnimationFrame(fallAnimRef.current!)
      fallAnimRef.current = requestAnimationFrame(animate)
    }

    // ── Scroll handler ──────────────────────────────────────────────────────
    const onScroll = () => {
      const el = containerRef.current
      if (!el) return

      const top        = el.getBoundingClientRect().top
      const scrollable = el.scrollHeight - window.innerHeight
      if (scrollable <= 0) return

      const raw = Math.max(0, Math.min(1, -top / scrollable))
      if (raw > 0.01) setStarted(true)

      // climbProgress: fraction of the remaining path from baseline → 1
      const span = 1 - baselineScroll.current
      const cp   = span > 0 ? Math.max(0, Math.min(1, (raw - baselineScroll.current) / span)) : 0

      // Detect scroll-up with meaningful progress → fall
      if (
        !isFalling.current &&
        raw < lastRawProgress.current - 0.006 &&
        cp > 0.08
      ) {
        triggerFall(cp, raw)
      }

      lastRawProgress.current = raw

      if (!isFalling.current) {
        applyClimbProgress(cp)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(nguTimeout.current)
      cancelAnimationFrame(fallAnimRef.current!)
    }
  }, [])

  return (
    <div ref={containerRef} style={{ height: '400vh', position: 'relative' }}>

      {/* ── Sticky viewport ────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh', overflow: 'hidden',
        borderTop: '1px solid var(--gray-800)',
      }}>

        {/* Section label */}
        <p style={{
          position: 'absolute', top: '2rem', left: '6vw', margin: 0,
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--text-muted)', zIndex: 2,
        }}>
          The Climb
        </p>

        {/* Scroll hint — fades once user scrolls */}
        <p style={{
          position: 'absolute', bottom: '2.5rem', left: '50%',
          transform: 'translateX(-50%)', margin: 0,
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          letterSpacing: '0.1em', color: 'var(--text-muted)',
          opacity: scrollStarted ? 0 : 0.5,
          transition: 'opacity 0.7s', zIndex: 2,
        }}>
          scroll ↓
        </p>

        {/* Grind message — bottom left, changes as stickman climbs */}
        <p style={{
          position: 'absolute', bottom: '2.5rem', left: '6vw', margin: 0,
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'white', letterSpacing: '0.05em',
          opacity: grindMsg && !showNeverGiveUp ? 0.5 : 0,
          transition: 'opacity 0.5s ease',
          zIndex: 2,
        }}>
          {grindMsg}
        </p>

        {/* "never give up." — appears on fall */}
        <p style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', margin: 0,
          fontFamily: 'var(--font-mono)', fontSize: '13px',
          color: 'white', letterSpacing: '0.08em',
          opacity: showNeverGiveUp ? 0.65 : 0,
          transition: 'opacity 0.35s ease', zIndex: 2,
        }}>
          never give up.
        </p>

        {/* "got the internship." — appears at summit */}
        <p style={{
          position: 'absolute', top: '13%', left: '50%',
          transform: 'translateX(-50%)', margin: 0,
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'white', letterSpacing: '0.06em', whiteSpace: 'nowrap',
          opacity: atTop ? 0.55 : 0,
          transition: 'opacity 1s ease', zIndex: 2,
        }}>
          got the internship.
        </p>

        {/* ── SVG scene ───────────────────────────────────────────────────── */}
        {/* viewBox starts at y=-10 to accommodate laptop drawn above peak    */}
        <svg
          viewBox="0 -10 1000 570"
          preserveAspectRatio="xMidYMax meet"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          {/* Mountain outline */}
          <path
            d={MOUNTAIN_D}
            fill="none" stroke="white" strokeWidth="1.5" opacity="0.75"
          />

          {/* Hidden path used only for getPointAtLength() math */}
          <path ref={pathRef} d={CLIMB_D} fill="none" stroke="none" />

          {/* Laptop reward at peak */}
          <Laptop visible={atTop} />

          {/* Stickman */}
          <g transform={`translate(${man.x}, ${man.y})`}>
            <Stickman angle={man.angle} progress={man.progress} tumble={man.tumble} />
          </g>
        </svg>

      </div>
    </div>
  )
}
