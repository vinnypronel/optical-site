'use client';

import { useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 121;
const FRAME_PATH = (i: number) =>
  `/frames/g_${String(i + 1).padStart(3, '0')}.webp`;
const RENDER_SCALE = 0.75;

type Props = {
  rangeRef: React.RefObject<HTMLElement>;
  isReady?: boolean;
};

export default function ScrollFrames({ rangeRef, isReady = true }: Props) {
  const canvasRef           = useRef<HTMLCanvasElement>(null);
  const scrollProgressRef   = useRef<HTMLSpanElement>(null);
  const [loaded, setLoaded] = useState(0);

  const framesRef      = useRef<HTMLImageElement[]>([]);
  const loadedFlagsRef = useRef<boolean[]>([]);
  const isReadyRef     = useRef(isReady);

  useEffect(() => {
    isReadyRef.current = isReady;
  }, [isReady]);

  // ── Preload every frame ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    const flags: boolean[] = new Array(FRAME_COUNT).fill(false);
    framesRef.current = images;
    loadedFlagsRef.current = flags;
    let done = 0;

    const load = (i: number) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = FRAME_PATH(i);
      const mark = () => {
        if (cancelled) return;
        flags[i] = true;
        done += 1;
        setLoaded(done);
      };
      img.onload = mark;
      img.onerror = mark;
      images[i] = img;
    };

    // Coarse pass first so scrubbing works immediately
    for (let i = 0; i < FRAME_COUNT; i += 10) load(i);
    for (let i = 0; i < FRAME_COUNT; i++) if (!images[i]) load(i);

    return () => { cancelled = true; };
  }, []);

  // ── Render loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const range = rangeRef.current;
    if (!canvas || !range) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    let cw = 0;
    let ch = 0;

    let scrollResponse = window.innerWidth <= 820 ? 0.6 : 0.38;
    let progress = 0;
    let targetIndex = 0;
    let currentIndex = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      cw = rect.width;
      ch = rect.height;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      scrollResponse = window.innerWidth <= 820 ? 0.6 : 0.38;
    };
    resize();
    window.addEventListener('resize', resize);

    const computeTarget = () => {
      if (!isReadyRef.current) {
        progress = 0;
        targetIndex = 0;
        return;
      }
      const vh = window.innerHeight;
      const sectionTop = range.offsetTop;
      const sectionH = range.offsetHeight;
      const endY = sectionTop + sectionH - vh;
      const total = endY - sectionTop;

      const SNAP_PIXELS = 120;
      const scrolledY = window.scrollY;

      let activeProgress = 0;
      if (scrolledY >= SNAP_PIXELS) {
        const remainingScroll = scrolledY - SNAP_PIXELS;
        const remainingTotal = total - SNAP_PIXELS;
        activeProgress = remainingTotal > 0 ? Math.min(1, Math.max(0, remainingScroll / remainingTotal)) : 0;
      }

      progress = activeProgress;
      targetIndex = activeProgress * (FRAME_COUNT - 1);
    };

    const pickFrame = (i: number) => {
      const target = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(i)));
      const imgs = framesRef.current;
      const flags = loadedFlagsRef.current;
      if (flags[target] && imgs[target]?.naturalWidth) return imgs[target];
      for (let d = 1; d < FRAME_COUNT; d++) {
        const a = target - d;
        const b = target + d;
        if (a >= 0 && flags[a] && imgs[a]?.naturalWidth) return imgs[a];
        if (b < FRAME_COUNT && flags[b] && imgs[b]?.naturalWidth) return imgs[b];
      }
      return null;
    };

    const draw = (idx: number) => {
      const img = pickFrame(idx);
      if (!img) return;
      ctx.clearRect(0, 0, cw, ch);
      const ia = img.naturalWidth / img.naturalHeight;
      const ca = cw / ch;
      let dw: number, dh: number;
      if (ca > ia) { dh = ch; dw = dh * ia; }
      else { dw = cw; dh = dw / ia; }
      dw *= RENDER_SCALE;
      dh *= RENDER_SCALE;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);

      // Cover KlingAI watermark in the bottom-right corner of the frame
      // (oversized patch so it stays hidden at every viewport size)
      ctx.fillStyle = '#ddc7a0';
      const coverW = dw * 0.125;
      const coverH = dh * 0.075;
      const coverX = (cw - dw) / 2 + dw * 0.880;
      const coverY = (ch - dh) / 2 + dh * 0.910;
      ctx.fillRect(coverX, coverY, coverW + 2, coverH + 2);
    };

    let raf = 0;
    const tick = () => {
      computeTarget();

      currentIndex += (targetIndex - currentIndex) * scrollResponse;
      draw(currentIndex);

      if (scrollProgressRef.current) {
        scrollProgressRef.current.style.height = `${(progress * 100).toFixed(2)}%`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('scroll', computeTarget, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', computeTarget);
    };
  }, [rangeRef]);

  const pct = (loaded / FRAME_COUNT) * 100;
  const fullyLoaded = loaded >= FRAME_COUNT;

  return (
    <>
      <div className="frames-stage" aria-hidden>
        <canvas ref={canvasRef} className="frames-canvas" />

        <div className="frames-loader" data-done={fullyLoaded ? 'true' : 'false'}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="frames-scroll-track">
        <span ref={scrollProgressRef} className="frames-scroll-fill" />
      </div>
    </>
  );
}
