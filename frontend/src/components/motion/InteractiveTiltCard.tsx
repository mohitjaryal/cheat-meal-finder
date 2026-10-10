"use client";

import {
  useEffect,
  useRef,
  type PointerEvent,
  type ReactNode,
} from "react";

type InteractiveTiltCardProps = {
  children: ReactNode;
  className?: string;
  intensity?: number;
  lift?: number;
};

type MotionState = {
  currentX: number;
  currentY: number;
  currentLift: number;

  targetX: number;
  targetY: number;
  targetLift: number;

  velocityX: number;
  velocityY: number;
  velocityLift: number;
};

const INITIAL_MOTION: MotionState = {
  currentX: 0,
  currentY: 0,
  currentLift: 0,

  targetX: 0,
  targetY: 0,
  targetLift: 0,

  velocityX: 0,
  velocityY: 0,
  velocityLift: 0,
};

export default function InteractiveTiltCard({
  children,
  className = "",
  intensity = 3,
  lift = 4,
}: InteractiveTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const frameRef = useRef<number | null>(null);

  const boundsRef = useRef<DOMRect | null>(null);

  const startAnimationRef = useRef<() => void>(() => { });

  const motionRef = useRef<MotionState>({
    ...INITIAL_MOTION,
  });

  useEffect(() => {
    const card = cardRef.current;

    if (!card) return;

    const motion = motionRef.current;

    const stiffness = 0.11;
    const damping = 0.76;

    const spring = (
      current: number,
      target: number,
      velocity: number,
    ) => {
      const force = (target - current) * stiffness;

      const nextVelocity = (velocity + force) * damping;

      return {
        value: current + nextVelocity,
        velocity: nextVelocity,
      };
    };

    function animate() {
      const card = cardRef.current;

      if (!card) {
        frameRef.current = null;
        return;
      }

      const x = spring(
        motion.currentX,
        motion.targetX,
        motion.velocityX,
      );

      const y = spring(
        motion.currentY,
        motion.targetY,
        motion.velocityY,
      );

      const z = spring(
        motion.currentLift,
        motion.targetLift,
        motion.velocityLift,
      );

      motion.currentX = x.value;
      motion.currentY = y.value;
      motion.currentLift = z.value;

      motion.velocityX = x.velocity;
      motion.velocityY = y.velocity;
      motion.velocityLift = z.velocity;

      card.style.transform = `
        perspective(1100px)
        translate3d(0, ${-motion.currentLift}px, 0)
        rotateX(${motion.currentX}deg)
        rotateY(${motion.currentY}deg)
      `;

      const settled =
        Math.abs(motion.currentX - motion.targetX) < 0.01 &&
        Math.abs(motion.currentY - motion.targetY) < 0.01 &&
        Math.abs(motion.currentLift - motion.targetLift) < 0.01 &&
        Math.abs(motion.velocityX) < 0.01 &&
        Math.abs(motion.velocityY) < 0.01 &&
        Math.abs(motion.velocityLift) < 0.01;

      if (settled) {
        frameRef.current = null;
        return;
      }

      frameRef.current = requestAnimationFrame(animate);
    }

    function startAnimation() {
      if (frameRef.current !== null) return;

      frameRef.current = requestAnimationFrame(animate);
    }

    startAnimationRef.current = startAnimation;

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      startAnimationRef.current = () => { };
    };
  }, []);

  const handlePointerMove = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    const bounds = boundsRef.current;

    if (!bounds) return;

    const x =
      (event.clientX - bounds.left) / bounds.width;

    const y =
      (event.clientY - bounds.top) / bounds.height;

    const normalizedX = Math.max(
      -1,
      Math.min(1, (x - 0.5) * 2),
    );

    const normalizedY = Math.max(
      -1,
      Math.min(1, (y - 0.5) * 2),
    );

    motionRef.current.targetX =
      -normalizedY * intensity;

    motionRef.current.targetY =
      normalizedX * intensity;

    startAnimationRef.current();
  };

  const handlePointerEnter = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (
      !window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches
    ) {
      return;
    }

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches
    ) {
      return;
    }

    const card = cardRef.current;

    if (!card) return;

    boundsRef.current = card.getBoundingClientRect();

    motionRef.current.targetLift = lift;

    handlePointerMove(event);

    startAnimationRef.current();
  };

  const handlePointerLeave = () => {
    boundsRef.current = null;

    motionRef.current.targetX = 0;
    motionRef.current.targetY = 0;
    motionRef.current.targetLift = 0;

    startAnimationRef.current();
  };

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        transform:
          "perspective(1100px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)",

        transformOrigin: "center center",

        backfaceVisibility: "hidden",

        willChange: "transform",
      }}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </div>
  );
}