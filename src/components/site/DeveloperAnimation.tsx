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

          .dev-hero__motion {
            transform-box: view-box;
          }

          .dev-hero__fill-weak {
            fill: currentColor;
            stroke: none;
            opacity: 0.08;
          }

          .dev-hero__fill-mid {
            fill: currentColor;
            stroke: none;
            opacity: 0.18;
          }

          .dev-hero__fill-strong {
            fill: currentColor;
            stroke: none;
            opacity: 0.3;
          }

          .dev-hero__outline-dim {
            opacity: 0.45;
          }

          .dev-hero__cursor {
            animation: dev-cursor 1.1s steps(2, end) infinite;
          }

          .dev-hero__torso {
            transform-origin: 254px 152px;
            animation: dev-torso 14s ease-in-out infinite;
          }

          .dev-hero__head {
            transform-origin: 252px 124px;
            animation: dev-head 14s ease-in-out infinite;
          }

          .dev-hero__typing-hand {
            transform-origin: 220px 206px;
            animation: dev-typing-hand 14s ease-in-out infinite;
          }

          .dev-hero__typing-finger-a {
            transform-origin: 214px 207px;
            animation: dev-typing-finger-a 14s ease-in-out infinite;
          }

          .dev-hero__typing-finger-b {
            transform-origin: 225px 208px;
            animation: dev-typing-finger-b 14s ease-in-out infinite;
          }

          .dev-hero__arm-right {
            transform-origin: 280px 145px;
            animation: dev-arm-sip 14s ease-in-out infinite;
          }

          .dev-hero__arm-right-upper {
            transform-origin: 280px 145px;
            animation: dev-arm-upper 14s ease-in-out infinite;
          }

          .dev-hero__arm-right-forearm {
            transform-origin: 252px 167px;
            animation: dev-arm-forearm 14s ease-in-out infinite;
          }

          .dev-hero__desk-cup {
            animation: dev-desk-cup 14s ease-in-out infinite;
          }

          .dev-hero__held-cup {
            animation: dev-held-cup 14s ease-in-out infinite;
          }

          .dev-hero__steam-a,
          .dev-hero__steam-b,
          .dev-hero__steam-c {
            transform-origin: center;
            animation: dev-steam 2.4s ease-in-out infinite;
          }

          .dev-hero__steam-b {
            animation-delay: 420ms;
          }

          .dev-hero__steam-c {
            animation-delay: 840ms;
          }

          @keyframes dev-cursor {
            0%, 48% {
              opacity: 1;
            }

            50%, 100% {
              opacity: 0;
            }
          }

          @keyframes dev-typing-hand {
            0%, 7%, 16%, 24%, 33%, 41%, 50%, 82.1%, 88%, 94%, 100% {
              transform: translateY(0px);
            }

            3%, 11%, 20%, 28%, 37%, 45%, 86%, 92%, 97% {
              transform: translateY(2.5px);
            }

            60.7%, 75% {
              transform: translateY(0px);
            }
          }

          @keyframes dev-typing-finger-a {
            0%, 10%, 18%, 26%, 34%, 42%, 50%, 82.1%, 100% {
              transform: translateY(0px);
            }

            5%, 14%, 22%, 30%, 39%, 47%, 87%, 95% {
              transform: translateY(3px);
            }
          }

          @keyframes dev-typing-finger-b {
            0%, 8%, 17%, 25%, 36%, 44%, 50%, 82.1%, 100% {
              transform: translateY(2px);
            }

            4%, 12%, 21%, 31%, 40%, 48%, 90%, 97% {
              transform: translateY(0px);
            }
          }

          @keyframes dev-torso {
            0%, 60.7%, 100% {
              transform: rotate(0deg);
            }

            75% {
              transform: rotate(3deg);
            }

            82.1% {
              transform: rotate(0deg);
            }
          }

          @keyframes dev-head {
            0%, 60.7%, 100% {
              transform: rotate(0deg);
            }

            72%, 75% {
              transform: rotate(5deg);
            }

            82.1% {
              transform: rotate(0deg);
            }
          }

          @keyframes dev-arm-sip {
            0%, 60.7%, 100% {
              transform: translate(0px, 0px) rotate(0deg);
            }

            75% {
              transform: translate(-9px, -14px) rotate(-4deg);
            }

            82.1% {
              transform: translate(0px, 0px) rotate(0deg);
            }
          }

          @keyframes dev-arm-upper {
            0%, 50%, 100% {
              transform: rotate(0deg);
            }

            60.7%, 82.1% {
              transform: rotate(-86deg);
            }

            75% {
              transform: rotate(-38deg);
            }
          }

          @keyframes dev-arm-forearm {
            0%, 50%, 100% {
              transform: rotate(0deg);
            }

            60.7%, 82.1% {
              transform: rotate(18deg);
            }

            75% {
              transform: rotate(-132deg);
            }
          }

          @keyframes dev-desk-cup {
            0%, 55%, 100% {
              opacity: 1;
            }

            58%, 82.1% {
              opacity: 0;
            }
          }

          @keyframes dev-held-cup {
            0%, 55%, 100% {
              opacity: 0;
            }

            58%, 82.1% {
              opacity: 1;
            }
          }

          @keyframes dev-steam {
            0% {
              opacity: 0;
              transform: translateY(4px);
            }

            25% {
              opacity: 0.6;
            }

            100% {
              opacity: 0;
              transform: translateY(-13px);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .dev-hero__cursor,
            .dev-hero__torso,
            .dev-hero__head,
            .dev-hero__typing-hand,
            .dev-hero__typing-finger-a,
            .dev-hero__typing-finger-b,
            .dev-hero__arm-right,
            .dev-hero__arm-right-upper,
            .dev-hero__arm-right-forearm,
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

      <g className="dev-hero__scene">
        <g id="rear-scene">
          <rect x="8" y="214" width="364" height="14" rx="4" className="dev-hero__fill-weak" />
          <line x1="12" y1="214" x2="368" y2="214" strokeWidth="1.7" />
          <line x1="12" y1="228" x2="368" y2="228" strokeWidth="1.1" opacity="0.4" />
          <line x1="48" y1="228" x2="48" y2="293" strokeWidth="1.2" opacity="0.52" />
          <line x1="344" y1="228" x2="344" y2="293" strokeWidth="1.2" opacity="0.52" />

          <rect x="294" y="132" width="14" height="72" rx="4" className="dev-hero__fill-weak" />
          <rect x="244" y="190" width="72" height="10" rx="4" className="dev-hero__fill-weak" />
          <line x1="280" y1="199" x2="280" y2="229" strokeWidth="1.2" opacity="0.45" />
        </g>

        <g id="monitor">
          <rect x="22" y="50" width="148" height="102" rx="6" className="dev-hero__fill-weak" />
          <rect x="22" y="50" width="148" height="102" rx="6" strokeWidth="2.1" />
          <rect x="31" y="59" width="130" height="84" rx="3.5" className="dev-hero__fill-weak" />
          <rect x="31" y="59" width="130" height="84" rx="3.5" strokeWidth="1" opacity="0.35" />
          <line x1="95" y1="152" x2="95" y2="184" strokeWidth="1.5" />
          <rect x="76" y="184" width="38" height="6" rx="3" className="dev-hero__fill-mid" />
          <line x1="46" y1="78" x2="108" y2="78" strokeWidth="1.1" opacity="0.65" />
          <line x1="46" y1="90" x2="120" y2="90" strokeWidth="1.1" opacity="0.65" />
          <line x1="54" y1="102" x2="131" y2="102" strokeWidth="1.1" opacity="0.65" />
          <line x1="54" y1="114" x2="118" y2="114" strokeWidth="1.1" opacity="0.65" />
          <line x1="46" y1="126" x2="92" y2="126" strokeWidth="1.1" opacity="0.65" />
          <rect x="131" y="121" width="5" height="10" fill="currentColor" stroke="none" className="dev-hero__cursor" />
        </g>

        <g id="torso" className="dev-hero__torso dev-hero__motion">
          <path
            d="M226 130 C239 121 278 123 292 140 C299 149 302 171 300 190 C286 199 248 201 230 190 C224 172 221 147 226 130 Z"
            className="dev-hero__fill-mid"
          />
          <path
            d="M226 130 C239 121 278 123 292 140 C299 149 302 171 300 190 C286 199 248 201 230 190 C224 172 221 147 226 130 Z"
            strokeWidth="1.6"
          />
          <path d="M238 129 C247 137 266 142 288 140" strokeWidth="1.1" opacity="0.48" />
          <path
            d="M239 187 C250 194 274 195 289 190 C286 203 272 211 254 211 C241 209 233 199 239 187 Z"
            className="dev-hero__fill-weak"
          />
          <path d="M247 123 C251 119 259 119 263 123 L263 135 C259 138 251 138 247 135 Z" className="dev-hero__fill-mid" />
        </g>

        <g id="far-arm" opacity="0.42">
          <path
            d="M281 144 C273 147 265 153 258 165 C261 170 266 173 272 175 C279 167 286 157 290 149 Z"
            className="dev-hero__fill-mid"
          />
          <path
            d="M258 165 C251 173 244 185 239 198 C242 202 247 205 252 206 C258 196 264 184 268 174 Z"
            className="dev-hero__fill-mid"
          />
          <path d="M232 198 C232 203 235 207 240 208 H249 C248 203 244 199 237 197 Z" className="dev-hero__fill-mid" />
        </g>

        <g id="typing-arm">
          <path
            d="M268 148 C258 151 248 158 241 170 C245 175 251 178 257 179 C265 171 272 161 277 152 Z"
            className="dev-hero__fill-strong"
          />
          <path
            d="M241 170 C234 179 226 191 220 203 C223 208 228 211 234 212 C240 202 246 189 250 179 Z"
            className="dev-hero__fill-strong"
          />
          <g className="dev-hero__typing-hand dev-hero__motion">
            <path d="M212 201 C211 207 214 211 220 213 H232 C231 206 226 201 218 200 Z" className="dev-hero__fill-strong" />
          </g>
          <g className="dev-hero__typing-finger-a dev-hero__motion">
            <rect x="210" y="206" width="6" height="2.6" rx="1.3" fill="currentColor" stroke="none" />
          </g>
          <g className="dev-hero__typing-finger-b dev-hero__motion">
            <rect x="222" y="207" width="7" height="2.6" rx="1.3" fill="currentColor" stroke="none" />
          </g>
        </g>

        <g id="head" className="dev-hero__head dev-hero__motion">
          <path
            d="M246 82 C256 75 274 76 285 84 C293 91 295 108 289 119 C283 129 271 134 258 132 C245 130 236 121 235 109 C234 98 237 88 246 82 Z"
            className="dev-hero__fill-mid"
          />
          <path
            d="M246 82 C256 75 274 76 285 84 C293 91 295 108 289 119 C283 129 271 134 258 132 C245 130 236 121 235 109 C234 98 237 88 246 82 Z"
            strokeWidth="1.7"
          />
          <path
            d="M244 89 C248 78 262 73 275 77 C286 80 293 88 292 99 C285 94 277 90 266 89 C257 88 249 88 244 89 Z"
            className="dev-hero__fill-strong"
          />
          <path d="M287 101 Q292 105 288 112" strokeWidth="1.2" />
          <path d="M249 101 Q246 106 249 111" strokeWidth="1.1" />
          <path d="M252 118 Q258 120 266 118" strokeWidth="1.2" />
          <circle cx="252" cy="100" r="1.8" fill="currentColor" stroke="none" />
          <ellipse cx="254" cy="100" rx="8" ry="6" strokeWidth="0.9" opacity="0.55" />
          <line x1="262" y1="99" x2="267" y2="99" strokeWidth="0.8" opacity="0.55" />
        </g>

        <g id="desk-cup" className="dev-hero__desk-cup">
          <path d="M306 191 L304 216 Q304 219 307 219 H326 Q329 219 328 216 L326 191 Z" className="dev-hero__fill-mid" />
          <path d="M306 191 L304 216 Q304 219 307 219 H326 Q329 219 328 216 L326 191 Z" strokeWidth="1.3" />
          <ellipse cx="316" cy="191" rx="10" ry="3.1" strokeWidth="1.2" />
          <path d="M326 197 Q336 197 336 204 Q336 211 326 210" strokeWidth="1.1" />
          <g opacity="0.8">
            <path className="dev-hero__steam-a dev-hero__motion" d="M309 184 Q307 176 310 168 Q313 160 311 153" strokeWidth="1" />
            <path className="dev-hero__steam-b dev-hero__motion" d="M316 183 Q314 175 317 167 Q320 159 318 152" strokeWidth="1" />
            <path className="dev-hero__steam-c dev-hero__motion" d="M323 184 Q321 176 324 168 Q327 160 325 153" strokeWidth="1" />
          </g>
        </g>

        <g id="near-arm" className="dev-hero__arm-right dev-hero__motion">
          <g className="dev-hero__arm-right-upper dev-hero__motion">
            <path
              d="M279 143 C270 146 260 152 252 166 C256 172 263 175 270 177 C278 168 286 159 291 149 Z"
              className="dev-hero__fill-strong"
            />
            <path d="M279 143 C270 146 260 152 252 166 C256 172 263 175 270 177 C278 168 286 159 291 149 Z" strokeWidth="1.1" />

            <g className="dev-hero__arm-right-forearm dev-hero__motion">
              <path
                d="M251 165 C243 173 234 187 226 199 C230 205 236 208 243 210 C250 199 257 186 261 174 Z"
                className="dev-hero__fill-strong"
              />
              <path d="M251 165 C243 173 234 187 226 199 C230 205 236 208 243 210 C250 199 257 186 261 174 Z" strokeWidth="1.1" />
              <path d="M218 197 C212 198 210 203 211 209 C218 213 227 214 235 211 C233 204 229 198 218 197 Z" className="dev-hero__fill-strong" />
              <path d="M223 205 Q227 207 231 205" strokeWidth="0.9" opacity="0.55" />

              <g className="dev-hero__held-cup">
                <path d="M206 186 L205 205 Q205 207 207 207 H221 Q223 207 223 205 L222 186 Z" className="dev-hero__fill-mid" />
                <path d="M206 186 L205 205 Q205 207 207 207 H221 Q223 207 223 205 L222 186 Z" strokeWidth="1.1" />
                <ellipse cx="214" cy="186" rx="7.5" ry="2.4" strokeWidth="1" />
                <path d="M222 190 Q229 190 229 195 Q229 200 222 199" strokeWidth="1" />
              </g>
            </g>
          </g>
        </g>

        <g id="keyboard-front">
          <rect x="183" y="203" width="63" height="11" rx="3" className="dev-hero__fill-weak" />
          <rect x="183" y="203" width="63" height="11" rx="3" strokeWidth="1.1" opacity="0.6" />
          <line x1="189" y1="206.5" x2="239" y2="206.5" strokeWidth="0.8" opacity="0.32" />
          <line x1="191" y1="210" x2="237" y2="210" strokeWidth="0.8" opacity="0.32" />
          <line x1="12" y1="221" x2="368" y2="221" strokeWidth="0.9" opacity="0.22" />
        </g>
      </g>
    </svg>
  );
}
