"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/// Animated topographic basin — layered sine ridges resolved into contour
/// bands, the same language as the brand's relief map.

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uPointer;
  uniform vec3  uPrimary;
  uniform vec3  uSecondary;
  uniform float uIntensity;
  uniform float uWash;

  // Cheap value noise — enough texture to keep the rings from looking mechanical.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Centre the field and correct for the canvas being wider than tall.
    vec2 p = (vUv - 0.5) * vec2(2.4, 1.4);

    // The basin itself: a broad depression that the pointer nudges around.
    vec2 focus = uPointer * 0.28;
    float radial = length(p - focus);

    float height =
        -1.05 * exp(-2.4 * radial * radial)          // the basin
      +  0.34 * fbm(p * 1.9 + uTime * 0.035)          // terrain texture
      +  0.14 * sin(radial * 7.0 - uTime * 0.5);      // slow breathing ripple

    // Resolve the height field into contour lines.
    float bands   = height * 13.0;
    float edge    = abs(fract(bands) - 0.5);
    float lineW   = fwidth(bands) * 1.1;
    float contour = 1.0 - smoothstep(0.0, lineW, edge);

    // Fade contours out toward the edges so the plane never shows a seam.
    float vignette = smoothstep(1.32, 0.20, radial);

    // Deeper ground reads primary; the rim oxidises toward the secondary hue.
    vec3 tint = mix(uSecondary, uPrimary, smoothstep(0.85, 0.05, radial));

    float alpha = contour * vignette * uIntensity;

    // A faint wash in the basin floor gives the lines something to sit on.
    float wash = exp(-3.4 * radial * radial) * uWash;

    gl_FragColor = vec4(tint, alpha + wash);
    if (gl_FragColor.a < 0.002) discard;
  }
`;

function Field() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPrimary: { value: new THREE.Color("#0078d4") },
      uSecondary: { value: new THREE.Color("#038387") },
      uIntensity: { value: 1 },
      uWash: { value: 0.05 },
    }),
    [],
  );

  // The shader draws over the page background, so the contour colours have to
  // track the theme or they wash out against white.
  useEffect(() => {
    const root = document.documentElement;

    const sync = () => {
      const shader = material.current;
      if (!shader) return;

      const accent = getComputedStyle(root).getPropertyValue("--bw-accent").trim();
      // The theme is stamped on <html> once the theme script runs; light is
      // also what an unstamped root renders as, so treat "not dark" as light.
      const light = root.dataset.theme !== "dark";

      // Light mode takes the pale end of each ramp — brand-400 and a soft teal
      // rather than the link blue and Fluent's full-strength teal. On white the
      // saturated hues drew a hard cyan-blue net across the headline; these sit
      // behind the copy as texture, which is all the backdrop is for. Dark keeps
      // the accent itself, which is already the light end of the ramp there.
      shader.uniforms.uPrimary.value.set(light ? "#6cb8f6" : accent || "#0078d4");
      shader.uniforms.uSecondary.value.set(light ? "#8ad9d9" : "#4fd2d2");

      // Lighter hues on white need less weight, not more: the contrast against
      // the canvas is what makes the lines read, and these have less of it.
      shader.uniforms.uIntensity.value = light ? 0.5 : 1;
      shader.uniforms.uWash.value = light ? 0.022 : 0.05;
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useFrame((state, delta) => {
    if (!material.current) return;

    material.current.uniforms.uTime.value += delta;

    // Ease toward the cursor so the basin drifts rather than snaps.
    pointer.current.lerp(state.pointer, 0.04);
    material.current.uniforms.uPointer.value.copy(pointer.current);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function BasinField() {
  return (
    <Canvas
      className="size-full"
      // Cap DPR — the shader is fill-rate bound on retina displays.
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 1], fov: 50 }}
    >
      <Field />
    </Canvas>
  );
}
