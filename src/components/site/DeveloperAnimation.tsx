// Animated line-drawing of a developer — side profile facing left.
// Typing continuously; every ~14s reaches for coffee, sips, returns.
// Pure SVG + CSS/SMIL animations. No JS, no external library.
// Uses currentColor so the parent can tint + control opacity.

type Props = { className?: string; style?: React.CSSProperties };

export default function DeveloperAnimation({ className, style }: Props) {
  // Arm path keyframe values (7 keyTimes: 0, .50, .618, .75, .821, .88, 1)
  const armValues = [
    "M268,194 L248,215 L213,226",  // 0.00  — typing
    "M268,194 L248,215 L213,226",  // 0.50  — still typing
    "M268,194 L272,218 L342,222",  // 0.618 — hand at cup
    "M268,194 L252,210 L255,184",  // 0.75  — sipping (hand near face)
    "M268,194 L272,218 L342,222",  // 0.821 — returning cup
    "M268,194 L248,215 L213,226",  // 0.88  — back to keyboard
    "M268,194 L248,215 L213,226",  // 1.00  — typing
  ].join(";");

  const armKT   = "0;0.50;0.618;0.75;0.821;0.88;1";
  const armKS   = "0 0 1 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0 0 1 1";

  // Cup translate: rises to (-82,-34) at keyTime 0.75
  const cupValues = "0,0; 0,0; -82,-34; 0,0; 0,0";
  const cupKT     = "0;0.618;0.75;0.821;1";
  const cupKS     = "0 0 1 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0 0 1 1";

  // Head nod: forward -9° during sip
  const headValues = "0 266 160; 0 266 160; -9 266 160; 0 266 160; 0 266 160";
  const headKT     = "0;0.618;0.75;0.821;1";
  const headKS     = "0 0 1 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0 0 1 1";

  // Mouth: slight smile during sip
  const mouthValues = [
    "M250,172 Q254,173 258,172",  // 0      — neutral
    "M250,172 Q254,173 258,172",  // 0.618
    "M250,174 Q254,178 258,174",  // 0.75   — smile
    "M250,172 Q254,173 258,172",  // 0.821
    "M250,172 Q254,173 258,172",  // 1
  ].join(";");

  return (
    <svg
      viewBox="0 0 380 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      <defs>
        <style>{`
          @keyframes dev-cursor {
            0%,48%  { opacity:1 }
            50%,98% { opacity:0 }
            100%    { opacity:1 }
          }
          @keyframes dev-steam-a {
            0%   { opacity:.65; transform:translateY(0)    scaleX(1)   }
            100% { opacity:0;   transform:translateY(-22px) scaleX(1.3) }
          }
          @keyframes dev-steam-b {
            0%   { opacity:.65; transform:translateY(0)    scaleX(1)   }
            100% { opacity:0;   transform:translateY(-20px) scaleX(.85) }
          }
          @keyframes dev-steam-c {
            0%   { opacity:.65; transform:translateY(0)    scaleX(1)   }
            100% { opacity:0;   transform:translateY(-24px) scaleX(1.1) }
          }
          @keyframes dev-finger-l {
            0%,40%,80%,100% { transform:translateY(0)    }
            20%,60%         { transform:translateY(2.5px) }
          }
          @keyframes dev-finger-r {
            0%,40%,80%,100% { transform:translateY(2px)  }
            20%,60%         { transform:translateY(0)    }
          }
        `}</style>
      </defs>

      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">

        {/* ── DESK ─────────────────────────────────────────────────── */}
        <line x1="12"  y1="234" x2="368" y2="234" strokeWidth="1.8" />
        <line x1="12"  y1="240" x2="368" y2="240" strokeWidth="0.7" opacity="0.28" />
        <line x1="24"  y1="240" x2="24"  y2="288" strokeWidth="1.3" opacity="0.55" />
        <line x1="356" y1="240" x2="356" y2="288" strokeWidth="1.3" opacity="0.55" />
        <line x1="24"  y1="270" x2="356" y2="270" strokeWidth="0.7" opacity="0.22" />

        {/* ── MONITOR ──────────────────────────────────────────────── */}
        {/* Stand base */}
        <rect x="118" y="228" width="48" height="6" rx="2" strokeWidth="1.2" />
        {/* Stand neck */}
        <line x1="142" y1="228" x2="142" y2="188" strokeWidth="1.4" />
        {/* Screen housing */}
        <rect x="76" y="86" width="132" height="102" rx="4" strokeWidth="1.7" />
        {/* Screen face */}
        <rect x="84" y="94" width="116" height="86" rx="2" strokeWidth="0.8" opacity="0.45" />
        {/* Screen glow (lit face) */}
        <rect x="84" y="94" width="116" height="86" rx="2" fill="currentColor" stroke="none" opacity="0.04" />

        {/* Code lines */}
        <line x1="90"  y1="104" x2="156" y2="104" strokeWidth="0.9" opacity="0.55" />
        <line x1="90"  y1="113" x2="144" y2="113" strokeWidth="0.9" opacity="0.55" />
        <line x1="96"  y1="122" x2="180" y2="122" strokeWidth="0.9" opacity="0.55" />
        <line x1="96"  y1="131" x2="165" y2="131" strokeWidth="0.9" opacity="0.55" />
        <line x1="90"  y1="140" x2="152" y2="140" strokeWidth="0.9" opacity="0.55" />
        <line x1="96"  y1="149" x2="190" y2="149" strokeWidth="0.9" opacity="0.55" />
        <line x1="90"  y1="158" x2="136" y2="158" strokeWidth="0.9" opacity="0.55" />
        <line x1="96"  y1="167" x2="174" y2="167" strokeWidth="0.9" opacity="0.55" />

        {/* Blinking cursor */}
        <rect
          x="176" y="161" width="5" height="8"
          fill="currentColor" stroke="none"
          style={{ animation: "dev-cursor 1s steps(2) infinite" }}
        />

        {/* ── KEYBOARD ─────────────────────────────────────────────── */}
        <rect x="180" y="226" width="64" height="7" rx="1.5" strokeWidth="1.2" />
        <line x1="186" y1="228.5" x2="240" y2="228.5" strokeWidth="0.5" opacity="0.38" />
        <line x1="188" y1="231.5" x2="238" y2="231.5" strokeWidth="0.5" opacity="0.38" />

        {/* ── COFFEE CUP GROUP (translates during sip) ─────────────── */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values={cupValues}
            keyTimes={cupKT}
            dur="14s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines={cupKS}
          />

          {/* Cup body */}
          <path
            d="M328,207 L326,231 Q326,233 329,233 L350,233 Q353,233 352,231 L350,207 Z"
            strokeWidth="1.4"
          />
          {/* Rim */}
          <ellipse cx="339" cy="207" rx="11" ry="3.5" strokeWidth="1.3" />
          {/* Handle */}
          <path
            d="M351,215 Q364,215 364,222 Q364,229 351,227"
            strokeWidth="1.3" fill="none"
          />
          {/* Liquid surface */}
          <ellipse cx="339" cy="209" rx="8" ry="2" strokeWidth="0.7" opacity="0.5" />

          {/* Steam (hidden while cup is moving) */}
          <g>
            <animate
              attributeName="opacity"
              values="1;0;1"
              keyTimes="0;0.55;0.88"
              calcMode="discrete"
              dur="14s"
              repeatCount="indefinite"
            />
            <path d="M334,204 Q332,198 334,192 Q336,186 334,180"
              strokeWidth="1" fill="none"
              style={{ animation: "dev-steam-a 2.4s ease-in infinite", transformOrigin: "334px 204px" }}
            />
            <path d="M339,203 Q337,197 339,191 Q341,185 339,179"
              strokeWidth="1" fill="none"
              style={{ animation: "dev-steam-b 2.4s ease-in .8s infinite", transformOrigin: "339px 203px" }}
            />
            <path d="M344,204 Q342,198 344,192 Q346,186 344,180"
              strokeWidth="1" fill="none"
              style={{ animation: "dev-steam-c 2.4s ease-in 1.6s infinite", transformOrigin: "344px 204px" }}
            />
          </g>
        </g>

        {/* ── CHAIR ────────────────────────────────────────────────── */}
        {/* Seat */}
        <rect x="222" y="232" width="72" height="10" rx="2" strokeWidth="1.4" />
        {/* Backrest */}
        <rect x="283" y="163" width="9" height="75" rx="2" strokeWidth="1.4" />
        {/* Armrests */}
        <path d="M224,242 L224,255 L233,255" strokeWidth="1" opacity="0.5" fill="none" />
        <path d="M293,242 L293,255 L284,255" strokeWidth="1" opacity="0.5" fill="none" />
        {/* Pedestal + casters */}
        <line x1="257" y1="242" x2="257" y2="268" strokeWidth="1.2" opacity="0.65" />
        <path d="M228,268 L257,268 L286,268" strokeWidth="1" opacity="0.45" fill="none" />
        <circle cx="228" cy="268" r="2.5" strokeWidth="0.9" opacity="0.4" />
        <circle cx="257" cy="268" r="2.5" strokeWidth="0.9" opacity="0.4" />
        <circle cx="286" cy="268" r="2.5" strokeWidth="0.9" opacity="0.4" />

        {/* ── PERSON ───────────────────────────────────────────────── */}

        {/* Legs */}
        <line x1="257" y1="234" x2="224" y2="234" strokeWidth="1.6" />
        <line x1="224" y1="234" x2="224" y2="278" strokeWidth="1.6" />
        <path d="M224,278 Q216,282 206,280" strokeWidth="1.4" fill="none" />

        {/* Torso */}
        <path
          d="M258,191 C252,202 251,220 253,232 L277,232 C278,220 279,202 274,191 Z"
          strokeWidth="1.6"
        />
        {/* Shoulder hint */}
        <path d="M257,192 Q266,188 274,192" strokeWidth="1.2" fill="none" opacity="0.65" />

        {/* Neck */}
        <line x1="265" y1="177" x2="266" y2="191" strokeWidth="1.6" />

        {/* ── HEAD (nods during sip) ────────────────────────────────── */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={headValues}
            keyTimes={headKT}
            dur="14s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines={headKS}
          />

          {/* Skull */}
          <circle cx="266" cy="160" r="19" strokeWidth="1.7" />

          {/* Hair — organic arc, not a perfect semicircle */}
          <path
            d="M250,157 Q251,135 266,133 Q282,135 284,154"
            strokeWidth="1.5" fill="none"
          />
          {/* Front strand */}
          <path d="M251,155 Q246,152 248,164" strokeWidth="1.1" fill="none" opacity="0.65" />

          {/* Ear (far side, right of head in side profile) */}
          <path d="M283,156 Q290,161 283,168" strokeWidth="1.3" fill="none" />

          {/* Glasses frame */}
          <circle cx="253" cy="160" r="5.5" strokeWidth="1" opacity="0.6" />
          {/* Bridge */}
          <line x1="258.5" y1="158.5" x2="262" y2="158.5" strokeWidth="0.8" opacity="0.6" />

          {/* Eye (inside glasses) */}
          <circle cx="253" cy="160" r="1.6" fill="currentColor" stroke="none" />

          {/* Nose */}
          <path d="M249,163 Q246,167 249,169" strokeWidth="1" fill="none" />

          {/* Mouth — animates to smile during sip */}
          <path d="M250,172 Q254,173 258,172" strokeWidth="0.9" fill="none" opacity="0.6">
            <animate
              attributeName="d"
              values={mouthValues}
              keyTimes={headKT}
              dur="14s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines={headKS}
            />
          </path>
        </g>

        {/* ── BACKGROUND ARM (far arm, static on keyboard) ──────────── */}
        <path
          d="M273,196 L256,217 L224,228"
          strokeWidth="1.3" opacity="0.45" fill="none"
        />

        {/* ── FOREGROUND ARM (animated — reaches and sips) ──────────── */}
        <path
          d="M268,194 L248,215 L213,226"
          strokeWidth="1.9" fill="none"
        >
          <animate
            attributeName="d"
            values={armValues}
            keyTimes={armKT}
            dur="14s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines={armKS}
          />
        </path>

        {/* ── TYPING FINGERS (hidden during coffee animation) ───────── */}
        <g>
          <animate
            attributeName="opacity"
            values="1;0;1"
            keyTimes="0;0.50;0.88"
            calcMode="discrete"
            dur="14s"
            repeatCount="indefinite"
          />
          <circle cx="208" cy="226" r="2.8" fill="currentColor" stroke="none"
            style={{ animation: "dev-finger-l .9s ease-in-out infinite", transformOrigin: "208px 226px" }}
          />
          <circle cx="216" cy="226" r="2.8" fill="currentColor" stroke="none"
            style={{ animation: "dev-finger-r .9s ease-in-out .45s infinite", transformOrigin: "216px 226px" }}
          />
        </g>

      </g>
    </svg>
  );
}
