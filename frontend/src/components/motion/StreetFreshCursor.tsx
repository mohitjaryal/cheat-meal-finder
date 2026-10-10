"use client";

import { useEffect, useRef } from "react";

export default function StreetFreshCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;

    if (!ring || !dot) return;

    const pointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );

    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let frameId = 0;
    let lastTime = performance.now();

    let pointerX = 0;
    let pointerY = 0;

    let ringX = 0;
    let ringY = 0;

    let velocityX = 0;
    let velocityY = 0;

    let visible = false;
    let hovering = false;
    let pressing = false;

    const RING_SIZE = 36;

    // Independent elastic spring settings.
    const SPRING_STIFFNESS = 0.075;
    const SPRING_DAMPING = 0.79;

    const enabled = () =>
      pointerQuery.matches && !motionQuery.matches;

    const setRingSize = () => {
      const size = pressing
        ? 30
        : hovering
          ? 44
          : RING_SIZE;

      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;

      ring.style.borderColor = hovering
        ? "rgba(196, 90, 52, 0.95)"
        : "rgba(196, 90, 52, 0.78)";

      ring.style.background = hovering
        ? "rgba(196, 90, 52, 0.14)"
        : "rgba(196, 90, 52, 0.09)";

      ring.style.boxShadow = hovering
        ? "0 0 0 5px rgba(196,90,52,0.08), 0 0 18px rgba(196,90,52,0.15)"
        : "0 0 0 2px rgba(196,90,52,0.04)";
    };

    const hideCursor = () => {
      visible = false;

      ring.style.opacity = "0";
      dot.style.opacity = "0";
    };

    const animate = (time: number) => {
      frameId = 0;

      if (!enabled()) return;

      const delta = Math.min(
        Math.max((time - lastTime) / 16.67, 0),
        2,
      );

      lastTime = time;

      if (visible) {
        /*
         * Independent spring movement.
         *
         * Ring follows the pointer with inertia.
         * No hard MAX_LAG clamp.
         */

        const stiffness =
          1 - Math.pow(
            1 - SPRING_STIFFNESS,
            delta,
          );

        const damping = Math.pow(
          SPRING_DAMPING,
          delta,
        );

        const dx = pointerX - ringX;
        const dy = pointerY - ringY;

        velocityX += dx * stiffness;
        velocityY += dy * stiffness;

        velocityX *= damping;
        velocityY *= damping;

        ringX += velocityX * delta;
        ringY += velocityY * delta;

        /*
         * Ring may overshoot naturally.
         *
         * When the pointer stops,
         * spring damping gradually brings
         * the ring back to the center.
         */

        if (
          Math.abs(pointerX - ringX) < 0.04 &&
          Math.abs(pointerY - ringY) < 0.04 &&
          Math.abs(velocityX) < 0.04 &&
          Math.abs(velocityY) < 0.04
        ) {
          ringX = pointerX;
          ringY = pointerY;

          velocityX = 0;
          velocityY = 0;
        }

        ring.style.transform =
          `translate3d(${ringX}px, ${ringY}px, 0) ` +
          "translate(-50%, -50%)";

        dot.style.transform =
          `translate3d(${pointerX}px, ${pointerY}px, 0) ` +
          "translate(-50%, -50%)";
      }

      frameId = requestAnimationFrame(animate);
    };

    const handlePointerMove = (
      event: PointerEvent,
    ) => {
      if (
        !enabled() ||
        event.pointerType !== "mouse"
      ) {
        return;
      }

      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!visible) {
        visible = true;

        ringX = pointerX;
        ringY = pointerY;

        velocityX = 0;
        velocityY = 0;

        ring.style.opacity = "1";
        dot.style.opacity = "1";
      }

      const target = event.target;

      hovering =
        target instanceof Element &&
        Boolean(
          target.closest(
            "a, button, [role='button'], input, textarea, select",
          ),
        );

      setRingSize();
    };

    const handlePointerDown = (
      event: PointerEvent,
    ) => {
      if (
        !enabled() ||
        event.pointerType !== "mouse"
      ) {
        return;
      }

      pressing = true;
      setRingSize();
    };

    const handlePointerUp = (
      event: PointerEvent,
    ) => {
      if (
        !enabled() ||
        event.pointerType !== "mouse"
      ) {
        return;
      }

      pressing = false;
      setRingSize();
    };

    const handlePointerLeave = () => {
      hideCursor();

      pressing = false;
      hovering = false;

      velocityX = 0;
      velocityY = 0;
    };

    const stopAnimation = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const startAnimation = () => {
      if (!enabled() || frameId) return;

      lastTime = performance.now();

      frameId = requestAnimationFrame(animate);
    };

    const updateCursorAvailability = () => {
      if (enabled()) {
        document.documentElement.classList.add(
          "street-cursor-enabled",
        );

        startAnimation();
      } else {
        document.documentElement.classList.remove(
          "street-cursor-enabled",
        );

        hideCursor();
        stopAnimation();
      }
    };

    document.addEventListener(
      "pointermove",
      handlePointerMove,
    );

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    document.addEventListener(
      "pointerup",
      handlePointerUp,
    );

    document.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );

    pointerQuery.addEventListener(
      "change",
      updateCursorAvailability,
    );

    motionQuery.addEventListener(
      "change",
      updateCursorAvailability,
    );

    updateCursorAvailability();

    return () => {
      stopAnimation();

      document.documentElement.classList.remove(
        "street-cursor-enabled",
      );

      document.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "pointerup",
        handlePointerUp,
      );

      document.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );

      pointerQuery.removeEventListener(
        "change",
        updateCursorAvailability,
      );

      motionQuery.removeEventListener(
        "change",
        updateCursorAvailability,
      );
    };
  }, []);

  return (
    <>
      {/* Independent elastic outer ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="
          pointer-events-none
          fixed left-0 top-0
          z-[9999]
          h-9 w-9
          rounded-full
          border border-terracotta/80
          bg-terracotta/10
          opacity-0
          transition-[width,height,border-color,background-color,box-shadow,opacity]
          duration-300 ease-out
        "
      />

      {/* White-covered Terracotta center dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="
          pointer-events-none
          fixed left-0 top-0
          z-[10000]
          h-[12px] w-[12px]
          rounded-full
          border-[3px] border-white
          bg-terracotta
          shadow-[0_1px_5px_rgba(44,26,20,0.20)]
          opacity-0
          transition-opacity duration-150
        "
      />
    </>
  );
}