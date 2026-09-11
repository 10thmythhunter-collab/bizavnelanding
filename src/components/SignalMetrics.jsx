import { useCallback, useEffect, useRef, useState } from "react";
import UnicornEmbed from "./UnicornEmbed.jsx";
import "./SignalMetrics.css";

// How much of the row has to be on screen before the cards come in, and the
// pace they come in at — the same one the Signals tails above arrive on, so
// the two rows read as one idea continuing rather than two effects.
const REVEAL_AT = 0.25;
const CARD_IN = 80;
const CARD_STEP = 320;

// Fills all three cards on hover. None needs a veil under the copy: the
// text switches to white on the same hover instead (see the transition in
// SignalMetrics.css).
const HOVER_SCENE_ORIGIN = "EqA1amRo8xzYpIqB6hPi";
const HOVER_SCENE_CLOSINGS = "aBbjL5MbO8NbgZ48kazk";
const HOVER_SCENE_EDGE = "ZT8PAcAhhoMTfwNknbBr";

// The three numbers the Signals copy above quotes, each given its own card —
// node 205:19561, whose 1440x608 frame is exactly this row plus its padding.
//
// The words are the design's, verbatim. Two of its inconsistencies come with
// them: the first range is written with a hyphen where the other two use an
// en dash, and the second caption is the only one without a full stop.
const metrics = [
  {
    label: "FROM ORIGIN",
    figure: "10-30 days",
    note: "How fast Signals catches an owner's intent after it forms.",
    scene: HOVER_SCENE_ORIGIN,
  },
  {
    label: "FASTER CLOSINGS",
    figure: "2–4 weeks",
    note: "What you cut off that cycle by being first in",
    scene: HOVER_SCENE_CLOSINGS,
  },
  {
    label: "YOUR EDGE",
    figure: "30–90 days",
    note: "How long you work the lead before anyone else sees it.",
    scene: HOVER_SCENE_EDGE,
  },
];

function SignalMetrics() {
  // Each scene is its own WebGL context, and this page already runs several
  // — so a card's scene is built on that card's own first hover rather than
  // on load or on a shared flag, and kept mounted after that so every later
  // hover of that same card is instant. A single shared flag would have
  // hovering either card spin up both contexts at once.
  const [armedScenes, setArmedScenes] = useState(() => new Set());
  const arm = useCallback((scene) => {
    setArmedScenes((prev) =>
      prev.has(scene) ? prev : new Set(prev).add(scene),
    );
  }, []);

  const listRef = useRef(null);

  // Arrives once, on the first time the row is scrolled to, and stays: the
  // observer disconnects on that crossing. Armed from here rather than from
  // the stylesheet so a reader whose JavaScript never ran is not left with
  // three invisible cards.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    if (!("IntersectionObserver" in window)) {
      list.dataset.reveal = "done";
      return undefined;
    }

    list.dataset.reveal = "pending";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        list.dataset.reveal = "done";
        observer.disconnect();
      },
      { threshold: REVEAL_AT },
    );

    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    // No heading of its own: the section it follows makes the claim, and
    // these three cards are the numbers in it. The label is what gives a
    // screen reader something to announce in place of one.
    <section className="metrics" aria-label="Signals timing">
      <ul className="metrics__list" ref={listRef}>
        {metrics.map(({ label, figure, note, scene }, index) => (
          <li
            className="metrics__card"
            data-scene={scene ? "" : undefined}
            onPointerEnter={scene ? () => arm(scene) : undefined}
            style={{ "--metrics-in": `${CARD_IN + index * CARD_STEP}ms` }}
            key={label}
          >
            {scene && armedScenes.has(scene) && (
              <div className="metrics__scene" aria-hidden="true">
                {/* The embed's own div is absolutely positioned by this
                    wrapper: the runtime writes position:relative onto it
                    inline, so its authored 1440x900 would otherwise become
                    the card's min-content width. */}
                <UnicornEmbed
                  className="metrics__scene-embed"
                  projectId={scene}
                  width="100%"
                  height="100%"
                  scale={1}
                  dpi={1.5}
                />
              </div>
            )}

            <div className="metrics__body">
              <p className="metrics__label">{label}</p>
              <p className="metrics__figure">{figure}</p>
              <p className="metrics__note">{note}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SignalMetrics;
