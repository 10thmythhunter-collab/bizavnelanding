import { useEffect, useRef, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";
import appStoreBadge from "../assets/aira/app-store-badge.svg";
import AiraChat from "./AiraChat.jsx";
import ShaderBackground from "./ShaderBackground.jsx";
import UnicornEmbed from "./UnicornEmbed.jsx";
import "./Aira.css";

// How much of the section has to be on screen before it starts arriving.
const REVEAL_AT = 0.2;

// The order the section assembles itself in, in milliseconds from the
// moment it is scrolled to: the ground opens out of the top-left corner,
// the copy comes in behind it from the left, the burst after that, and then
// the chips one at a time down the orbit. The CSS carries the durations —
// these are only the starts, and only the chips' need to be here, since
// they are per-element.
const CHIP_IN = 1500;
const CHIP_STEP = 320;

// When the last chip has landed. Past this the section drops the arrival
// rules altogether — see the "rested" state in Aira.css.
const SEQUENCE_MS = 3200;

// The burst is the scene rather than a still. It keeps the label positions
// below honest, since they are percentages of the same box.
const SCENE = "rr0UyQ0o3fHCtxg82WNY";

// Positioned against the burst rather than the section, so the four of them
// keep their orbit as it scales. Percentages of its 489x527 box, taken from
// the design's own absolute placement.
//
// The float is per chip on purpose: four identical durations would have them
// rising and falling in lockstep, which reads as one object rather than four
// drifting ones. The delays are negative so each starts partway through its
// own cycle instead of all four setting off together on the first frame.
const labels = [
  {
    text: "Keeps the deal moving",
    left: "56.65%",
    top: "20.11%",
    float: "5.2s",
    phase: "0s",
  },
  {
    text: "Builds the spec",
    left: "4.5%",
    top: "43.07%",
    float: "6.1s",
    phase: "-1.4s",
  },
  {
    text: "Drafts the approach",
    left: "70.35%",
    top: "59.58%",
    float: "5.6s",
    phase: "-0.7s",
  },
  {
    text: "Researches a tail",
    left: "1.84%",
    top: "75.33%",
    float: "6.6s",
    phase: "-2.1s",
  },
];

// variant "owners" is the Owners page's own copy of this section (node
// 215:21752) — the same burst, the same chips, the same copy, but the
// design arranges it differently: stacked and centred rather than as two
// columns, the copy over the burst instead of beside it, and no actions
// row at all — no "See example" button, no App Store badge. Everything
// that isn't the arrangement (the type scale, the burst, the chips) stays
// the brokers' own, so the two pages read as the same section.
function Aira({ variant = "brokers" }) {
  const isOwners = variant === "owners";

  // The CTA swaps this column for the transcript — node 178:16870 is the
  // same section with the copy replaced, the burst and its labels untouched.
  // Unmounting the chat on Back is also what resets it, so a second click
  // plays the exchange again from the first message.
  const [chatOpen, setChatOpen] = useState(false);
  const sectionRef = useRef(null);

  // Arrives once, on the first time it is scrolled to, and stays arrived:
  // the observer disconnects on that crossing, so coming back up the page
  // finds it already there. Only a reload plays it again.
  //
  // The starting state is armed from here rather than from the stylesheet,
  // and written straight to the node rather than held in state: armed from
  // CSS alone, a reader whose JavaScript never ran would be left with an
  // empty black band, and state here would re-render the section to set an
  // attribute the DOM can carry itself.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    if (!("IntersectionObserver" in window)) {
      section.dataset.reveal = "done";
      return undefined;
    }

    section.dataset.reveal = "pending";

    let settle = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.dataset.reveal = "done";
        observer.disconnect();
        // And then out of the way entirely. The arrival leaves a clip-path
        // on the background, which the browser has to recompute every time
        // this section's box changes — and the box changes on every line the
        // chat adds, which on a narrow screen is a hundred times over. None
        // of it is needed once the section is in.
        settle = window.setTimeout(() => {
          section.dataset.reveal = "rested";
        }, SEQUENCE_MS);
      },
      { threshold: REVEAL_AT },
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      window.clearTimeout(settle);
    };
  }, []);

  return (
    // Both pages carry this section at once (see App.jsx), so the id has to
    // differ between them or the document would hold two of the same one —
    // and each bar links to its own anyway.
    <section
      className={`aira${isOwners ? " aira--owners" : ""}`}
      id={isOwners ? "owners-aira" : "aira"}
      ref={sectionRef}
    >
      <div className="aira__bg" aria-hidden="true">
        {/* The same shader that sits behind the middle product card above,
            rather than the still this section shipped with. */}
        <ShaderBackground className="aira__bg-shader" />
        <div className="aira__bg-veil" />
      </div>

      <div className="aira__row">
        {chatOpen ? (
          <AiraChat onBack={() => setChatOpen(false)} />
        ) : (
          <div className="aira__copy">
            <header className="aira__head">
              <p className="aira__eyebrow">INTRODUCING</p>
              <h2 className="aira__title">AIRA</h2>
              <p className="aira__sub">
                The first agentic AI built for jet brokers
              </p>
            </header>

            <p className="aira__body">
              Not a chatbot. <strong>AIRA</strong> is the brain behind the
              platform handling the repetitive, labor-heavy work fast and
              precisely. And it doesn&apos;t stop at chat: <strong>AIRA</strong>{" "}
              runs the operations across all of our products Terminal, Owners,
              and Agent.
            </p>

            {!isOwners && (
              <div className="aira__actions">
                <button
                  className="aira__cta"
                  type="button"
                  onClick={() => setChatOpen(true)}
                >
                  {/* The live orb in place of the still I exported from the
                  design — that layer was named "Thinking Orb Button" there,
                  so the still was a render of this component. size is the
                  package's 64px tuning preset (its dot count and speed are
                  designed per size, not scaled); the CSS below displays it
                  at the pill's own em measure. theme="dark" is the light-ink
                  palette, which is what this pill's ground wants. */}
                  <ThinkingOrb
                    className="aira__cta-orb"
                    state="working"
                    size={64}
                    theme="dark"
                  />
                  See example of AIRA in action
                </button>

                <div className="aira__app">
                  {/* The badge alone only says "download"; this says what
                    there is to download, which is the same agent rather than
                    a companion or a viewer. */}
                  <p className="aira__app-note">
                    AIRA is an app too — the same agent, on your phone.
                  </p>

                  {/* The badge is Apple's own artwork, so the link carries
                    the name and the image itself stays decorative. */}
                  <a
                    className="aira__badge"
                    href="#app-store"
                    aria-label="Download on the App Store"
                  >
                    <img src={appStoreBadge} alt="" loading="lazy" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="aira__orb">
          {/* Two boxes around the scene, both doing one job. The frame is
              larger than the slot because the scene draws its mark across
              only the middle ~63% of whatever canvas it is given — measured,
              see Aira.css — so the canvas has to be that much bigger for the
              mark itself to fill the slot, which is what puts the labels on
              it rather than around it. The clip stops that oversized canvas
              reaching across the copy beside it; the labels are outside the
              clip, so they can still overhang the slot as the design has
              them. */}
          <div className="aira__orb-clip">
            <div className="aira__orb-frame">
              <UnicornEmbed
                className="aira__orb-scene"
                projectId={SCENE}
                width="100%"
                height="100%"
                scale={1}
                dpi={1.5}
              />
            </div>
          </div>

          {labels.map(({ text, left, top, float, phase }, index) => (
            <span
              className="aira__label"
              // Which side of the burst it hangs on. Only the phone
              // stylesheet reads it, and only to hang the right-hand two off
              // the right edge instead of off a left offset — see the
              // breakpoint in Aira.css.
              data-side={Number.parseFloat(left) > 50 ? "right" : "left"}
              style={{
                // Handed over as custom properties rather than set as left
                // and top directly. An inline left beats any stylesheet rule
                // short of !important, so the phone breakpoint below could
                // not take it back — it would end up with a left AND a right,
                // which stretches the pill between them instead of letting it
                // shrink to its own text.
                "--aira-left": left,
                "--aira-top": top,
                "--aira-float": float,
                "--aira-float-phase": phase,
                // The array is in the order they hang on the orbit, top to
                // bottom, so the index is the order they arrive in.
                "--aira-in": `${CHIP_IN + index * CHIP_STEP}ms`,
              }}
              key={text}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Aira;
