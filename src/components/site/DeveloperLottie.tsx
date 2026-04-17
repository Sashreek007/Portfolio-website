"use client";

// DeveloperLottie — plays the "developer at desk" Lottie animation hosted
// locally at /public/lottie/developer.json.
//
// Source: "Designer boy ready" by community author on lottiefiles.com
//   (originally lf20_fcfjwiyb — character at laptop with coffee, plant, lamp,
//   and floating message bubbles; 60fps / 10s loop).
//
// Loaded via dynamic import (ssr:false) because lottie-react needs the
// browser DOM. A subtle CSS filter aligns the original blue/teal palette
// toward the site's violet accent without recoloring every shape by hand.

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type Props = { className?: string; style?: React.CSSProperties };

export default function DeveloperLottie({ className, style }: Props) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/lottie/developer.json")
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        /* swallow — placeholder will render */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    // Reserve space while loading so the layout doesn't jump.
    return <div className={className} style={style} aria-hidden />;
  }

  return (
    <div
      className={className}
      style={{
        ...style,
        // Nudge the original palette toward our violet/dark theme.
        // hue-rotate shifts the blues; saturate keeps colors crisp; brightness
        // pulls everything down a touch to sit on the dark background.
        filter:
          "hue-rotate(-18deg) saturate(0.85) brightness(0.95) contrast(1.05)",
      }}
      aria-hidden
    >
      <Lottie
        animationData={data}
        loop
        autoplay
        rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
