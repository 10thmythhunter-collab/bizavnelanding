import { useEffect, useRef } from "react";
import "./SonicWaveform.css";

const LINE_COUNT = 60;
const SEGMENT_COUNT = 80;

// Radians per second. The original advanced 0.02 per frame, which is 1.2/s
// on a 60Hz screen and 2.4/s on a 120Hz one — so it ran at whatever speed
// the display happened to have. This is a little under 0.6 of that, off the
// frame clock, which calms the swell and makes it the same everywhere.
const TIME_RATE = 0.7;

// The line colour sampled off the design's own render — the opaque pixels
// of its waveform come out at rgb(0, 11, 219).
const LINE_RGB = "0, 11, 219";

// The original component's amplitudes are fixed pixel values against a
// full-window canvas: in a 442x523 card they leave the wave a thin band, and
// the pointer's 3x boost sends the peaks straight out through the top and
// bottom edges, which is the clipping you see on hover.
//
// So both are derived from one budget instead: the share of the half-height
// the furthest excursion is allowed to reach. Everything below scales to fit
// that, which makes clipping arithmetically impossible rather than a value
// that happened to look fine.
const PEAK_BUDGET = 0.88;
// What the pointer adds to the spike at its strongest. The original's 2.0
// cannot fit a box this size at any amplitude worth looking at.
const POINTER_BOOST = 0.4;
// The 20:50 split the original struck between its two waves.
const NOISE_SHARE = 20 / 70;
const SPIKE_SHARE = 50 / 70;

// Was a flat 400px radius; a fraction of the width keeps the pull the same
// size relative to the panel however wide the card gets.
const POINTER_RADIUS_RATIO = 0.9;

function SonicWaveform({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let time = 0;
    let last = null;
    let visible = document.visibilityState === "visible";
    let inView = true;
    let disposed = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Canvas-relative and off-centre until the pointer arrives, so the wave
    // is not pulled toward a corner before anyone has touched it.
    const pointer = { x: -1e4, y: -1e4 };

    const resize = () => {
      // Sized off the element's own box rather than the window: this one
      // lives inside a card. Capped at 2x so a 3x phone does not render
      // nine times the pixels for a background flourish.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const draw = () => {
      // The trail: each frame lays a thin black veil over the last one, so
      // the lines smear rather than snapping between positions.
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const midline = canvas.height / 2;
      // One unit of noise plus a fully boosted unit of spike is the worst
      // case; scale that to the budget and nothing can leave the box.
      const peakUnits = NOISE_SHARE + SPIKE_SHARE * (1 + POINTER_BOOST);
      const fit = (midline * PEAK_BUDGET) / peakUnits;
      const noiseAmp = NOISE_SHARE * fit;
      const spikeAmp = SPIKE_SHARE * fit;
      const pointerRadius = canvas.width * POINTER_RADIUS_RATIO;

      for (let i = 0; i < LINE_COUNT; i++) {
        ctx.beginPath();
        const progress = i / LINE_COUNT;
        // Brightest through the middle of the stack, falling off at both
        // edges, which is what gives the ribbon its depth.
        const intensity = Math.sin(progress * Math.PI);
        ctx.strokeStyle = `rgba(${LINE_RGB}, ${intensity * 0.5})`;
        ctx.lineWidth = 1.5;

        for (let j = 0; j < SEGMENT_COUNT + 1; j++) {
          const x = (j / SEGMENT_COUNT) * canvas.width;

          const distToPointer = Math.hypot(x - pointer.x, midline - pointer.y);
          const pointerEffect = Math.max(0, 1 - distToPointer / pointerRadius);

          const noise = Math.sin(j * 0.1 + time + i * 0.2) * noiseAmp;
          const spike =
            Math.cos(j * 0.2 + time + i * 0.1) *
            Math.sin(j * 0.05 + time) *
            spikeAmp;
          const y =
            midline + noise + spike * (1 + pointerEffect * POINTER_BOOST);

          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const tick = (now) => {
      frame = 0;
      if (disposed || !visible || !inView) return;
      // Clamped, so coming back from a paused tab or a stalled frame does
      // not jump the wave forward by however long it was away.
      const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.05);
      last = now;
      resize();
      draw();
      time += dt * TIME_RATE;
      request();
    };

    function request() {
      if (!disposed && visible && inView && frame === 0 && !reduced.matches) {
        frame = requestAnimationFrame(tick);
      }
    }

    // Under reduced motion the wave still shows — it is the card's whole
    // visual — it just holds one frame instead of running.
    const paint = () => {
      resize();
      draw();
    };

    const onPointerMove = (event) => {
      const box = canvas.getBoundingClientRect();
      const dpr = canvas.width / Math.max(box.width, 1);
      pointer.x = (event.clientX - box.left) * dpr;
      pointer.y = (event.clientY - box.top) * dpr;
    };

    const onPointerLeave = () => {
      pointer.x = -1e4;
      pointer.y = -1e4;
    };

    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", onPointerLeave);

    const onResize = () => {
      paint();
      request();
    };
    window.addEventListener("resize", onResize);

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas);

    // Three animated canvases share this row now, so each one has to stop
    // when it is not being looked at.
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true;
      if (inView) request();
      else if (frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = null;
      }
    });
    intersectionObserver.observe(canvas);

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      if (visible) request();
      else if (frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = null;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onReducedChange = () => {
      if (reduced.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = null;
        paint();
      } else {
        request();
      }
    };
    reduced.addEventListener("change", onReducedChange);

    paint();
    request();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onReducedChange);
    };
  }, []);

  return <canvas className={className} ref={canvasRef} />;
}

export default SonicWaveform;
