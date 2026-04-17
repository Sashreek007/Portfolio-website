type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export default function DeveloperAnimation({ className, style }: Props) {
  return (
    <svg
      viewBox="0 0 380 300"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <defs>
        <style>{`
          .dev-hero__scene {
            stroke: currentColor;
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .dev-hero__animated {
            transform-box: view-box;
          }

          .dev-hero__cursor {
            animation: cursor-blink 1.1s steps(2, end) infinite;
          }

          .dev-hero__typing-hand {
            transform-origin: 224px 206px;
            animation: typing-hands 14s ease-in-out infinite;
          }

          .dev-hero__typing-finger-a {
            transform-origin: 218px 207px;
            animation: typing-hands 14s ease-in-out infinite;
          }

          .dev-hero__typing-finger-b {
            transform-origin: 227px 207px;
            animation: typing-hands 14s ease-in-out 140ms infinite;
          }

          .dev-hero__head {
            transform-origin: 262px 106px;
            animation: head-tip 14s ease-in-out infinite;
          }

          .dev-hero__arm-right {
            transform-origin: 278px 146px;
            animation: arm-sip 14s ease-in-out infinite;
          }

          .dev-hero__upper-arm-r {
            transform-origin: 278px 146px;
            animation: arm-reach 14s ease-in-out infinite;
          }

          .dev-hero__forearm-r {
            transform-origin: 260px 164px;
            animation: forearm-follow 14s ease-in-out infinite;
          }

          .dev-hero__desk-cup {
            animation: desk-cup-opacity 14s ease-in-out infinite;
          }

          .dev-hero__held-cup {
            animation: held-cup-opacity 14s ease-in-out infinite;
          }

          .dev-hero__steam-a,
          .dev-hero__steam-b,
          .dev-hero__steam-c {
            transform-origin: center;
            animation: steam-rise 2.2s ease-in-out infinite;
          }

          .dev-hero__steam-b { animation-delay: 420ms; }
          .dev-hero__steam-c { animation-delay: 840ms; }

          @keyframes typing-hands {
            0%, 6%, 14%, 22%, 30%, 38%, 46%, 50%, 82.1%, 88%, 94%, 100% {
              transform: translateY(0px);
            }

            3%, 11%, 19%, 27%, 35%, 43%, 86%, 92%, 97% {
              transform: translateY(2.5px);
            }

            60.7%, 75% {
              transform: translateY(0px);
            }
          }

          @keyframes arm-reach {
            0%, 50%, 100% {
              transform: rotate(0deg);
            }

            60.7%, 82.1% {
              transform: rotate(-84deg);
            }

            75% {
              transform: rotate(-40deg);
            }
          }

          @keyframes forearm-follow {
            0%, 50%, 100% {
              transform: rotate(0deg);
            }

            60.7%, 82.1% {
              transform: rotate(18deg);
            }

            75% {
              transform: rotate(-134deg);
            }
          }

          @keyframes arm-sip {
            0%, 60.7%, 100% {
              transform: translate(0px, 0px) rotate(0deg);
            }

            75% {
              transform: translate(-18px, -28px) rotate(-6deg);
            }

            82.1% {
              transform: translate(0px, 0px) rotate(0deg);
            }
          }

          @keyframes head-tip {
            0%, 60.7%, 100% {
              transform: rotate(0deg);
            }

            71%, 75% {
              transform: rotate(5deg);
            }

            82.1% {
              transform: rotate(0deg);
            }
          }

          @keyframes cursor-blink {
            0%, 48% {
              opacity: 1;
            }

            50%, 100% {
              opacity: 0;
            }
          }

          @keyframes steam-rise {
            0% {
              opacity: 0;
              transform: translateY(4px);
            }

            25% {
              opacity: 0.6;
            }

            100% {
              opacity: 0;
              transform: translateY(-12px);
            }
          }

          @keyframes desk-cup-opacity {
            0%, 54%, 100% {
              opacity: 1;
            }

            57%, 82.1% {
              opacity: 0;
            }
          }

          @keyframes held-cup-opacity {
            0%, 54%, 100% {
              opacity: 0;
            }

            57%, 82.1% {
              opacity: 1;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .dev-hero__cursor,
            .dev-hero__typing-hand,
            .dev-hero__typing-finger-a,
            .dev-hero__typing-finger-b,
            .dev-hero__head,
            .dev-hero__arm-right,
            .dev-hero__upper-arm-r,
            .dev-hero__forearm-r,
            .dev-hero__desk-cup,
            .dev-hero__held-cup,
            .dev-hero__steam-a,
            .dev-hero__steam-b,
            .dev-hero__steam-c {
              animation: none;
            }

            .dev-hero__held-cup {
              opacity: 0;
            }

            .dev-hero__desk-cup {
              opacity: 1;
            }
          }
        `}</style>
      </defs>

      <g className="dev-hero__scene" strokeWidth="1.7">
        <g id="desk">
          <line x1="12" y1="228" x2="366" y2="228" />
          <line x1="12" y1="234" x2="366" y2="234" strokeWidth="0.85" opacity="0.28" />
          <line x1="40" y1="234" x2="40" y2="288" strokeWidth="1.15" opacity="0.48" />
          <line x1="338" y1="234" x2="338" y2="288" strokeWidth="1.15" opacity="0.48" />
        </g>

        <g id="monitor">
          <rect x="22" y="70" width="126" height="84" rx="4" strokeWidth="1.8" />
          <rect x="30" y="78" width="110" height="68" rx="2" strokeWidth="0.9" opacity="0.42" />
          <line x1="85" y1="154" x2="85" y2="188" strokeWidth="1.3" />
          <line x1="69" y1="188" x2="101" y2="188" strokeWidth="1.3" />
          <line x1="42" y1="94" x2="98" y2="94" strokeWidth="0.95" opacity="0.58" />
          <line x1="42" y1="105" x2="116" y2="105" strokeWidth="0.95" opacity="0.58" />
          <line x1="49" y1="116" x2="126" y2="116" strokeWidth="0.95" opacity="0.58" />
          <line x1="49" y1="127" x2="112" y2="127" strokeWidth="0.95" opacity="0.58" />
          <line x1="42" y1="138" x2="88" y2="138" strokeWidth="0.95" opacity="0.58" />
          <rect x="120" y="132" width="5" height="9" fill="currentColor" stroke="none" className="dev-hero__cursor" />
        </g>

        <g id="keyboard">
          <rect x="184" y="207" width="57" height="8" rx="2" strokeWidth="1.15" />
          <line x1="190" y1="209.5" x2="236" y2="209.5" strokeWidth="0.7" opacity="0.35" />
          <line x1="192" y1="212.5" x2="234" y2="212.5" strokeWidth="0.7" opacity="0.35" />
        </g>

        <g id="coffee" className="dev-hero__desk-cup">
          <g id="cup">
            <path d="M309 194 L307 218 Q307 220 309 220 H328 Q330 220 329 218 L327 194 Z" strokeWidth="1.25" />
            <path d="M328 199 Q338 199 338 205 Q338 211 328 210" strokeWidth="1.1" />
            <ellipse cx="318" cy="194" rx="9" ry="2.8" strokeWidth="1.15" />
          </g>
          <g id="steam" opacity="0.82">
            <path
              className="dev-hero__steam-a dev-hero__animated"
              d="M312 188 Q310 180 313 171 Q316 163 314 156"
              strokeWidth="1"
            />
            <path
              className="dev-hero__steam-b dev-hero__animated"
              d="M318 186 Q316 178 319 169 Q322 161 320 154"
              strokeWidth="1"
            />
            <path
              className="dev-hero__steam-c dev-hero__animated"
              d="M324 188 Q322 180 325 171 Q328 163 326 156"
              strokeWidth="1"
            />
          </g>
        </g>

        <g id="chair">
          <rect x="251" y="182" width="42" height="7" rx="2" strokeWidth="1.2" />
          <rect x="287" y="138" width="8" height="51" rx="2" strokeWidth="1.2" />
          <line x1="272" y1="189" x2="272" y2="229" strokeWidth="1.15" opacity="0.6" />
        </g>

        <g id="person">
          <g id="legs" opacity="0.68">
            <path d="M262 189 L280 205 L280 229" strokeWidth="1.8" />
            <path d="M269 189 L288 205 L288 229" strokeWidth="1.8" opacity="0.7" />
          </g>

          <g id="torso">
            <path d="M261 138 C255 149 253 166 256 182 L280 182 C282 166 282 149 276 138 Z" strokeWidth="1.45" />
            <path d="M259 141 Q267 135 276 139" strokeWidth="1" opacity="0.48" />
            <path d="M258 182 Q267 187 277 182" strokeWidth="0.9" opacity="0.34" />
            <line x1="267" y1="126" x2="268" y2="138" strokeWidth="1.6" />
          </g>

          <g id="head" className="dev-hero__head dev-hero__animated">
            <path
              d="M247 88 C254 80 269 79 278 85 C286 91 288 104 284 115 C279 126 268 131 256 129 C246 127 239 119 239 108 C239 100 242 93 247 88 Z"
              strokeWidth="1.55"
            />
            <path d="M247 93 Q248 79 262 76 Q276 75 282 85" strokeWidth="2.2" />
            <path d="M247 96 Q242 95 243 105" strokeWidth="1.4" opacity="0.74" />
            <path d="M281 103 Q286 108 281 114" strokeWidth="1.1" />
            <ellipse cx="255" cy="105" rx="6.1" ry="4.8" strokeWidth="0.9" opacity="0.58" />
            <line x1="261" y1="104" x2="265" y2="104" strokeWidth="0.8" opacity="0.58" />
            <circle cx="255" cy="105" r="1.5" fill="currentColor" stroke="none" />
            <path d="M250 108 Q247 112 250 115" strokeWidth="0.95" />
            <path d="M252 121 Q257 123 262 121" strokeWidth="0.9" opacity="0.7">
              <animate
                attributeName="d"
                values="M252 121 Q257 123 262 121;M252 121 Q257 123 262 121;M252 123 Q257 126 262 123;M252 121 Q257 123 262 121;M252 121 Q257 123 262 121"
                keyTimes="0;0.618;0.75;0.821;1"
                dur="14s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0 0 1 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0 0 1 1"
              />
            </path>
          </g>

          <g id="arm-left">
            <path d="M272 146 L255 163" strokeWidth="2" />
            <path d="M255 163 L228 205" strokeWidth="2" />
            <g className="dev-hero__typing-hand dev-hero__animated">
              <rect x="217" y="204" width="13" height="4.5" rx="2.25" fill="currentColor" stroke="none" opacity="0.92" />
            </g>
            <g className="dev-hero__typing-finger-a dev-hero__animated">
              <rect x="214" y="206.5" width="5.5" height="2.3" rx="1.15" fill="currentColor" stroke="none" />
            </g>
            <g className="dev-hero__typing-finger-b dev-hero__animated">
              <rect x="224" y="206.5" width="5.5" height="2.3" rx="1.15" fill="currentColor" stroke="none" />
            </g>
          </g>

          <path d="M275 148 L261 166 L240 205" strokeWidth="1.3" opacity="0.42" />

          <g id="arm-right" className="dev-hero__arm-right dev-hero__animated">
            <g id="upper-arm-r" className="dev-hero__upper-arm-r dev-hero__animated">
              <line x1="278" y1="146" x2="260" y2="164" strokeWidth="2.15" />

              <g id="forearm-r" className="dev-hero__forearm-r dev-hero__animated">
                <line x1="260" y1="164" x2="234" y2="204" strokeWidth="2.15" />
                <rect x="224" y="202" width="13" height="4.5" rx="2.25" fill="currentColor" stroke="none" />

                <g className="dev-hero__held-cup">
                  <path d="M211 187 L210 205 Q210 207 212 207 H223 Q225 207 225 205 L224 187 Z" strokeWidth="1.1" />
                  <path d="M223 190 Q230 190 230 195 Q230 200 223 199" strokeWidth="1" />
                  <ellipse cx="217.5" cy="187" rx="6.8" ry="2.2" strokeWidth="1" />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
