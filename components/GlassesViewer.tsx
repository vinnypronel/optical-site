'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type Props = {
  scrollProgressRef: React.RefObject<number>; // kept for API compat
  onShow?: () => void; // fired when 3D becomes active
  onHide?: () => void; // fired when 3D becomes inactive
};

export default function GlassesViewer({ onShow, onHide }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const canvas = canvasRef.current;
    if (!mount || !canvas) return;

    const W = mount.clientWidth  || window.innerWidth;
    const H = mount.clientHeight || window.innerHeight;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const gl = renderer.domElement;
    gl.setAttribute('draggable', 'false');
    gl.style.position      = 'absolute';
    gl.style.inset         = '0';
    gl.style.width         = '100%';
    gl.style.height        = '100%';
    gl.style.display       = 'block';
    gl.style.touchAction   = 'none';
    gl.style.pointerEvents = 'auto';
    gl.style.userSelect    = 'none';
    gl.style.cursor        = 'grab';

    // ── Scene & camera ────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const FOV    = 36;
    const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.01, 200);
    // Camera will be repositioned once the model loads
    camera.position.set(0, 0, 5);

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xfff8ee, 1.4));

    const key = new THREE.DirectionalLight(0xffffff, 2.6);
    key.position.set(4, 5, 6);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xddc7a0, 1.0);
    fill.position.set(-4, 0, 3);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffecd6, 0.6);
    rim.position.set(0, -4, -5);
    scene.add(rim);

    // ── Pivot (user drag rotates this) ────────────────────────────────────────
    const pivot = new THREE.Group();
    scene.add(pivot);

    // ── Load & fit model ─────────────────────────────────────────────────────
    new GLTFLoader().load(
      '/ray_ban_ivs.glb',
      (gltf) => {
        const model = gltf.scene;

        // 1. Compute raw bounding box before any transform
        const rawBox  = new THREE.Box3().setFromObject(model);
        const rawSize = rawBox.getSize(new THREE.Vector3());

        // 2. Scale so the longest dimension = TARGET world units
        const TARGET = 2.8;
        model.scale.setScalar(TARGET / Math.max(rawSize.x, rawSize.y, rawSize.z));

        // 3. Re-center AFTER scaling (model's pivot may not be at its centroid)
        const scaledBox    = new THREE.Box3().setFromObject(model);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        model.position.sub(scaledCenter); // bounding-box centre now at world origin

        pivot.add(model);

        // 4. Fit camera: place it so bounding sphere fills ~72 % of viewport
        const finalBox    = new THREE.Box3().setFromObject(pivot);
        const sphere      = finalBox.getBoundingSphere(new THREE.Sphere());
        const vFovRad     = (FOV * Math.PI) / 180;
        const camZ        = (sphere.radius / Math.sin(vFovRad / 2)) * 0.75;

        camera.position.set(0, 0, camZ);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      },
      undefined,
      (err) => console.error('[GlassesViewer] GLB load error:', err)
    );

    // ── Drag state ────────────────────────────────────────────────────────────
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let vx    = 0;
    let vy    = 0;

    // ── Visibility (hidden by default, 2D shows underneath) ───────────────────
    mount.style.transition    = 'opacity 0.22s ease';
    mount.style.opacity       = '0';
    mount.style.pointerEvents = 'auto'; // capture pointer events even when invisible

    const show = () => {
      mount.style.opacity = '1';
      onShow?.();
    };
    const hide = () => {
      mount.style.opacity = '0';
      onHide?.();
    };

    // ── Pointer handlers ──────────────────────────────────────────────────────
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      try { gl.setPointerCapture(e.pointerId); } catch (_) { /* ok */ }

      isDragging = true;
      lastX      = e.clientX;
      lastY      = e.clientY;
      vx         = 0;
      vy         = 0;

      gl.style.cursor = 'grabbing';
      show();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      pivot.rotation.y += dx * 0.007;
      pivot.rotation.x  = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, pivot.rotation.x + dy * 0.007)
      );
      vx = dx * 0.007;
      vy = dy * 0.007;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      try { gl.releasePointerCapture(e.pointerId); } catch (_) { /* ok */ }
      gl.style.cursor = 'grab';
      hide();
    };

    const blockNative = (e: Event) => e.preventDefault();

    gl.addEventListener('pointerdown',   onPointerDown,  { passive: false });
    gl.addEventListener('pointermove',   onPointerMove,  { passive: false });
    gl.addEventListener('pointerup',     onPointerUp);
    gl.addEventListener('pointercancel', onPointerUp);
    gl.addEventListener('dragstart',     blockNative);
    gl.addEventListener('drag',          blockNative);
    gl.addEventListener('touchstart',    blockNative, { passive: false });
    gl.addEventListener('touchmove',     blockNative, { passive: false });
    gl.addEventListener('mousedown',     blockNative);
    gl.addEventListener('selectstart',   blockNative);
    gl.addEventListener('contextmenu',   blockNative);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth  || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Render loop ───────────────────────────────────────────────────────────
    let raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick);

      // Inertia: keep spinning gently after release
      if (!isDragging && (Math.abs(vx) > 0.0001 || Math.abs(vy) > 0.0001)) {
        pivot.rotation.y += vx;
        pivot.rotation.x += vy;
        vx *= 0.92;
        vy *= 0.92;
      }

      renderer.render(scene, camera);
    };
    tick();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      gl.removeEventListener('pointerdown',   onPointerDown);
      gl.removeEventListener('pointermove',   onPointerMove);
      gl.removeEventListener('pointerup',     onPointerUp);
      gl.removeEventListener('pointercancel', onPointerUp);
      gl.removeEventListener('dragstart',     blockNative);
      gl.removeEventListener('drag',          blockNative);
      gl.removeEventListener('touchstart',    blockNative);
      gl.removeEventListener('touchmove',     blockNative);
      gl.removeEventListener('mousedown',     blockNative);
      gl.removeEventListener('selectstart',   blockNative);
      gl.removeEventListener('contextmenu',   blockNative);
      renderer.dispose();
    };
  }, [onShow, onHide]);

  return (
    <div
      ref={mountRef}
      style={{
        position:     'absolute',
        inset:        0,
        opacity:      0,
        pointerEvents:'auto',
        zIndex:       5,
        cursor:       'grab',
        touchAction:  'none',
        userSelect:   'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position:     'absolute',
          inset:        0,
          width:        '100%',
          height:       '100%',
          display:      'block',
          pointerEvents:'auto',
        }}
      />
    </div>
  );
}
