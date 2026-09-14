import { memo, useEffect, useRef, useState } from "react";
import sketchUrl from "../assets/loading-sketch.svg";
import lockup from "../assets/bizavLockup.svg";
import heroPoster from "../assets/hero-skyline.jpg";
import "./Loading.css";

// The first line is the design's; the rest carry the same voice. The bar is
// divided evenly between them, so adding or removing one is all it takes to
// re-time the sequence.
const messages = [
  "Getting things ready…",
  "Syncing 1.5B datapoints…",
  "Clearing you for takeoff…",
];

// The load: the bar does not creep, it reports. It moves to a third, waits,
// moves to two thirds, waits, then finishes — one step per message below it.
// The three drawings are laid down across exactly that span, so the pen and
// the bar finish together.
const STEPS = 3;
const STEP_MS = 400;
const STEP_HOLD_MS = 450;
// It is full the moment the last of those moves lands, so the wait that would
// have followed never happens — and counting it in would leave the drawings
// six hundred milliseconds short of the bar they are timed against.
const LOAD_MS = (STEPS - 1) * (STEP_MS + STEP_HOLD_MS) + STEP_MS;

// Ease each step in and out of its own move; the pauses carry the rhythm, but
// starting and stopping dead reads as a stutter rather than a beat.
function smooth(t) {
  return t * t * (3 - 2 * t);
}

// How long a single line of a drawing takes to land. The gap between one step
// of a sweep and the next is whatever is left of the load divided between them.
const LINE_MS = 400;

// The design's own background: the pen sketch bled to all four edges, built
// out of Figma by scripts/build-loading-sketch.mjs. It is inlined rather than
// dropped in an <img> so its thousand paths can be animated one at a time —
// which is the whole point of it, and what a flat picture of the same drawing
// could not do. Fetched rather than imported, which would put the markup in
// the bundle ahead of the first paint; and the screen cannot start until it is
// here, because it is the screen.
//
// One sweep, left to right across the page, over the bar's own span — so the
// pen and the bar finish on the same beat.
const artwork = [{ name: "sketch", url: sketchUrl, at: 0, drawMs: LOAD_MS }];

// The screen stands finished once the bar fills — drawings whole, nothing
// moving — before anything starts to leave.
const FULL_HOLD_MS = 700;

// The exit, after that. The drawings retreat the way they came while
// everything but the logo softens out of focus; the logo walks to the middle
// and grows to the size the design's second screen draws it at; the white
// ground fills with that screen's sky as the mark turns from black to white;
// and then the frame dives into the eye of the "a" of "bizav" until the
// letter has opened past every edge and only that sky is left.
const UNDRAW_MS = 1200;
const VANISH_MS = 600;
const LIFT_AT = UNDRAW_MS;
const LIFT_MS = 450;
// The colour arrives the moment the logo lands, and the mark turns with it —
// one move, not two.
const COLOUR_AT = LIFT_AT + LIFT_MS;
const COLOUR_MS = 600;
// Long enough to be read as a frame of its own — it is a frame of its own in
// the design, and white paper becoming a sky wants a beat before the camera
// moves again.
const COLOUR_HOLD_MS = 500;
const ZOOM_AT = COLOUR_AT + COLOUR_MS + COLOUR_HOLD_MS;
const ZOOM_MS = 600;
// The dive lands on the ground showing through the letter, so the frame is
// already flat sky by the time it gets there; this lays the same colour over
// the top under cover of the second half of the zoom, which takes the last of
// the ring off the screen cleanly.
const INK_AT = ZOOM_AT + ZOOM_MS / 2;
const INK_MS = ZOOM_MS / 2;
const INK_HOLD_MS = 200;
const EXIT_MS = INK_AT + INK_MS + INK_HOLD_MS;

// The site is already painted behind the loader by then, and the loader is one
// flat colour over it; this is only the cover coming off.
const HANDOVER_MS = 400;

// Read once, when the markup lands: every path carries its place in the
// drawing's own sweep, so the last place is how many steps that sweep has —
// several paths can share one.
function sweepSteps(markup) {
  return Math.max(...Array.from(markup.matchAll(/--i:(\d+)/g), (m) => +m[1]));
}

// Memoised, and on primitives only, because the bar re-renders its parent on
// every frame of the load: React 19 compares dangerouslySetInnerHTML by object
// identity, and a fresh {__html} each render has it re-parse the drawing —
// which replaces every path with a new element and restarts every line's
// animation, sixty times a second. Nothing here depends on the progress, so
// the cheapest fix is for it never to re-render at all.
const Drawing = memo(function Drawing({
  name,
  url,
  markup,
  steps,
  at,
  drawMs,
}) {
  const style = {
    "--steps": steps,
    // Spread whatever each window has left over those steps and that is the
    // pace. Kept on the drawing rather than the screen so the three never have
    // to share a clock.
    "--draw-at": `${at}ms`,
    "--line-step": `${(drawMs - LINE_MS) / steps}ms`,
    // They all leave together, so this one is the same for each of them.
    "--undraw-step": `${(UNDRAW_MS - LINE_MS) / steps}ms`,
  };
  const className = `loading__art loading__art--${name}`;

  return markup ? (
    <div
      className={className}
      style={style}
      aria-hidden="true"
      // Our own build asset, tagged by the script that produced it.
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  ) : (
    // The fetch is allowed to fail; the screen still needs its drawings.
    <img className={className} style={style} src={url} alt="" />
  );
});

function preload(src) {
  const image = new Image();
  image.src = src;
  return image.decode
    ? image.decode()
    : new Promise((resolve) => {
        image.onload = resolve;
        image.onerror = resolve;
      });
}

function Loading({ onDone, onExited }) {
  const [progress, setProgress] = useState(0);
  const [drawings, setDrawings] = useState(null);
  const [stage, setStage] = useState("waiting");
  const [focus, setFocus] = useState({ dx: 0, dy: 0 });
  const [leaving, setLeaving] = useState(false);
  const lockupRef = useRef(null);

  // Nothing can be shown until the drawing is here — it is most of what
  // there is to show, and starting the bar without it would have the pen
  // join a sweep already in progress. The hero's first frame is fetched
  // alongside but does not hold the screen up: the sequence runs for seven
  // seconds after this, which is all the head start it needs.
  useEffect(() => {
    let live = true;
    preload(heroPoster);
    Promise.all(
      artwork.map(({ name, url }) =>
        fetch(url)
          .then((response) => response.text())
          .then((markup) => [name, markup]),
      ),
    )
      // A broken or slow asset must not strand the loader: the screen still
      // owes the site a handover.
      .catch(() => [])
      .then((pairs) => {
        if (!live) return;
        setDrawings(
          Object.fromEntries(
            pairs.map(([name, markup]) => [
              name,
              { markup, steps: sweepSteps(markup) },
            ]),
          ),
        );
        setStage("load");
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (stage !== "load") return;

    let frame;
    let start;

    const tick = (now) => {
      start ??= now;
      const elapsed = now - start;
      const cycle = STEP_MS + STEP_HOLD_MS;
      const step = Math.min(STEPS - 1, Math.floor(elapsed / cycle));
      const within = Math.min(
        1,
        Math.max(0, (elapsed - step * cycle) / STEP_MS),
      );
      const value = (step + smooth(within)) / STEPS;
      setProgress(value);

      if (value < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      setStage("full");
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [stage]);

  useEffect(() => {
    if (stage !== "full") return;
    const id = setTimeout(() => {
      // Measured at the end of the hold rather than the start of it, and in
      // the same breath as the stage: the offsets and the stage land in the
      // same render, so the walk can never start a frame early with nowhere
      // to walk to.
      const box = lockupRef.current.getBoundingClientRect();
      setFocus({
        dx: window.innerWidth / 2 - (box.left + box.width / 2),
        dy: window.innerHeight / 2 - (box.top + box.height / 2),
      });
      setStage("exit");
    }, FULL_HOLD_MS);
    return () => clearTimeout(id);
  }, [stage]);

  useEffect(() => {
    if (stage !== "exit") return;
    const id = setTimeout(() => {
      // Mounting the site and starting the fade in the same breath: the site
      // gets the length of the fade to paint its first frame behind a screen
      // that is still opaque.
      setLeaving(true);
      onDone();
    }, EXIT_MS);
    return () => clearTimeout(id);
  }, [stage, onDone]);

  useEffect(() => {
    if (!leaving) return;
    const id = setTimeout(onExited, HANDOVER_MS);
    return () => clearTimeout(id);
  }, [leaving, onExited]);

  // The messages advance with the bar rather than on a clock of their own,
  // so the last one is always the one on screen when it fills.
  const active = Math.min(
    messages.length - 1,
    Math.floor(progress * messages.length),
  );
  const percent = Math.round(progress * 100);

  return (
    <div
      className="loading"
      data-stage={stage}
      data-leaving={leaving ? "" : undefined}
      style={{
        "--line-ms": `${LINE_MS}ms`,
        // Only the reduced-motion fallback reads these two: it swaps the
        // hundreds of per-line fades for one per drawing, and still has to
        // fill the same two windows.
        "--load-ms": `${LOAD_MS}ms`,
        "--undraw-ms": `${UNDRAW_MS}ms`,
        "--vanish-ms": `${VANISH_MS}ms`,
        "--lift-at": `${LIFT_AT}ms`,
        "--lift-ms": `${LIFT_MS}ms`,
        "--colour-at": `${COLOUR_AT}ms`,
        "--colour-ms": `${COLOUR_MS}ms`,
        "--zoom-at": `${ZOOM_AT}ms`,
        "--zoom-ms": `${ZOOM_MS}ms`,
        "--ink-at": `${INK_AT}ms`,
        "--ink-ms": `${INK_MS}ms`,
        "--dx": `${focus.dx}px`,
        "--dy": `${focus.dy}px`,
      }}
      aria-busy={!leaving}
    >
      {drawings &&
        artwork.map(({ name, url, at, drawMs }) => (
          <Drawing
            key={name}
            name={name}
            url={url}
            at={at}
            drawMs={drawMs}
            markup={drawings[name]?.markup}
            steps={drawings[name]?.steps ?? 1}
          />
        ))}

      <div className="loading__copy">
        {/* The one thing that survives the exit, so it is a sibling of
            everything else rather than set among it. */}
        <img
          className="loading__lockup"
          ref={lockupRef}
          src={lockup}
          alt="bizav.ai"
        />

        <p className="loading__headline">
          {/* Broken by hand: where the line turns is the design's, not
              whatever the measure happens to allow. */}
          <span className="loading__line">Platform for</span>
          <span className="loading__line">all workflows</span>
        </p>

        {/* --progress lives here rather than on the screen: it changes every
            frame, and an ancestor's custom property invalidates the style of
            everything under it — which would be all seven hundred lines of the
            drawings, sixty times a second. */}
        <div className="loading__group" style={{ "--progress": progress }}>
          <div
            className="loading__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Loading bizav.ai"
          >
            <div className="loading__fill" />
          </div>

          <div className="loading__row">
            <p className="loading__status" role="status">
              {messages.map((message, index) => (
                <span
                  className="loading__message"
                  key={message}
                  data-slot={
                    index === active
                      ? "current"
                      : index < active
                        ? "past"
                        : "next"
                  }
                  // Only the line on screen belongs in the live region; the
                  // others would all be read out at once.
                  aria-hidden={index === active ? undefined : true}
                >
                  {message}
                </span>
              ))}
            </p>

            {/* The bar already carries this figure for anything listening,
                so out loud it would be said twice. */}
            <span className="loading__percent" aria-hidden="true">
              {percent}%
            </span>
          </div>
        </div>
      </div>

      {stage === "exit" && <div className="loading__ink" />}
    </div>
  );
}

export default Loading;
