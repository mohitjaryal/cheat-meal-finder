"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoHTMLAttributes } from "react";

type ReducedMotionVideoProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "autoPlay" | "children"
> & {
  src: string;
  poster: string;
};

export default function ReducedMotionVideo({
  src,
  poster,
  ...props
}: ReducedMotionVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotionPreference = () => {
      setReduceMotion(mediaQuery.matches);
    };

    updateMotionPreference();

    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateMotionPreference
      );
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (reduceMotion) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may be blocked by the browser.
      });
    }
  }, [reduceMotion]);

  return (
    <>
      <video
        {...props}
        ref={videoRef}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        autoPlay={false}
        style={{
          ...props.style,
          visibility: reduceMotion ? "hidden" : "visible",
        }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {reduceMotion && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${poster}")` }}
        />
      )}
    </>
  );
}