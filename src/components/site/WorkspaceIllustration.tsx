type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export default function WorkspaceIllustration({ className, style }: Props) {
  return (
    <svg
      viewBox="0 0 280 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* ── Desk surface ──────────────────────────────────────────── */}
        <line x1="14" y1="178" x2="266" y2="178" strokeWidth="1.6" />
        <line x1="22" y1="184" x2="258" y2="184" strokeWidth="0.8" opacity="0.4" />

        {/* ── Left monitor (tilted slightly right) ──────────────────── */}
        <path
          d="M 18 78 L 92 86 L 92 168 L 18 158 Z"
          strokeWidth="1.4"
        />
        <line x1="55" y1="168" x2="55" y2="178" strokeWidth="1" />
        <line x1="44" y1="178" x2="66" y2="178" strokeWidth="1.2" />
        {/* code lines */}
        <line x1="26" y1="92" x2="68" y2="95" strokeWidth="0.9" opacity="0.55" />
        <line x1="26" y1="100" x2="58" y2="103" strokeWidth="0.9" opacity="0.55" />
        <line x1="32" y1="108" x2="80" y2="111" strokeWidth="0.9" opacity="0.55" />
        <line x1="26" y1="116" x2="50" y2="119" strokeWidth="0.9" opacity="0.55" />
        <line x1="32" y1="124" x2="74" y2="127" strokeWidth="0.9" opacity="0.55" />
        <line x1="26" y1="132" x2="62" y2="135" strokeWidth="0.9" opacity="0.55" />
        <line x1="32" y1="140" x2="86" y2="143" strokeWidth="0.9" opacity="0.55" />
        <line x1="26" y1="148" x2="56" y2="151" strokeWidth="0.9" opacity="0.55" />

        {/* ── Center monitor ────────────────────────────────────────── */}
        <rect x="100" y="60" width="80" height="92" rx="2" strokeWidth="1.4" />
        <line x1="140" y1="152" x2="140" y2="166" strokeWidth="1" />
        <line x1="124" y1="166" x2="156" y2="166" strokeWidth="1.2" />
        {/* terminal prompt */}
        <line x1="108" y1="72" x2="114" y2="72" strokeWidth="1.2" opacity="0.7" />
        <line x1="118" y1="72" x2="172" y2="72" strokeWidth="0.9" opacity="0.55" />
        <line x1="108" y1="82" x2="160" y2="82" strokeWidth="0.9" opacity="0.55" />
        <line x1="108" y1="92" x2="172" y2="92" strokeWidth="0.9" opacity="0.55" />
        <line x1="116" y1="102" x2="166" y2="102" strokeWidth="0.9" opacity="0.55" />
        <line x1="108" y1="112" x2="148" y2="112" strokeWidth="0.9" opacity="0.55" />
        <line x1="116" y1="122" x2="172" y2="122" strokeWidth="0.9" opacity="0.55" />
        <line x1="108" y1="132" x2="138" y2="132" strokeWidth="0.9" opacity="0.55" />
        <line x1="108" y1="142" x2="158" y2="142" strokeWidth="0.9" opacity="0.55" />

        {/* ── Right monitor (tilted slightly left) ──────────────────── */}
        <path
          d="M 188 86 L 262 78 L 262 158 L 188 168 Z"
          strokeWidth="1.4"
        />
        <line x1="225" y1="168" x2="225" y2="178" strokeWidth="1" />
        <line x1="214" y1="178" x2="236" y2="178" strokeWidth="1.2" />
        {/* code lines (right) */}
        <line x1="196" y1="95" x2="238" y2="92" strokeWidth="0.9" opacity="0.55" />
        <line x1="196" y1="103" x2="228" y2="100" strokeWidth="0.9" opacity="0.55" />
        <line x1="200" y1="111" x2="252" y2="108" strokeWidth="0.9" opacity="0.55" />
        <line x1="196" y1="119" x2="222" y2="116" strokeWidth="0.9" opacity="0.55" />
        <line x1="200" y1="127" x2="246" y2="124" strokeWidth="0.9" opacity="0.55" />
        <line x1="196" y1="135" x2="234" y2="132" strokeWidth="0.9" opacity="0.55" />
        <line x1="200" y1="143" x2="254" y2="140" strokeWidth="0.9" opacity="0.55" />
        <line x1="196" y1="151" x2="228" y2="148" strokeWidth="0.9" opacity="0.55" />

        {/* ── Person (back view, between monitors) ──────────────────── */}
        {/* head */}
        <circle cx="140" cy="208" r="16" strokeWidth="1.5" />
        {/* hair line */}
        <path
          d="M 126 204 Q 140 196 154 204"
          strokeWidth="1"
          opacity="0.55"
        />
        {/* shoulders / torso (back view) */}
        <path
          d="M 108 268 C 108 244, 122 226, 140 226 C 158 226, 172 244, 172 268"
          strokeWidth="1.5"
        />
        {/* arms reaching forward to keyboard */}
        <path
          d="M 110 252 C 102 248, 96 224, 90 184"
          strokeWidth="1.3"
        />
        <path
          d="M 170 252 C 178 248, 184 224, 190 184"
          strokeWidth="1.3"
        />

        {/* ── Chair backrest (behind person, faint) ─────────────────── */}
        <path
          d="M 112 226 L 112 286 Q 112 292, 118 292 L 162 292 Q 168 292, 168 286 L 168 226"
          strokeWidth="1.1"
          opacity="0.55"
        />
        {/* chair pedestal */}
        <line x1="140" y1="292" x2="140" y2="304" strokeWidth="1.2" opacity="0.7" />
        <line x1="120" y1="312" x2="160" y2="312" strokeWidth="1.2" opacity="0.7" />
        <line x1="140" y1="304" x2="120" y2="312" strokeWidth="1" opacity="0.6" />
        <line x1="140" y1="304" x2="160" y2="312" strokeWidth="1" opacity="0.6" />
        <line x1="140" y1="304" x2="140" y2="312" strokeWidth="1" opacity="0.6" />

        {/* ── Keyboard hint on desk ─────────────────────────────────── */}
        <rect x="106" y="186" width="68" height="10" rx="1.5" strokeWidth="1" opacity="0.5" />
      </g>
    </svg>
  );
}
