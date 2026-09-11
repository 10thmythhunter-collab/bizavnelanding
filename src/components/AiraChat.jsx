import { useCallback, useEffect, useRef, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";
import airaAvatar from "../assets/preview/aira-avatar.png";
import "./AiraChat.css";

// How long a bubble takes to fold away. Kept in step with the exit keyframes
// in AiraChat.css — the timer that unmounts the item has to outlast them, or
// it would vanish mid-fold.
const EXIT_MS = 300;

// The transcript plays itself rather than arriving finished: each step waits
// `after` milliseconds from the one before it. A step with `clears` puts the
// named kind on its way out as it lands, which is how the answer takes the
// thinking bubble's place.
//
// The words are the design's, verbatim — lowercase "europe" included.
const OPENING = [
  {
    after: 340,
    kind: "user",
    text: "Find me a Challenger 350, Nice → London, Thursday 08:00.",
  },
  { after: 620, kind: "thinking" },
  {
    after: 1650,
    kind: "ai",
    clears: "thinking",
    text: "Three tails within range. Best fit lifts at 08:15 from NCE, €18,400 all-in — crew and slots confirmed. Want me to draft the quote?",
  },
  { after: 620, kind: "suggest", text: "I need something smaller for europe" },
];

// What the suggestion leads to. The design stops at the white pill, so the
// answer past it is written to the same brief: one concrete tail, the numbers
// that decide it, and the next move handed back to the broker.
const FOLLOW_UP = [
  {
    after: 140,
    kind: "user",
    text: "I need something smaller for europe",
  },
  { after: 560, kind: "thinking" },
  {
    after: 1700,
    kind: "ai",
    clears: "thinking",
    text: "Then the Phenom 300E is the fit — 08:05 out of NCE, €11,600 all-in, same slot window. Two seats fewer than the 350, and it clears London City. Want me to hold it?",
  },
];

function Bubble({ item, onSuggest }) {
  if (item.kind === "user") {
    return (
      <p className="aira-chat__bubble aira-chat__bubble--user">{item.text}</p>
    );
  }

  if (item.kind === "ai") {
    return (
      <p className="aira-chat__bubble aira-chat__bubble--ai">{item.text}</p>
    );
  }

  if (item.kind === "thinking") {
    return (
      <p className="aira-chat__bubble aira-chat__bubble--thinking">
        {/* The package's other tuned preset: 20px, designed for sitting on a
            line of text rather than scaled down from the 64px one. */}
        <ThinkingOrb
          className="aira-chat__thinking-orb"
          state="working"
          size={20}
          theme="dark"
        />
        Aira is thinking…
      </p>
    );
  }

  return (
    <>
      {/* The design closes the transcript on a hairline before the
          suggestion, which is what separates a reply from a prompt. */}
      <span className="aira-chat__hair" />
      <button
        className="aira-chat__suggest"
        type="button"
        // Once it has been sent it is on its way out; a second click would
        // start the follow-up twice.
        disabled={item.exiting}
        onClick={() => onSuggest(item.text)}
      >
        {item.text}
      </button>
    </>
  );
}

function AiraChat({ onBack }) {
  const [items, setItems] = useState([]);
  const timers = useRef([]);
  const logRef = useRef(null);
  const seq = useRef(0);

  // Every timer this component starts goes in one list, so unmounting —
  // Back, or a route away mid-sentence — cancels the rest of the script.
  const at = useCallback((ms, run) => {
    timers.current.push(window.setTimeout(run, ms));
  }, []);

  const play = useCallback(
    (steps) => {
      let t = 0;
      for (const { after, clears, ...item } of steps) {
        t += after;
        at(t, () => {
          setItems((prev) => [
            ...(clears
              ? prev.map((it) =>
                  it.kind === clears ? { ...it, exiting: true } : it,
                )
              : prev),
            { ...item, id: ++seq.current },
          ]);
        });
        if (clears) {
          // Matched on kind *and* the exit flag, so this only ever takes the
          // bubble this step put on its way out.
          at(t + EXIT_MS, () =>
            setItems((prev) =>
              prev.filter((it) => !(it.kind === clears && it.exiting)),
            ),
          );
        }
      }
    },
    [at],
  );

  useEffect(() => {
    play(OPENING);
    return () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
  }, [play]);

  // The log is capped so the panel cannot outgrow the burst beside it, so
  // from the follow-up on it has to follow the newest message itself. Twice:
  // once now, and once after the bubble has finished unfolding, since its
  // height is still growing on this frame.
  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    // scrollTop rather than scrollTo({behavior}) — the glide comes from the
    // log's own scroll-behavior, which one media query can turn off.
    const toEnd = () => {
      log.scrollTop = log.scrollHeight;
    };
    toEnd();
    const late = window.setTimeout(toEnd, 460);
    return () => window.clearTimeout(late);
  }, [items]);

  const onSuggest = useCallback(() => {
    setItems((prev) =>
      prev.map((it) => (it.kind === "suggest" ? { ...it, exiting: true } : it)),
    );
    at(EXIT_MS, () =>
      setItems((prev) =>
        prev.filter((it) => !(it.kind === "suggest" && it.exiting)),
      ),
    );
    play(FOLLOW_UP);
  }, [at, play]);

  return (
    <div className="aira-chat">
      <div className="aira-chat__panel">
        <div className="aira-chat__head">
          <span className="aira-chat__who">
            <img className="aira-chat__avatar" src={airaAvatar} alt="" />
            Aira
          </span>
          <span className="aira-chat__status">AI assistant · online</span>
        </div>

        <div className="aira-chat__divider" />

        {/* polite rather than assertive: the transcript should be read out as
            it fills in without cutting off whatever came before. */}
        <div className="aira-chat__log" ref={logRef} aria-live="polite">
          {items.map((item) => (
            <div
              className="aira-chat__reveal"
              data-exit={item.exiting ? "" : undefined}
              key={item.id}
            >
              <div className="aira-chat__clip">
                <div className="aira-chat__slot" data-kind={item.kind}>
                  <Bubble item={item} onSuggest={onSuggest} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="aira-chat__back" type="button" onClick={onBack}>
        ← Back
      </button>
    </div>
  );
}

export default AiraChat;
