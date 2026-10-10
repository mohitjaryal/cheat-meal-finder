"use client";

import { Float, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type MotionSceneProps = {
  reduceMotion: boolean;
};

type Vector3Tuple = [number, number, number];

/* ================================================================
   STEAM RIBBON
================================================================ */

function SteamRibbon({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  color = "#DDA15E",
  opacity = 0.2,
}: {
  position: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: number;
  color?: string;
  opacity?: number;
}) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.12, -1.05, 0),
        new THREE.Vector3(0.2, -0.65, 0.04),
        new THREE.Vector3(-0.13, -0.2, -0.03),
        new THREE.Vector3(0.2, 0.28, 0.04),
        new THREE.Vector3(-0.08, 0.72, -0.02),
        new THREE.Vector3(0.08, 1.12, 0),
      ]),
    [],
  );

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <tubeGeometry args={[curve, 44, 0.017, 6, false]} />

      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ================================================================
   SPICE SEED
================================================================ */

function SpiceSeed({
  position,
  rotation,
  color,
  scale = 1,
  opacity = 0.62,
}: {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  color: string;
  scale?: number;
  opacity?: number;
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={[0.08 * scale, 0.026 * scale, 0.034 * scale]}
    >
      <sphereGeometry args={[1, 10, 10]} />

      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ================================================================
   HERB LEAF

   Abstract leaf silhouette made with lightweight geometry.
================================================================ */

function HerbLeaf({
  position,
  rotation,
  scale = 1,
  color = "#5A6E44",
  opacity = 0.2,
}: {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale?: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh scale={[0.28, 0.09, 0.035]}>
        <sphereGeometry args={[1, 18, 10]} />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      <mesh
        position={[-0.25, -0.02, -0.01]}
        rotation={[0, 0, -0.12]}
      >
        <cylinderGeometry args={[0.009, 0.009, 0.36, 6]} />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.8}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ================================================================
   ABSTRACT CHILLI

   Culinary silhouette rather than fake realistic food.
================================================================ */

function ChilliShape({
  position,
  rotation,
  scale = 1,
  color = "#C45A34",
  opacity = 0.22,
}: {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale?: number;
  color?: string;
  opacity?: number;
}) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.55, 0.1, 0),
        new THREE.Vector3(-0.25, 0.14, 0.02),
        new THREE.Vector3(0.05, 0.08, -0.01),
        new THREE.Vector3(0.32, -0.04, 0.02),
        new THREE.Vector3(0.52, -0.22, 0),
      ]),
    [],
  );

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <tubeGeometry args={[curve, 28, 0.055, 7, false]} />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      <mesh
        position={[-0.57, 0.12, 0]}
        rotation={[0, 0, -0.55]}
      >
        <coneGeometry args={[0.07, 0.2, 7]} />

        <meshBasicMaterial
          color="#5A6E44"
          transparent
          opacity={opacity * 0.9}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ================================================================
   EDITORIAL SPOON

   Very subtle tableware vocabulary.
================================================================ */

function EditorialSpoon({
  position,
  rotation,
  scale = 1,
  opacity = 0.14,
}: {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale?: number;
  opacity?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.18, 18, 12]} />

        <meshBasicMaterial
          color="#2C1A14"
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.025, 0.018, 1, 8]} />

        <meshBasicMaterial
          color="#2C1A14"
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ================================================================
   SHALLOW SERVING PLATE
================================================================ */

function ServingPlate({
  position,
  rotation,
  scale = 1,
  rimColor = "#DDA15E",
}: {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale?: number;
  rimColor?: string;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <cylinderGeometry args={[1.05, 0.92, 0.07, 48, 1, false]} />

        <meshBasicMaterial
          color="#FFFAF0"
          transparent
          opacity={0.105}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.045, 0]}>
        <torusGeometry args={[1.02, 0.025, 10, 64]} />

        <meshBasicMaterial
          color={rimColor}
          transparent
          opacity={0.31}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[0.72, 0.012, 8, 56]} />

        <meshBasicMaterial
          color="#2C1A14"
          transparent
          opacity={0.125}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ================================================================
   MAIN CULINARY WEBGL SCENE — V3.2
================================================================ */

function MotionScene({ reduceMotion }: MotionSceneProps) {
  const sceneRef = useRef<THREE.Group>(null);
  const depthRef = useRef<THREE.Group>(null);
  const culinaryRef = useRef<THREE.Group>(null);

  const largeRingRef = useRef<THREE.Mesh>(null);
  const detailRingRef = useRef<THREE.Mesh>(null);

  const steamRef = useRef<THREE.Group>(null);
  const plateRef = useRef<THREE.Group>(null);

  const elapsedRef = useRef(0);

  useFrame((state, delta) => {
    if (reduceMotion) {
      return;
    }

    elapsedRef.current += Math.min(delta, 0.05);
    const elapsed = elapsedRef.current;

    const scene = sceneRef.current;
    const depth = depthRef.current;
    const culinary = culinaryRef.current;

    if (scene) {
      const targetX = state.pointer.x * 0.17;
      const targetY = state.pointer.y * 0.095;

      scene.position.x = THREE.MathUtils.lerp(
        scene.position.x,
        targetX,
        0.026,
      );

      scene.position.y = THREE.MathUtils.lerp(
        scene.position.y,
        targetY,
        0.026,
      );

      scene.rotation.y = THREE.MathUtils.lerp(
        scene.rotation.y,
        state.pointer.x * 0.042,
        0.024,
      );

      scene.rotation.x = THREE.MathUtils.lerp(
        scene.rotation.x,
        -state.pointer.y * 0.024,
        0.024,
      );
    }

    if (depth) {
      depth.position.x = THREE.MathUtils.lerp(
        depth.position.x,
        -state.pointer.x * 0.11,
        0.022,
      );

      depth.position.y = THREE.MathUtils.lerp(
        depth.position.y,
        -state.pointer.y * 0.06,
        0.022,
      );

      depth.rotation.y = THREE.MathUtils.lerp(
        depth.rotation.y,
        -state.pointer.x * 0.026,
        0.022,
      );
    }

    if (culinary) {
      culinary.rotation.z = Math.sin(elapsed * 0.11) * 0.008;

      culinary.position.y =
        Math.sin(elapsed * 0.2) * 0.025;
    }

    if (largeRingRef.current) {
      largeRingRef.current.rotation.z += delta * 0.011;
      largeRingRef.current.rotation.x += delta * 0.002;
    }

    if (detailRingRef.current) {
      detailRingRef.current.rotation.z -= delta * 0.017;
    }

    if (steamRef.current) {
      steamRef.current.position.y =
        Math.sin(elapsed * 0.48) * 0.09;

      steamRef.current.position.x =
        Math.sin(elapsed * 0.24) * 0.025;

      steamRef.current.rotation.z =
        Math.sin(elapsed * 0.32) * 0.025;
    }

    if (plateRef.current) {
      plateRef.current.rotation.z =
        Math.sin(elapsed * 0.18) * 0.018;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* =========================================================
          SPICE MOTES
      ========================================================== */}

      <Sparkles
        count={24}
        scale={[12, 8, 4]}
        size={1.35}
        speed={reduceMotion ? 0 : 0.07}
        opacity={0.25}
        color="#DDA15E"
      />

      <Sparkles
        count={14}
        scale={[11, 7, 5]}
        size={0.95}
        speed={reduceMotion ? 0 : 0.05}
        opacity={0.19}
        color="#C45A34"
      />

      <Sparkles
        count={8}
        scale={[10, 7, 5]}
        size={0.72}
        speed={reduceMotion ? 0 : 0.036}
        opacity={0.15}
        color="#5A6E44"
      />

      {/* =========================================================
          TWO INTENTIONAL PLATE-RIM RINGS
      ========================================================== */}

      <Float
        speed={reduceMotion ? 0 : 0.28}
        rotationIntensity={reduceMotion ? 0 : 0.045}
        floatIntensity={reduceMotion ? 0 : 0.13}
      >
        <mesh
          ref={largeRingRef}
          position={[-4.65, 1.55, -4.35]}
          rotation={[0.34, 0.18, 0.18]}
        >
          <torusGeometry args={[2.12, 0.035, 10, 88]} />

          <meshBasicMaterial
            color="#C45A34"
            transparent
            opacity={0.26}
            depthWrite={false}
          />
        </mesh>
      </Float>

      <Float
        speed={reduceMotion ? 0 : 0.36}
        rotationIntensity={reduceMotion ? 0 : 0.055}
        floatIntensity={reduceMotion ? 0 : 0.15}
      >
        <mesh
          ref={detailRingRef}
          position={[4.25, -2.15, -3.15]}
          rotation={[0.28, 0.46, 0.15]}
        >
          <torusGeometry args={[0.78, 0.022, 8, 64]} />

          <meshBasicMaterial
            color="#5A6E44"
            transparent
            opacity={0.24}
            depthWrite={false}
          />
        </mesh>
      </Float>

      {/* =========================================================
          DEPTH / SERVING PLATES
      ========================================================== */}

      <group ref={depthRef}>
        <Float
          speed={reduceMotion ? 0 : 0.2}
          rotationIntensity={reduceMotion ? 0 : 0.035}
          floatIntensity={reduceMotion ? 0 : 0.1}
        >
          <group ref={plateRef}>
            <ServingPlate
              position={[4.15, 2.25, -5.15]}
              rotation={[1.18, 0.18, -0.34]}
              scale={1.35}
              rimColor="#DDA15E"
            />
          </group>
        </Float>

        <Float
          speed={reduceMotion ? 0 : 0.18}
          rotationIntensity={reduceMotion ? 0 : 0.03}
          floatIntensity={reduceMotion ? 0 : 0.08}
        >
          <ServingPlate
            position={[-2.65, -2.65, -5.45]}
            rotation={[1.3, -0.18, 0.28]}
            scale={0.92}
            rimColor="#C45A34"
          />
        </Float>
      </group>

      {/* =========================================================
          STEAM
      ========================================================== */}

      <group ref={steamRef}>
        <Float
          speed={reduceMotion ? 0 : 0.22}
          rotationIntensity={0}
          floatIntensity={reduceMotion ? 0 : 0.11}
        >
          <SteamRibbon
            position={[-1.15, 0.35, -2.75]}
            rotation={[0.03, 0.04, -0.07]}
            scale={1.2}
            color="#DDA15E"
            opacity={0.22}
          />
        </Float>

        <Float
          speed={reduceMotion ? 0 : 0.19}
          rotationIntensity={0}
          floatIntensity={reduceMotion ? 0 : 0.09}
        >
          <SteamRibbon
            position={[-0.48, 0.62, -3.15]}
            rotation={[-0.02, -0.05, 0.08]}
            scale={0.98}
            color="#C45A34"
            opacity={0.19}
          />
        </Float>

        <Float
          speed={reduceMotion ? 0 : 0.17}
          rotationIntensity={0}
          floatIntensity={reduceMotion ? 0 : 0.075}
        >
          <SteamRibbon
            position={[0.12, 0.25, -3.65]}
            rotation={[0.04, 0.03, -0.08]}
            scale={0.82}
            color="#5A6E44"
            opacity={0.15}
          />
        </Float>
      </group>

      {/* =========================================================
          FOOD-ORIENTED EDITORIAL TEXTURE

          Intentionally distributed toward outer regions so the
          form/content hierarchy remains calm.
      ========================================================== */}

      <group ref={culinaryRef}>
        <Float
          speed={reduceMotion ? 0 : 0.2}
          rotationIntensity={reduceMotion ? 0 : 0.04}
          floatIntensity={reduceMotion ? 0 : 0.09}
        >
          <ChilliShape
            position={[-4.25, -0.72, -2.9]}
            rotation={[0.05, -0.08, -0.5]}
            scale={1.22}
            opacity={0.22}
          />
        </Float>

        <Float
          speed={reduceMotion ? 0 : 0.17}
          rotationIntensity={reduceMotion ? 0 : 0.035}
          floatIntensity={reduceMotion ? 0 : 0.08}
        >
          <ChilliShape
            position={[4.35, 0.85, -3.8]}
            rotation={[-0.08, 0.12, 2.55]}
            scale={0.9}
            color="#DDA15E"
            opacity={0.17}
          />
        </Float>

        <Float
          speed={reduceMotion ? 0 : 0.22}
          rotationIntensity={reduceMotion ? 0 : 0.045}
          floatIntensity={reduceMotion ? 0 : 0.1}
        >
          <HerbLeaf
            position={[-3.72, 2.75, -3.35]}
            rotation={[0.08, 0.14, -0.48]}
            scale={1.2}
            opacity={0.21}
          />
        </Float>

        <Float
          speed={reduceMotion ? 0 : 0.18}
          rotationIntensity={reduceMotion ? 0 : 0.035}
          floatIntensity={reduceMotion ? 0 : 0.08}
        >
          <HerbLeaf
            position={[3.58, -2.95, -3.15]}
            rotation={[-0.04, -0.12, 0.68]}
            scale={1}
            color="#C45A34"
            opacity={0.17}
          />
        </Float>

        <Float
          speed={reduceMotion ? 0 : 0.13}
          rotationIntensity={reduceMotion ? 0 : 0.025}
          floatIntensity={reduceMotion ? 0 : 0.06}
        >
          <EditorialSpoon
            position={[5.05, 2.3, -5.1]}
            rotation={[0.15, 0.18, 0.68]}
            scale={0.8}
            opacity={0.115}
          />
        </Float>

        <Float
          speed={reduceMotion ? 0 : 0.15}
          rotationIntensity={reduceMotion ? 0 : 0.03}
          floatIntensity={reduceMotion ? 0 : 0.07}
        >
          <EditorialSpoon
            position={[-4.95, -2.7, -5]}
            rotation={[-0.12, -0.1, -0.72]}
            scale={0.68}
            opacity={0.095}
          />
        </Float>
      </group>

      {/* =========================================================
          UPPER SPICE CLUSTER
      ========================================================== */}

      <Float
        speed={reduceMotion ? 0 : 0.28}
        rotationIntensity={reduceMotion ? 0 : 0.075}
        floatIntensity={reduceMotion ? 0 : 0.17}
      >
        <group position={[2.2, 2.75, -2.6]}>
          <SpiceSeed
            position={[0, 0, 0]}
            rotation={[0.2, 0.4, 0.5]}
            color="#C45A34"
          />

          <SpiceSeed
            position={[0.2, -0.1, -0.1]}
            rotation={[0.5, 0.2, -0.4]}
            color="#DDA15E"
            scale={0.9}
          />

          <SpiceSeed
            position={[-0.18, -0.12, -0.15]}
            rotation={[0.3, -0.5, 0.25]}
            color="#5A6E44"
            scale={0.78}
          />

          <SpiceSeed
            position={[0.08, 0.16, -0.2]}
            rotation={[0.6, -0.15, 0.2]}
            color="#DDA15E"
            scale={0.68}
          />

          <SpiceSeed
            position={[0.34, 0.12, -0.28]}
            rotation={[-0.2, 0.38, 0.6]}
            color="#C45A34"
            scale={0.58}
            opacity={0.48}
          />
        </group>
      </Float>

      {/* =========================================================
          LOWER SPICE CLUSTER
      ========================================================== */}

      <Float
        speed={reduceMotion ? 0 : 0.24}
        rotationIntensity={reduceMotion ? 0 : 0.055}
        floatIntensity={reduceMotion ? 0 : 0.13}
      >
        <group position={[-1.85, -2.32, -2.55]}>
          <SpiceSeed
            position={[0, 0, 0]}
            rotation={[0.4, -0.25, 0.7]}
            color="#DDA15E"
            scale={0.9}
          />

          <SpiceSeed
            position={[0.16, 0.12, -0.08]}
            rotation={[0.1, 0.5, -0.3]}
            color="#C45A34"
            scale={0.76}
          />

          <SpiceSeed
            position={[-0.13, -0.08, -0.13]}
            rotation={[0.3, 0.1, 0.6]}
            color="#5A6E44"
            scale={0.62}
          />

          <SpiceSeed
            position={[-0.3, 0.08, -0.18]}
            rotation={[-0.15, 0.28, -0.52]}
            color="#C45A34"
            scale={0.54}
            opacity={0.46}
          />
        </group>
      </Float>
    </group>
  );
}

/* ================================================================
   AUTH MOTION BACKGROUND V3.2
================================================================ */

export default function AuthMotionBackground() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const updateMotionPreference = () => {
      setReduceMotion(mediaQuery.matches);
    };

    updateMotionPreference();

    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateMotionPreference,
      );
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0, 7],
          fov: 48,
          near: 0.1,
          far: 100,
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <MotionScene reduceMotion={reduceMotion} />
      </Canvas>
    </div>
  );
}