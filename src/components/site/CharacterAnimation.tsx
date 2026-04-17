// CharacterAnimation — Cartoon-stylized developer at desk.
// Hooded character (violet hoodie) typing on a laptop, sips coffee periodically,
// briefly stretches, then resumes. Pure SVG with CSS keyframes + SMIL animations.
// 16-second loop. ViewBox 600×700 (portrait), scales to currentColor where useful.
//
// Scene composition (back-to-front z-order):
//   1. Wall background gradient + window light
//   2. Bookshelf silhouette (subtle, left-back)
//   3. Desk surface and front edge
//   4. Chair backrest (peeking behind character)
//   5. CHARACTER: hood-back → head → hair → glasses → eyes → eyebrows →
//      nose → mouth → hood-front → drawstrings → hoodie torso → pocket
//   6. Desk items: plant pot + leaves, notebook, laptop, coffee mug
//   7. Steam wisps over coffee
//   8. Front arm + hand + fingers (animated, in front of laptop)

type Props = { className?: string; style?: React.CSSProperties };

export default function CharacterAnimation({ className, style }: Props) {
  // ── PALETTE (theme-aligned) ──────────────────────────────────────────────
  const SKIN          = "#D4A373";
  const SKIN_SHADOW   = "#A87D54";
  const HAIR          = "#2C1810";
  const HOODIE        = "#534AB7";
  const HOODIE_DARK   = "#3C3489";
  const HOODIE_LIGHT  = "#7F77DD";
  const HOOD_INSIDE   = "#1B1838";
  const CORD          = "#B4B2A9";
  const GLASSES       = "#161614";
  const EYE           = "#1A0E08";
  const MOUTH         = "#5C2828";
  const MUG           = "#C97A24";
  const MUG_DARK      = "#8C5210";
  const MUG_HIGHLIGHT = "#E8A052";
  const COFFEE_LIQ    = "#3D2010";
  const STEAM         = "#E8E6DF";
  const PLANT_POT     = "#A35E12";
  const PLANT_POT_DK  = "#6E3F09";
  const LEAF          = "#1D9E75";
  const LEAF_LIGHT    = "#5DCAA5";
  const PAGE          = "#E8E6DF";
  const PAGE_LINE     = "#888780";
  const LAPTOP        = "#2A2A28";
  const LAPTOP_DARK   = "#0E0E0C";
  const SCREEN_BG     = "#161614";
  const CODE_VIOLET   = "#7F77DD";
  const CODE_GREEN    = "#5DCAA5";
  const CODE_CREAM    = "#E8E6DF";
  const CODE_MUTED    = "#5F5E5A";
  const DESK          = "#5F4E3D";
  const DESK_DARK     = "#3D3025";
  const DESK_LIGHT    = "#7C6753";
  const WINDOW_LIGHT  = "#3C3489";
  const BOOKSHELF     = "#2C2C2A";

  // ── ANIMATION TIMING (16s master cycle, 7 keyframes) ────────────────────
  // Phases:  0–5s typing | 5–6.5s thinking | 6.5–8s reach | 8–10s sip
  //         10–12s lower+smile | 12–16s typing
  // KeyTimes: 0 / 0.3125 / 0.40625 / 0.50 / 0.625 / 0.75 / 1
  const KT  = "0;0.3125;0.40625;0.50;0.625;0.75;1";
  const EZ  = "0.42 0 0.58 1";
  const KS  = `${EZ}; ${EZ}; ${EZ}; ${EZ}; ${EZ}; 0 0 1 1`;

  // Front arm (right arm of character — animates between keyboard / cup / mouth)
  // Shoulder anchor at (390, 320); elbow + hand morph through the cycle.
  const armValues = [
    "M390,318 C400,380 380,470 360,508",   // typing
    "M390,318 C400,380 380,470 360,508",   // typing (still)
    "M390,318 C405,370 395,455 380,492",   // hover/thinking (slight lift)
    "M390,318 C440,360 480,420 510,480",   // reach toward cup
    "M390,318 C390,290 360,260 330,238",   // sipping (hand near face)
    "M390,318 C440,360 480,420 510,480",   // returning cup
    "M390,318 C400,380 380,470 360,508",   // typing again
  ].join(";");

  // Cup translate during sip
  // Mug body is centered around (505, 480). Sip target: hand reaches mouth at ~(330, 248).
  // We move the cup so the rim aligns with the mouth.
  const cupValues = "0,0; 0,0; 0,0; 0,0; -180,-220; 0,0; 0,0";

  // Head rotation (rotate around face center)
  const headValues = [
    "0 300 220",
    "0 300 220",
    "-3 300 220",   // looks up slightly when thinking
    "-3 300 220",
    "-12 300 220",  // head tilts back during sip
    "0 300 220",
    "0 300 220",
  ].join(";");

  // Mouth path — neutral / pursed / open / smile
  const mouthValues = [
    "M285,258 Q300,262 315,258",   // 0 neutral
    "M285,258 Q300,262 315,258",   // 5s same
    "M290,258 Q300,256 310,258",   // 6.5s pursed
    "M290,258 Q300,260 310,258",   // 8s slight open
    "M286,257 Q300,272 314,257",   // 10s wide open (drinking)
    "M282,258 Q300,272 318,258",   // 12s contented smile
    "M285,258 Q300,262 315,258",   // 16s neutral
  ].join(";");

  // Eyebrows (both eyebrows defined as one path)
  const browValues = [
    "M265,209 Q275,205 285,209 M315,209 Q325,205 335,209",         // 0 neutral
    "M265,209 Q275,205 285,209 M315,209 Q325,205 335,209",         // 5s same
    "M265,202 Q275,196 285,202 M315,202 Q325,196 335,202",         // 6.5s raised (thinking)
    "M265,205 Q275,200 285,205 M315,205 Q325,200 335,205",         // 8s slightly raised
    "M265,212 Q275,210 285,212 M315,212 Q325,210 335,212",         // 10s relaxed (eyes closed)
    "M265,209 Q275,204 285,209 M315,209 Q325,204 335,209",         // 12s pleasant (post-sip)
    "M265,209 Q275,205 285,209 M315,209 Q325,205 335,209",         // 16s neutral
  ].join(";");

  // Eye height (ellipse ry) — closed during sip
  const eyeValues = "2.6;2.6;2.6;2.6;0.4;2.6;2.6";

  return (
    <svg
      viewBox="0 0 600 700"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      <defs>
        {/* Wall gradient */}
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1A18" />
          <stop offset="100%" stopColor="#0E0E0C" />
        </linearGradient>

        {/* Window light gradient */}
        <radialGradient id="windowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={WINDOW_LIGHT} stopOpacity="0.45" />
          <stop offset="60%" stopColor={WINDOW_LIGHT} stopOpacity="0.18" />
          <stop offset="100%" stopColor={WINDOW_LIGHT} stopOpacity="0" />
        </radialGradient>

        {/* Subtle screen glow */}
        <radialGradient id="screenGlow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor={CODE_VIOLET} stopOpacity="0.18" />
          <stop offset="100%" stopColor={CODE_VIOLET} stopOpacity="0" />
        </radialGradient>

        {/* Hoodie shading */}
        <linearGradient id="hoodieShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={HOODIE_LIGHT} stopOpacity="0.5" />
          <stop offset="40%" stopColor={HOODIE} stopOpacity="0" />
          <stop offset="100%" stopColor={HOODIE_DARK} stopOpacity="0.6" />
        </linearGradient>

        {/* Coffee liquid shine */}
        <linearGradient id="liqShine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5C3018" />
          <stop offset="100%" stopColor={COFFEE_LIQ} />
        </linearGradient>

        <style>{`
          @keyframes ca-cursor {
            0%, 50% { opacity: 1 }
            51%, 100% { opacity: 0 }
          }
          @keyframes ca-steam-a {
            0%   { opacity: 0;    transform: translate(0, 0)     scaleX(1) }
            15%  { opacity: 0.55; transform: translate(0, -4px)  scaleX(1.05) }
            70%  { opacity: 0.4;  transform: translate(-4px, -28px) scaleX(1.3) }
            100% { opacity: 0;    transform: translate(-8px, -48px) scaleX(1.5) }
          }
          @keyframes ca-steam-b {
            0%   { opacity: 0;    transform: translate(0, 0)     scaleX(1) }
            15%  { opacity: 0.55; transform: translate(0, -4px)  scaleX(0.95) }
            70%  { opacity: 0.4;  transform: translate(3px, -28px) scaleX(0.7) }
            100% { opacity: 0;    transform: translate(6px, -48px) scaleX(0.5) }
          }
          @keyframes ca-steam-c {
            0%   { opacity: 0;    transform: translate(0, 0)     scaleX(1) }
            15%  { opacity: 0.55; transform: translate(0, -4px)  scaleX(1.1) }
            70%  { opacity: 0.4;  transform: translate(-2px, -32px) scaleX(1.2) }
            100% { opacity: 0;    transform: translate(-4px, -52px) scaleX(1.4) }
          }
          @keyframes ca-breathe {
            0%, 100% { transform: translateY(0) scaleY(1) }
            50%      { transform: translateY(-1px) scaleY(1.005) }
          }
          @keyframes ca-finger-a { 0%,40%,80%,100% { transform: translateY(0) } 20%,60% { transform: translateY(2.5px) } }
          @keyframes ca-finger-b { 0%,40%,80%,100% { transform: translateY(2px) } 20%,60% { transform: translateY(0) } }
          @keyframes ca-finger-c { 0%,40%,80%,100% { transform: translateY(1px) } 20%,60% { transform: translateY(3px) } }
          @keyframes ca-finger-d { 0%,40%,80%,100% { transform: translateY(2.5px) } 20%,60% { transform: translateY(0.5px) } }
          @keyframes ca-cord-sway {
            0%, 100% { transform: rotate(0deg) }
            50%      { transform: rotate(2deg) }
          }
        `}</style>
      </defs>

      {/* ═══ BACKGROUND ═══════════════════════════════════════════════════ */}

      {/* Wall */}
      <rect x="0" y="0" width="600" height="700" fill="url(#wallGrad)" />

      {/* Window suggestion (back-right) */}
      <rect x="380" y="60" width="180" height="220" rx="4" fill={SCREEN_BG} opacity="0.55" />
      <rect x="380" y="60" width="180" height="220" rx="4" fill="url(#windowGrad)" />
      <line x1="380" y1="170" x2="560" y2="170" stroke={CODE_MUTED} strokeWidth="1.5" opacity="0.35" />
      <line x1="470" y1="60" x2="470" y2="280" stroke={CODE_MUTED} strokeWidth="1.5" opacity="0.35" />
      <rect x="380" y="60" width="180" height="220" rx="4" fill="none"
            stroke={CODE_MUTED} strokeWidth="2" opacity="0.5" />

      {/* Bookshelf hint (back-left) */}
      <rect x="30"  y="160" width="160" height="170" fill={BOOKSHELF} />
      <rect x="30"  y="160" width="160" height="170" fill="none" stroke={DESK_DARK} strokeWidth="1.5" />
      <line x1="30" y1="245" x2="190" y2="245" stroke={DESK_DARK} strokeWidth="1.5" />
      {/* Books — top shelf */}
      <rect x="40"  y="178" width="14" height="60" fill={HOODIE_DARK}/>
      <rect x="56"  y="170" width="12" height="68" fill={MUG} />
      <rect x="70"  y="185" width="16" height="53" fill={LEAF}/>
      <rect x="88"  y="175" width="13" height="63" fill={SKIN_SHADOW} />
      <rect x="103" y="180" width="15" height="58" fill={HOODIE} />
      <rect x="120" y="172" width="12" height="66" fill={CODE_MUTED}/>
      <rect x="134" y="183" width="14" height="55" fill={MUG_DARK}/>
      <rect x="150" y="178" width="12" height="60" fill={LEAF_LIGHT}/>
      <rect x="164" y="174" width="16" height="64" fill={HOODIE_LIGHT}/>
      {/* Books — bottom shelf */}
      <rect x="40"  y="265" width="18" height="62" fill={MUG_DARK}/>
      <rect x="60"  y="260" width="14" height="67" fill={CODE_GREEN} opacity="0.5"/>
      <rect x="76"  y="270" width="20" height="57" fill={HAIR}/>
      <rect x="100" y="263" width="13" height="64" fill={CODE_VIOLET} opacity="0.5"/>
      <rect x="115" y="268" width="16" height="59" fill={SKIN}/>
      <rect x="135" y="262" width="14" height="65" fill={DESK}/>
      <rect x="151" y="270" width="18" height="57" fill={MUG}/>
      <rect x="171" y="265" width="13" height="62" fill={HOODIE_DARK}/>

      {/* Soft floor shadow */}
      <ellipse cx="300" cy="660" rx="280" ry="20" fill="#000" opacity="0.4" />

      {/* ═══ DESK ═════════════════════════════════════════════════════════ */}

      {/* Back panel of desk (legroom shadow) */}
      <rect x="0" y="500" width="600" height="40" fill={DESK_DARK} />

      {/* Desk top surface */}
      <rect x="0" y="525" width="600" height="22" fill={DESK} />
      <line x1="0" y1="525" x2="600" y2="525" stroke={DESK_LIGHT} strokeWidth="1.5" opacity="0.6" />

      {/* Desk front face */}
      <rect x="0" y="547" width="600" height="36" fill={DESK_DARK} />
      <line x1="0" y1="547" x2="600" y2="547" stroke="#000" strokeWidth="1" opacity="0.55" />

      {/* Wood grain hints */}
      <line x1="40"  y1="535" x2="180" y2="535" stroke={DESK_DARK} strokeWidth="0.5" opacity="0.5"/>
      <line x1="220" y1="538" x2="380" y2="538" stroke={DESK_DARK} strokeWidth="0.5" opacity="0.5"/>
      <line x1="430" y1="534" x2="560" y2="534" stroke={DESK_DARK} strokeWidth="0.5" opacity="0.5"/>

      {/* Desk legs visible at sides */}
      <rect x="20"  y="583" width="42" height="100" fill={DESK_DARK} />
      <rect x="538" y="583" width="42" height="100" fill={DESK_DARK} />

      {/* ═══ CHAIR HINT (peeking behind character) ═══════════════════════ */}
      <rect x="195" y="280" width="210" height="240" rx="14" fill={LAPTOP_DARK} />
      <rect x="195" y="280" width="210" height="240" rx="14" fill="none" stroke={DESK_DARK} strokeWidth="2" opacity="0.6" />

      {/* ═══ CHARACTER (composite, behind desk items) ═════════════════════ */}
      <g style={{ transformOrigin: "300px 400px", animation: "ca-breathe 4s ease-in-out infinite" }}>

        {/* HOOD (back layer — extends behind head and over shoulders) */}
        <path
          d="M170,225 Q170,95 300,80 Q430,95 430,225 L450,330 Q455,360 440,360
             L160,360 Q145,360 150,330 Z"
          fill={HOODIE_DARK}
        />
        {/* Hood subtle highlight (top) */}
        <path
          d="M195,135 Q260,100 300,98 Q340,100 405,135"
          fill="none" stroke={HOODIE_LIGHT} strokeWidth="2.5" opacity="0.4"
        />

        {/* Hood interior shadow (frames the face) */}
        <path
          d="M205,235 Q210,135 300,118 Q390,135 395,235 L395,310 Q395,328 380,328 L220,328 Q205,328 205,310 Z"
          fill={HOOD_INSIDE}
        />

        {/* HEAD GROUP (rotates during sip) */}
        <g>
          <animateTransform
            attributeName="transform" type="rotate"
            values={headValues} keyTimes={KT} keySplines={KS}
            calcMode="spline" dur="16s" repeatCount="indefinite"
          />

          {/* Skull / face */}
          <ellipse cx="300" cy="220" rx="62" ry="66" fill={SKIN} />
          {/* Cheek shadow */}
          <ellipse cx="345" cy="245" rx="22" ry="32" fill={SKIN_SHADOW} opacity="0.35" />
          {/* Jaw shadow */}
          <path d="M255,260 Q300,290 345,260 Q345,275 300,288 Q255,275 255,260 Z" fill={SKIN_SHADOW} opacity="0.3" />

          {/* Hair tuft visible at front of hood */}
          <path
            d="M255,170 Q270,148 295,150 Q320,148 345,170 Q335,160 320,158 Q300,154 280,160 Q265,164 255,170 Z"
            fill={HAIR}
          />
          <path
            d="M260,178 Q275,160 295,160" fill="none" stroke={HAIR} strokeWidth="3" strokeLinecap="round"
          />

          {/* Right ear */}
          <ellipse cx="362" cy="232" rx="6" ry="11" fill={SKIN} />
          <ellipse cx="362" cy="234" rx="3" ry="6"  fill={SKIN_SHADOW} opacity="0.65" />

          {/* Glasses — frames */}
          <circle cx="275" cy="225" r="14" fill="none" stroke={GLASSES} strokeWidth="2.4" />
          <circle cx="325" cy="225" r="14" fill="none" stroke={GLASSES} strokeWidth="2.4" />
          {/* Lens tint */}
          <circle cx="275" cy="225" r="13" fill={CODE_VIOLET} opacity="0.07" />
          <circle cx="325" cy="225" r="13" fill={CODE_VIOLET} opacity="0.07" />
          {/* Bridge */}
          <line x1="289" y1="225" x2="311" y2="225" stroke={GLASSES} strokeWidth="2.4" strokeLinecap="round" />
          {/* Temple piece */}
          <line x1="339" y1="225" x2="354" y2="226" stroke={GLASSES} strokeWidth="2.2" strokeLinecap="round" />

          {/* Eyes — animated ry for blink/close-during-sip */}
          <ellipse cx="275" cy="226" rx="2.6" ry="2.6" fill={EYE}>
            <animate attributeName="ry" values={eyeValues} keyTimes={KT}
              dur="16s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="325" cy="226" rx="2.6" ry="2.6" fill={EYE}>
            <animate attributeName="ry" values={eyeValues} keyTimes={KT}
              dur="16s" repeatCount="indefinite" />
          </ellipse>

          {/* Eyebrows — animated */}
          <path d="M265,209 Q275,205 285,209 M315,209 Q325,205 335,209"
                fill="none" stroke={HAIR} strokeWidth="3.5" strokeLinecap="round">
            <animate attributeName="d" values={browValues} keyTimes={KT}
              keySplines={KS} calcMode="spline" dur="16s" repeatCount="indefinite" />
          </path>

          {/* Nose */}
          <path d="M298,235 Q295,250 300,254 Q305,250 302,235"
                fill="none" stroke={SKIN_SHADOW} strokeWidth="2" strokeLinecap="round" />

          {/* Mouth — animated */}
          <path d="M285,258 Q300,262 315,258"
                fill="none" stroke={MOUTH} strokeWidth="2.5" strokeLinecap="round">
            <animate attributeName="d" values={mouthValues} keyTimes={KT}
              keySplines={KS} calcMode="spline" dur="16s" repeatCount="indefinite" />
          </path>
        </g>

        {/* HOOD FRONT EDGE (curve below the chin) */}
        <path
          d="M205,290 Q300,355 395,290 L395,310 Q395,328 380,328 L220,328 Q205,328 205,310 Z"
          fill={HOODIE_DARK}
        />
        <path
          d="M205,290 Q300,355 395,290"
          fill="none" stroke={HOODIE_LIGHT} strokeWidth="1.5" opacity="0.3"
        />

        {/* HOODIE TORSO (body) */}
        <path
          d="M180,330 C160,400 145,480 145,540 L455,540 C455,480 440,400 420,330
             Q420,335 410,338 L190,338 Q180,335 180,330 Z"
          fill={HOODIE}
        />
        {/* Hoodie shading overlay */}
        <path
          d="M180,330 C160,400 145,480 145,540 L455,540 C455,480 440,400 420,330
             Q420,335 410,338 L190,338 Q180,335 180,330 Z"
          fill="url(#hoodieShade)"
        />

        {/* Hood drape over shoulders */}
        <path d="M180,330 C195,350 215,355 235,348 L235,330 Z" fill={HOODIE_DARK} opacity="0.85" />
        <path d="M420,330 C405,350 385,355 365,348 L365,330 Z" fill={HOODIE_DARK} opacity="0.85" />

        {/* Drawstrings */}
        <g style={{ transformOrigin: "275px 320px", animation: "ca-cord-sway 5s ease-in-out infinite" }}>
          <line x1="275" y1="320" x2="270" y2="395" stroke={CORD} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="270" cy="400" r="4.5" fill={CORD} />
        </g>
        <g style={{ transformOrigin: "325px 320px", animation: "ca-cord-sway 5s ease-in-out 0.5s infinite reverse" }}>
          <line x1="325" y1="320" x2="330" y2="395" stroke={CORD} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="330" cy="400" r="4.5" fill={CORD} />
        </g>

        {/* Kangaroo pocket */}
        <path
          d="M210,440 Q300,470 390,440 L380,500 Q300,515 220,500 Z"
          fill={HOODIE_DARK}
        />
        <path
          d="M210,440 Q300,470 390,440"
          fill="none" stroke={HOODIE_LIGHT} strokeWidth="1.5" opacity="0.3"
        />
        {/* Pocket hand opening (left) */}
        <path d="M225,448 Q235,452 240,468" fill="none" stroke={HOOD_INSIDE} strokeWidth="2.5" strokeLinecap="round" />
        {/* Pocket hand opening (right) */}
        <path d="M375,448 Q365,452 360,468" fill="none" stroke={HOOD_INSIDE} strokeWidth="2.5" strokeLinecap="round" />

        {/* BACK ARM (left, mostly static — typing on left side of laptop) */}
        <path
          d="M210,318 C195,380 220,470 235,508"
          fill="none" stroke={HOODIE} strokeWidth="36" strokeLinecap="round"
        />
        <path
          d="M210,318 C195,380 220,470 235,508"
          fill="none" stroke={HOODIE_DARK} strokeWidth="36" strokeLinecap="round" opacity="0.35"
        />
        {/* Back hand (left) */}
        <ellipse cx="240" cy="513" rx="22" ry="13" fill={SKIN} />
        <ellipse cx="240" cy="513" rx="22" ry="13" fill={SKIN_SHADOW} opacity="0.25" />
      </g>

      {/* ═══ DESK ITEMS (in front of character body, on desk surface) ═════ */}

      {/* Plant pot (left side of desk) */}
      <g>
        {/* Leaves — back row */}
        <ellipse cx="80"  cy="455" rx="14" ry="38" fill={LEAF}  transform="rotate(-20 80 455)" />
        <ellipse cx="105" cy="430" rx="14" ry="44" fill={LEAF}  transform="rotate(-5 105 430)" />
        <ellipse cx="135" cy="450" rx="14" ry="40" fill={LEAF}  transform="rotate(15 135 450)" />
        {/* Leaf highlights */}
        <ellipse cx="76"  cy="450" rx="4" ry="22" fill={LEAF_LIGHT} opacity="0.7" transform="rotate(-20 76 450)" />
        <ellipse cx="103" cy="425" rx="4" ry="26" fill={LEAF_LIGHT} opacity="0.7" transform="rotate(-5 103 425)" />
        <ellipse cx="133" cy="445" rx="4" ry="22" fill={LEAF_LIGHT} opacity="0.7" transform="rotate(15 133 445)" />
        {/* Pot */}
        <path
          d="M55,490 L155,490 L148,540 Q148,548 140,548 L70,548 Q62,548 62,540 Z"
          fill={PLANT_POT}
        />
        <path
          d="M55,490 L155,490 L148,540 Q148,548 140,548 L70,548 Q62,548 62,540 Z"
          fill={PLANT_POT_DK} opacity="0.4"
        />
        {/* Pot rim */}
        <ellipse cx="105" cy="490" rx="50" ry="6" fill={PLANT_POT_DK} />
        <ellipse cx="105" cy="488" rx="48" ry="4" fill={PLANT_POT} />
        {/* Soil */}
        <ellipse cx="105" cy="488" rx="44" ry="3" fill={HAIR} opacity="0.7" />
      </g>

      {/* Notebook (under and beside laptop) */}
      <g>
        <rect x="120" y="510" width="100" height="28" rx="2" fill={PAGE} transform="rotate(-3 170 524)" />
        <rect x="120" y="510" width="100" height="28" rx="2" fill="none" stroke={CODE_MUTED} strokeWidth="0.8" transform="rotate(-3 170 524)" />
        <line x1="135" y1="518" x2="200" y2="516" stroke={PAGE_LINE} strokeWidth="0.6" opacity="0.7" transform="rotate(-3 170 524)" />
        <line x1="135" y1="524" x2="195" y2="522" stroke={PAGE_LINE} strokeWidth="0.6" opacity="0.7" transform="rotate(-3 170 524)" />
        <line x1="135" y1="530" x2="190" y2="528" stroke={PAGE_LINE} strokeWidth="0.6" opacity="0.7" transform="rotate(-3 170 524)" />
      </g>

      {/* LAPTOP */}
      <g>
        {/* Screen back / lid (visible angle suggested by gradient) */}
        <path d="M225,360 L375,360 L390,505 L210,505 Z" fill={LAPTOP_DARK} />
        {/* Screen face */}
        <rect x="232" y="368" width="136" height="128" rx="3" fill={SCREEN_BG} />
        <rect x="232" y="368" width="136" height="128" rx="3" fill="url(#screenGlow)" />

        {/* Code lines on screen */}
        <g transform="translate(240, 380)">
          {/* Line 1 — function declaration */}
          <rect x="0"  y="0"  width="22" height="3" rx="1" fill={CODE_VIOLET} opacity="0.85" />
          <rect x="26" y="0"  width="40" height="3" rx="1" fill={CODE_CREAM} opacity="0.85" />
          <rect x="70" y="0"  width="14" height="3" rx="1" fill={CODE_GREEN} opacity="0.85" />
          {/* Line 2 — indented */}
          <rect x="8"  y="10" width="18" height="3" rx="1" fill={CODE_VIOLET} opacity="0.7" />
          <rect x="30" y="10" width="32" height="3" rx="1" fill={CODE_CREAM} opacity="0.75" />
          {/* Line 3 */}
          <rect x="8"  y="20" width="14" height="3" rx="1" fill={CODE_MUTED} opacity="0.65" />
          <rect x="26" y="20" width="48" height="3" rx="1" fill={CODE_GREEN} opacity="0.7" />
          {/* Line 4 */}
          <rect x="8"  y="30" width="22" height="3" rx="1" fill={CODE_VIOLET} opacity="0.7" />
          <rect x="34" y="30" width="36" height="3" rx="1" fill={CODE_CREAM} opacity="0.65" />
          <rect x="74" y="30" width="14" height="3" rx="1" fill={CODE_GREEN} opacity="0.7" />
          {/* Line 5 */}
          <rect x="0"  y="40" width="6"  height="3" rx="1" fill={CODE_CREAM} opacity="0.5" />
          {/* Line 6 — function 2 */}
          <rect x="0"  y="50" width="26" height="3" rx="1" fill={CODE_VIOLET} opacity="0.85" />
          <rect x="30" y="50" width="36" height="3" rx="1" fill={CODE_CREAM} opacity="0.85" />
          {/* Line 7 */}
          <rect x="8"  y="60" width="44" height="3" rx="1" fill={CODE_GREEN} opacity="0.75" />
          {/* Line 8 */}
          <rect x="8"  y="70" width="20" height="3" rx="1" fill={CODE_VIOLET} opacity="0.65" />
          <rect x="32" y="70" width="40" height="3" rx="1" fill={CODE_CREAM} opacity="0.7" />
          {/* Line 9 — comment */}
          <rect x="0"  y="82" width="80" height="3" rx="1" fill={CODE_MUTED} opacity="0.55" />
          {/* Line 10 — current line */}
          <rect x="8"  y="92" width="36" height="3" rx="1" fill={CODE_CREAM} opacity="0.85" />
          {/* Blinking cursor */}
          <rect x="48" y="90" width="2.5" height="6" fill={CODE_VIOLET}
            style={{ animation: "ca-cursor 1s steps(2) infinite" }} />
        </g>

        {/* Bezel highlight */}
        <rect x="232" y="368" width="136" height="128" rx="3" fill="none" stroke={CODE_MUTED} strokeWidth="0.6" opacity="0.6" />
        {/* Apple-ish logo dot on lid back (subtle, just for fun) */}

        {/* Laptop base */}
        <path d="M195,505 L405,505 L420,535 L180,535 Z" fill={LAPTOP} />
        <path d="M195,505 L405,505 L420,535 L180,535 Z" fill="none" stroke={LAPTOP_DARK} strokeWidth="1.2" />
        {/* Trackpad */}
        <rect x="245" y="514" width="110" height="14" rx="2" fill={LAPTOP_DARK} opacity="0.7" />
      </g>

      {/* ═══ COFFEE MUG (animated translate during sip) ═══════════════════ */}
      <g>
        <animateTransform
          attributeName="transform" type="translate"
          values={cupValues} keyTimes={KT} keySplines={KS}
          calcMode="spline" dur="16s" repeatCount="indefinite"
        />

        {/* Mug body */}
        <path
          d="M460,440 L460,510 Q460,524 474,524 L536,524 Q550,524 550,510 L550,440 Z"
          fill={MUG}
        />
        {/* Mug shading */}
        <path
          d="M520,442 L520,510 Q520,524 534,524 L536,524 Q550,524 550,510 L550,442 Z"
          fill={MUG_DARK} opacity="0.45"
        />
        {/* Mug rim */}
        <ellipse cx="505" cy="440" rx="45" ry="9" fill={MUG_DARK} />
        <ellipse cx="505" cy="438" rx="44" ry="7" fill={MUG_HIGHLIGHT} />
        {/* Coffee liquid surface */}
        <ellipse cx="505" cy="442" rx="40" ry="6" fill={COFFEE_LIQ} />
        <ellipse cx="505" cy="441" rx="36" ry="3" fill="url(#liqShine)" opacity="0.7" />
        {/* Mug handle */}
        <path
          d="M550,455 Q580,455 580,475 Q580,498 550,498"
          fill="none" stroke={MUG} strokeWidth="11" strokeLinecap="round"
        />
        <path
          d="M550,455 Q580,455 580,475 Q580,498 550,498"
          fill="none" stroke={MUG_DARK} strokeWidth="11" strokeLinecap="round" opacity="0.4"
        />
        {/* Highlight stripe */}
        <path
          d="M468,450 L468,500"
          stroke={MUG_HIGHLIGHT} strokeWidth="3.5" strokeLinecap="round" opacity="0.85"
        />

        {/* Steam — pauses during sip phase using opacity animation */}
        <g>
          <animate attributeName="opacity" values="1;1;1;1;0;1;1" keyTimes={KT}
            calcMode="discrete" dur="16s" repeatCount="indefinite" />
          <path d="M485,438 Q481,420 485,402 Q489,385 485,368"
            fill="none" stroke={STEAM} strokeWidth="2.5" strokeLinecap="round"
            style={{ animation: "ca-steam-a 2.6s ease-out infinite", transformOrigin: "485px 438px" }}
          />
          <path d="M505,438 Q501,420 505,402 Q509,385 505,368"
            fill="none" stroke={STEAM} strokeWidth="2.5" strokeLinecap="round"
            style={{ animation: "ca-steam-b 2.6s ease-out 0.85s infinite", transformOrigin: "505px 438px" }}
          />
          <path d="M525,438 Q521,420 525,402 Q529,385 525,368"
            fill="none" stroke={STEAM} strokeWidth="2.5" strokeLinecap="round"
            style={{ animation: "ca-steam-c 2.6s ease-out 1.7s infinite", transformOrigin: "525px 438px" }}
          />
        </g>
      </g>

      {/* ═══ FRONT ARM (animated — over the laptop, reaches for cup) ═════ */}
      <g>
        {/* Sleeve */}
        <path
          d="M390,318 C400,380 380,470 360,508"
          fill="none" stroke={HOODIE} strokeWidth="36" strokeLinecap="round"
        >
          <animate attributeName="d" values={armValues} keyTimes={KT}
            keySplines={KS} calcMode="spline" dur="16s" repeatCount="indefinite" />
        </path>
        {/* Sleeve shadow line */}
        <path
          d="M390,318 C400,380 380,470 360,508"
          fill="none" stroke={HOODIE_DARK} strokeWidth="36" strokeLinecap="round" opacity="0.32"
        >
          <animate attributeName="d" values={armValues} keyTimes={KT}
            keySplines={KS} calcMode="spline" dur="16s" repeatCount="indefinite" />
        </path>
        {/* Sleeve cuff (lighter ring) — same path, narrower stroke at end - approximated via small ellipse */}

        {/* HAND at end of arm — uses arm endpoint values via animation on a circle.
            We position the hand by animating cx/cy through the same waypoints.
            Endpoints from armValues: 360,508 / 380,492 / 510,480 / 330,238 / 510,480 / 360,508 */}
        <g>
          <animateTransform
            attributeName="transform" type="translate"
            values="0,0; 0,0; 20,-16; 150,-28; -30,-270; 150,-28; 0,0"
            keyTimes={KT} keySplines={KS} calcMode="spline"
            dur="16s" repeatCount="indefinite"
          />
          {/* Hand back (palm) */}
          <ellipse cx="360" cy="514" rx="20" ry="14" fill={SKIN} />
          {/* Hand shadow */}
          <ellipse cx="362" cy="516" rx="18" ry="11" fill={SKIN_SHADOW} opacity="0.3" />

          {/* Fingers — small ovals representing knuckles, animated bobbing during typing */}
          <ellipse cx="350" cy="520" rx="4" ry="6" fill={SKIN}
            style={{ animation: "ca-finger-a 0.85s ease-in-out infinite", transformOrigin: "350px 520px" }}/>
          <ellipse cx="358" cy="522" rx="4" ry="6" fill={SKIN}
            style={{ animation: "ca-finger-b 0.85s ease-in-out infinite", transformOrigin: "358px 522px" }}/>
          <ellipse cx="366" cy="522" rx="4" ry="6" fill={SKIN}
            style={{ animation: "ca-finger-c 0.85s ease-in-out infinite", transformOrigin: "366px 522px" }}/>
          <ellipse cx="374" cy="520" rx="4" ry="6" fill={SKIN}
            style={{ animation: "ca-finger-d 0.85s ease-in-out infinite", transformOrigin: "374px 520px" }}/>
          {/* Thumb */}
          <ellipse cx="343" cy="513" rx="3.5" ry="5" fill={SKIN} />
        </g>
      </g>

      {/* Subtle ambient warm glow on character face from screen */}
      <ellipse cx="300" cy="240" rx="120" ry="50" fill={CODE_VIOLET} opacity="0.04" />
    </svg>
  );
}
