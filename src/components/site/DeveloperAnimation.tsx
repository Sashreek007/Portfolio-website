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
            transform-origin: 222px 208px;
            animation: typing-hands 14s ease-in-out infinite;
          }

          .dev-hero__typing-finger-a {
            transform-origin: 216px 208px;
            animation: typing-hands 14s ease-in-out infinite;
          }

          .dev-hero__typing-finger-b {
            transform-origin: 225px 209px;
            animation: typing-hands 14s ease-in-out 140ms infinite;
          }

          .dev-hero__head {
            transform-origin: 279px 102px;
            animation: head-tip 14s ease-in-out infinite;
          }

          .dev-hero__arm-right {
            transform-origin: 282px 146px;
            animation: arm-sip 14s ease-in-out infinite;
          }

          .dev-hero__upper-arm-r {
            transform-origin: 282px 146px;
            animation: arm-reach 14s ease-in-out infinite;
          }

          .dev-hero__forearm-r {
            transform-origin: 262px 166px;
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
              transform: translateY(3px);
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
              transform: rotate(-88deg);
            }

            75% {
              transform: rotate(-46deg);
            }
          }

          @keyframes forearm-follow {
            0%, 50%, 100% {
              transform: rotate(0deg);
            }

            60.7%, 82.1% {
              transform: rotate(16deg);
            }

            75% {
              transform: rotate(-141deg);
            }
          }

          @keyframes arm-sip {
            0%, 60.7%, 100% {
              transform: translate(0px, 0px) rotate(0deg);
            }

            75% {
              transform: translate(-26px, -42px) rotate(-9deg);
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
              transform: rotate(7deg);
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
        `}</style>
      </defs>

      <g className="dev-hero__scene" strokeWidth="1.8">
        <g id="desk">
          <line x1="18" y1="228" x2="362" y2="228" />
          <line x1="18" y1="235" x2="362" y2="235" strokeWidth="0.9" opacity="0.3" />
          <line x1="56" y1="235" x2="56" y2="286" strokeWidth="1.2" opacity="0.5" />
          <line x1="330" y1="235" x2="330" y2="286" strokeWidth="1.2" opacity="0.5" />
        </g>

        <g id="monitor">
          <rect x="28" y="74" width="116" height="76" rx="4" />
          <rect x="36" y="82" width="100" height="60" rx="2" strokeWidth="0.9" opacity="0.45" />
          <line x1="86" y1="150" x2="86" y2="191" strokeWidth="1.4" />
          <line x1="69" y1="191" x2="103" y2="191" strokeWidth="1.4" />
          <line x1="48" y1="96" x2="98" y2="96" strokeWidth="1" opacity="0.65" />
          <line x1="48" y1="108" x2="118" y2="108" strokeWidth="1" opacity="0.65" />
          <line x1="56" y1="120" x2="108" y2="120" strokeWidth="1" opacity="0.65" />
          <line x1="48" y1="132" x2="92" y2="132" strokeWidth="1" opacity="0.65" />
          <rect
            x="110"
            y="126"
            width="5"
            height="10"
            fill="currentColor"
            stroke="none"
            className="dev-hero__cursor"
          />
        </g>

        <g id="keyboard">
          <rect x="186" y="210" width="54" height="8" rx="2" />
          <line x1="191" y1="212.5" x2="235" y2="212.5" strokeWidth="0.8" opacity="0.35" />
          <line x1="194" y1="216" x2="232" y2="216" strokeWidth="0.8" opacity="0.35" />
        </g>

        <g id="coffee" className="dev-hero__desk-cup">
          <g id="cup">
            <path d="M311 194 L309 218 Q309 220 311 220 H329 Q331 220 331 218 L329 194 Z" />
            <path d="M329 199 Q338 199 338 206 Q338 213 329 212" strokeWidth="1.5" />
            <ellipse cx="320" cy="194" rx="9" ry="3" strokeWidth="1.4" />
          </g>
          <g id="steam" opacity="0.8">
            <path
              className="dev-hero__steam-a dev-hero__animated"
              d="M314 188 Q312 180 315 171 Q318 163 316 156"
              strokeWidth="1.1"
            />
            <path
              className="dev-hero__steam-b dev-hero__animated"
              d="M320 186 Q318 178 321 169 Q324 161 322 154"
              strokeWidth="1.1"
            />
            <path
              className="dev-hero__steam-c dev-hero__animated"
              d="M326 188 Q324 180 327 171 Q330 163 328 156"
              strokeWidth="1.1"
            />
          </g>
        </g>

        <g id="chair">
          <rect x="251" y="176" width="47" height="8" rx="2" />
          <rect x="293" y="136" width="8" height="48" rx="2" />
          <line x1="274" y1="184" x2="274" y2="228" strokeWidth="1.3" opacity="0.7" />
        </g>

        <g id="person">
          <g id="legs">
            <path d="M266 182 L286 204 L286 228" strokeWidth="2.2" />
            <path d="M274 182 L296 204 L296 228" strokeWidth="2.2" opacity="0.72" />
          </g>

          <g id="torso">
            <path d="M266 136 Q261 158 266 182 H289 Q293 161 288 136" />
            <path d="M269 154 Q277 160 286 156" strokeWidth="1" opacity="0.45" />
            <line x1="279" y1="122" x2="279" y2="136" strokeWidth="2" />
          </g>

          <g id="head" className="dev-hero__head dev-hero__animated">
            <circle cx="279" cy="102" r="20" />
            <path d="M262 95 Q264 79 275 75 Q287 72 296 79 Q303 86 301 99" strokeWidth="2.6" />
            <path d="M264 99 Q259 92 261 106" strokeWidth="1.9" opacity="0.8" />
            <path d="M296 98 Q302 102 296 110" strokeWidth="1.3" />
            <path d="M270 102 Q267 106 270 111" strokeWidth="1.2" />
            <path d="M270 118 Q276 120 282 118" strokeWidth="1.2" />
            <circle cx="271" cy="101" r="1.8" fill="currentColor" stroke="none" />
            <path d="M286 89 Q287 95 283 100" strokeWidth="0.9" opacity="0.55" />
          </g>

          <g id="arm-left">
            <path d="M271 145 L249 164" strokeWidth="2.2" />
            <path d="M249 164 L225 204" strokeWidth="2.2" />
            <g className="dev-hero__typing-hand dev-hero__animated">
              <rect x="214" y="204" width="15" height="5" rx="2.5" fill="currentColor" stroke="none" opacity="0.92" />
            </g>
            <g className="dev-hero__typing-finger-a dev-hero__animated">
              <rect x="211" y="207" width="6" height="2.5" rx="1.25" fill="currentColor" stroke="none" />
            </g>
            <g className="dev-hero__typing-finger-b dev-hero__animated">
              <rect x="223" y="208" width="6" height="2.5" rx="1.25" fill="currentColor" stroke="none" />
            </g>
          </g>

          <g id="arm-right" className="dev-hero__arm-right dev-hero__animated">
            <g id="upper-arm-r" className="dev-hero__upper-arm-r dev-hero__animated">
              <line x1="282" y1="146" x2="262" y2="166" strokeWidth="2.4" />

              <g id="forearm-r" className="dev-hero__forearm-r dev-hero__animated">
                <line x1="262" y1="166" x2="232" y2="203" strokeWidth="2.4" />
                <rect x="223" y="202" width="14" height="5" rx="2.5" fill="currentColor" stroke="none" />

                <g className="dev-hero__held-cup">
                  <path d="M210 188 L209 205 Q209 207 211 207 H223 Q225 207 225 205 L224 188 Z" strokeWidth="1.4" />
                  <path d="M223 191 Q230 191 230 196 Q230 201 223 200" strokeWidth="1.2" />
                  <ellipse cx="217" cy="188" rx="7" ry="2.4" strokeWidth="1.2" />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
