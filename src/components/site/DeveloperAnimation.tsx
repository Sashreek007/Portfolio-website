// Animated developer at desk — portrait line art (380×520 viewBox)
// Thick-stroke arms/legs so the figure reads as a real human, not a stick figure.
// 14 s loop: typing → reach for coffee → sip → return → back to typing.
// Pure SVG + CSS/SMIL. Uses currentColor; parent controls tint + opacity.

type Props = { className?: string; style?: React.CSSProperties };

export default function DeveloperAnimation({ className, style }: Props) {
  const armValues = [
    "M248,254 C240,292 222,350 196,404",  // 0.00  typing
    "M248,254 C240,292 222,350 196,404",  // 0.50  still typing
    "M248,254 C256,292 298,342 322,374",  // 0.618 reach for cup
    "M248,254 C252,234 262,212 268,200",  // 0.75  sip
    "M248,254 C256,292 298,342 322,374",  // 0.821 return cup
    "M248,254 C240,292 222,350 196,404",  // 0.88  back to keyboard
    "M248,254 C240,292 222,350 196,404",  // 1.00  typing
  ].join(";");

  const armKT = "0;0.50;0.618;0.75;0.821;0.88;1";
  const armKS = "0 0 1 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0 0 1 1";

  // Cup rim center: (327, 372). Sip target mouth ~(268, 208). Delta ≈ (-59, -164).
  const cupValues = "0,0; 0,0; -59,-164; 0,0; 0,0";
  const cupKT     = "0;0.618;0.75;0.821;1";
  const cupKS     = "0 0 1 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0 0 1 1";

  const headValues = "0 265 188; 0 265 188; -8 265 188; 0 265 188; 0 265 188";
  const headKT     = "0;0.618;0.75;0.821;1";
  const headKS     = "0 0 1 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0 0 1 1";

  const mouthValues = [
    "M251,210 Q258,211 265,210",
    "M251,210 Q258,211 265,210",
    "M251,212 Q258,217 265,212",
    "M251,210 Q258,211 265,210",
    "M251,210 Q258,211 265,210",
  ].join(";");

  return (
    <svg
      viewBox="0 0 380 520"
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
            0%   { opacity:.65; transform:translateY(0) scaleX(1) }
            100% { opacity:0;   transform:translateY(-22px) scaleX(1.3) }
          }
          @keyframes dev-steam-b {
            0%   { opacity:.65; transform:translateY(0) scaleX(1) }
            100% { opacity:0;   transform:translateY(-20px) scaleX(.85) }
          }
          @keyframes dev-steam-c {
            0%   { opacity:.65; transform:translateY(0) scaleX(1) }
            100% { opacity:0;   transform:translateY(-24px) scaleX(1.1) }
          }
          @keyframes dev-finger-l {
            0%,40%,80%,100% { transform:translateY(0) }
            20%,60%         { transform:translateY(3px) }
          }
          @keyframes dev-finger-r {
            0%,40%,80%,100% { transform:translateY(3px) }
            20%,60%         { transform:translateY(0) }
          }
        `}</style>
      </defs>

      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">

        {/* ── BACKGROUND WINDOW (room context) ─────────────────────── */}
        <rect x="24" y="22" width="126" height="96" rx="3" strokeWidth="1.2" opacity="0.18" />
        <line x1="24" y1="70" x2="150" y2="70" strokeWidth="0.8" opacity="0.14" />
        <line x1="87" y1="22" x2="87" y2="118" strokeWidth="0.8" opacity="0.14" />

        {/* ── DESK ─────────────────────────────────────────────────── */}
        <line x1="10"  y1="414" x2="370" y2="414" strokeWidth="2.2" />
        <line x1="10"  y1="421" x2="370" y2="421" strokeWidth="0.8" opacity="0.24" />
        <line x1="28"  y1="421" x2="28"  y2="510" strokeWidth="1.5" opacity="0.5" />
        <line x1="352" y1="421" x2="352" y2="510" strokeWidth="1.5" opacity="0.5" />
        <line x1="28"  y1="474" x2="352" y2="474" strokeWidth="0.7" opacity="0.2" />

        {/* ── MONITOR ──────────────────────────────────────────────── */}
        <rect x="68"  y="408" width="44" height="6"   rx="2"   strokeWidth="1.3" />
        <line x1="90" y1="408" x2="90"  y2="370"                strokeWidth="1.5" />
        <rect x="16"  y="140" width="148" height="230" rx="5"   strokeWidth="1.8" />
        <rect x="24"  y="148" width="132" height="214" rx="2.5" strokeWidth="0.9" opacity="0.44" />
        <rect x="24"  y="148" width="132" height="214" rx="2.5" fill="currentColor" stroke="none" opacity="0.04" />

        {/* Code lines */}
        <line x1="32" y1="164" x2="108" y2="164" strokeWidth="1" opacity="0.55" />
        <line x1="32" y1="180" x2="96"  y2="180" strokeWidth="1" opacity="0.55" />
        <line x1="40" y1="196" x2="142" y2="196" strokeWidth="1" opacity="0.55" />
        <line x1="40" y1="212" x2="124" y2="212" strokeWidth="1" opacity="0.55" />
        <line x1="32" y1="228" x2="112" y2="228" strokeWidth="1" opacity="0.55" />
        <line x1="40" y1="244" x2="148" y2="244" strokeWidth="1" opacity="0.55" />
        <line x1="32" y1="260" x2="90"  y2="260" strokeWidth="1" opacity="0.55" />
        <line x1="40" y1="276" x2="136" y2="276" strokeWidth="1" opacity="0.55" />
        <line x1="32" y1="292" x2="106" y2="292" strokeWidth="1" opacity="0.55" />
        <line x1="40" y1="308" x2="128" y2="308" strokeWidth="1" opacity="0.55" />
        <line x1="32" y1="324" x2="92"  y2="324" strokeWidth="1" opacity="0.55" />
        <line x1="40" y1="340" x2="120" y2="340" strokeWidth="1" opacity="0.55" />

        {/* Blinking cursor */}
        <rect x="122" y="334" width="6" height="10" fill="currentColor" stroke="none"
          style={{ animation: "dev-cursor 1s steps(2) infinite" }}
        />

        {/* ── KEYBOARD ─────────────────────────────────────────────── */}
        <rect x="162" y="405" width="68" height="9" rx="2" strokeWidth="1.4" />
        <line x1="168" y1="407.5" x2="226" y2="407.5" strokeWidth="0.6" opacity="0.35" />
        <line x1="170" y1="410.5" x2="224" y2="410.5" strokeWidth="0.6" opacity="0.35" />

        {/* ── COFFEE CUP GROUP ─────────────────────────────────────── */}
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
          <path
            d="M310,372 L308,408 Q308,411 311,411 L344,411 Q347,411 346,408 L344,372 Z"
            strokeWidth="1.5"
          />
          <ellipse cx="327" cy="372" rx="17" ry="4.5" strokeWidth="1.4" />
          <path d="M345,380 Q362,380 362,388 Q362,396 345,394" strokeWidth="1.4" fill="none" />
          <ellipse cx="327" cy="375" rx="12" ry="2.5" strokeWidth="0.8" opacity="0.5" />

          <g>
            <animate attributeName="opacity" values="1;0;1" keyTimes="0;0.55;0.88"
              calcMode="discrete" dur="14s" repeatCount="indefinite" />
            <path d="M320,368 Q318,358 320,348 Q322,338 320,328" strokeWidth="1.1" fill="none"
              style={{ animation: "dev-steam-a 2.4s ease-in infinite", transformOrigin: "320px 368px" }} />
            <path d="M327,366 Q325,356 327,346 Q329,336 327,326" strokeWidth="1.1" fill="none"
              style={{ animation: "dev-steam-b 2.4s ease-in .8s infinite", transformOrigin: "327px 366px" }} />
            <path d="M334,368 Q332,358 334,348 Q336,338 334,328" strokeWidth="1.1" fill="none"
              style={{ animation: "dev-steam-c 2.4s ease-in 1.6s infinite", transformOrigin: "334px 368px" }} />
          </g>
        </g>

        {/* ── CHAIR ────────────────────────────────────────────────── */}
        <rect x="214" y="414" width="82" height="12" rx="3" strokeWidth="1.6" />
        <rect x="284" y="322" width="10" height="98" rx="3" strokeWidth="1.6" />
        <path d="M216,426 L216,442 L228,442" strokeWidth="1.1" opacity="0.5" fill="none" />
        <path d="M294,426 L294,442 L283,442" strokeWidth="1.1" opacity="0.5" fill="none" />
        <line x1="254" y1="426" x2="254" y2="462" strokeWidth="1.4" opacity="0.6" />
        <path d="M226,462 L254,462 L282,462" strokeWidth="1.1" opacity="0.4" fill="none" />
        <circle cx="226" cy="462" r="3"   strokeWidth="1" opacity="0.38" />
        <circle cx="254" cy="462" r="3"   strokeWidth="1" opacity="0.38" />
        <circle cx="282" cy="462" r="3"   strokeWidth="1" opacity="0.38" />

        {/* ── PERSON ───────────────────────────────────────────────── */}

        {/* Legs — thick round strokes, thighs angled forward (left) */}
        <path
          d="M253,414 C248,434 238,450 226,462 C214,474 212,490 210,514"
          strokeWidth="12" strokeLinecap="round"
        />
        <path
          d="M267,414 C262,434 252,450 240,462 C228,474 226,490 224,514"
          strokeWidth="12" strokeLinecap="round" opacity="0.52"
        />
        {/* Near foot */}
        <path d="M210,514 Q200,518 184,516" strokeWidth="10" strokeLinecap="round" />

        {/* Torso — hoodie/shirt silhouette, closed outline */}
        <path
          d="M244,242 C238,270 236,332 238,414 L280,414 C282,332 280,270 274,242 Z"
          strokeWidth="2.2" fill="none"
        />
        {/* Hoodie pocket hint */}
        <path d="M250,348 Q259,353 268,348" strokeWidth="1" fill="none" opacity="0.36" />

        {/* Neck — thick */}
        <line x1="265" y1="214" x2="265" y2="242" strokeWidth="10" strokeLinecap="round" />

        {/* ── HEAD ─────────────────────────────────────────────────── */}
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
          <circle cx="265" cy="188" r="26" strokeWidth="1.8" />

          {/* Hair — thick arc for volume */}
          <path
            d="M240,185 C238,163 242,147 254,141 Q265,136 278,141 Q292,148 291,170 Q291,182 287,190"
            strokeWidth="9" strokeLinecap="round" fill="none"
          />
          {/* Front hair strand */}
          <path d="M241,183 Q236,177 238,193" strokeWidth="5.5" strokeLinecap="round" fill="none" opacity="0.68" />

          {/* Ear */}
          <path d="M289,179 Q298,186 289,195" strokeWidth="1.5" fill="none" />

          {/* Glasses */}
          <circle cx="252" cy="190" r="7.5" strokeWidth="1.1" opacity="0.65" />
          <line x1="259.5" y1="189" x2="264" y2="189" strokeWidth="1" opacity="0.65" />

          {/* Eye */}
          <circle cx="252" cy="190" r="2.5" fill="currentColor" stroke="none" />

          {/* Nose */}
          <path d="M248,196 Q245,202 248,206" strokeWidth="1.2" fill="none" />

          {/* Mouth */}
          <path d="M251,210 Q258,211 265,210" strokeWidth="1.1" fill="none" opacity="0.65">
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

        {/* ── BACK ARM (far arm, roughly static on keyboard) ────────── */}
        <path
          d="M272,258 C262,294 248,350 224,402"
          strokeWidth="8" fill="none" opacity="0.46"
        />

        {/* ── FOREGROUND ARM (animated — reaches and sips) ──────────── */}
        <path
          d="M248,254 C240,292 222,350 196,404"
          strokeWidth="11" fill="none"
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

        {/* ── TYPING FINGERS ───────────────────────────────────────── */}
        <g>
          <animate attributeName="opacity" values="1;0;1" keyTimes="0;0.50;0.88"
            calcMode="discrete" dur="14s" repeatCount="indefinite" />
          <circle cx="192" cy="404" r="4.5" fill="currentColor" stroke="none"
            style={{ animation: "dev-finger-l .9s ease-in-out infinite", transformOrigin: "192px 404px" }}
          />
          <circle cx="203" cy="404" r="4.5" fill="currentColor" stroke="none"
            style={{ animation: "dev-finger-r .9s ease-in-out .45s infinite", transformOrigin: "203px 404px" }}
          />
        </g>

      </g>
    </svg>
  );
}
