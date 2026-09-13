import { useEffect, useRef } from "react";
import plane from "../assets/plane.svg";
import "./Companies.css";

// When the strip starts arriving. It sits directly under the hero, so
// anything keyed off it merely touching the viewport fired while it was
// still a sliver at the bottom of the screen and was over before it had been
// scrolled to properly.
//
// Two parts to holding it back: the root is the viewport with its bottom
// third taken off, so the strip has to be well clear of the fold before it
// counts as seen at all, and half of it has to be inside what is left.
const REVEAL_AT = 0.5;
const REVEAL_MARGIN = "0px 0px -32% 0px";

// The design repeats one line the whole way along. These are the same
// sentence's register — short, flat, no exclamation — and each one is a claim
// the page itself already makes: the platform line is the hero's own, the
// week-in-a-day is its subtitle, the pre-listing line is what Signals does,
// and the datapoints figure is the first of the four stats under the hero.
// Nothing here says anything the site does not.
//
// The first is the heading below, so it stays the one a reader is told.
const LINES = [
  "Used by the world’s top brokers",
  "Every workflow on one platform",
  "A week’s work in a day",
  "Aircraft intent before the listing",
  "Built on 1.5B datapoints",
];

// An item is a line plus the three planes after it, and they average some
// 300px. Ten of them make a run wider than any screen this is read on, which
// is what the loop below needs: it moves by exactly one run, so a run shorter
// than the viewport would show the join. Two runs then cover the width.
const PER_RUN = 10;
const items = Array.from({ length: PER_RUN }, (_, index) => index);

function Run({ aria }) {
  return (
    <div className="companies__run" aria-hidden={aria}>
      {items.map((index) => (
        <div className="companies__item" key={index}>
          {/* A heading once, on the first item of the first run. Everything
              after it is there to fill the strip and is hidden from assistive
              tech — a reader who cannot see it should be given the claim
              once, not twenty times over. */}
          {!aria && index === 0 ? (
            <h2 className="companies__line">{LINES[0]}</h2>
          ) : (
            <p className="companies__line" aria-hidden="true">
              {LINES[index % LINES.length]}
            </p>
          )}

          <span className="companies__planes" aria-hidden="true">
            <span className="companies__plane" />
            <span className="companies__plane" />
            <span className="companies__plane" />
          </span>
        </div>
      ))}
    </div>
  );
}

function Companies() {
  const sectionRef = useRef(null);

  // Arrives once, the first time it is scrolled to, and stays arrived: the
  // observer disconnects on that crossing, so coming back up the page finds
  // it already there and only a reload plays it again.
  //
  // The hidden state is armed from here rather than from the stylesheet, and
  // written straight to the node rather than held in state: armed from CSS
  // alone, a reader whose JavaScript never ran would be left with a blank
  // band, and state here would re-render the section to set an attribute the
  // DOM can carry itself.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    if (!("IntersectionObserver" in window)) {
      section.dataset.reveal = "done";
      return undefined;
    }

    section.dataset.reveal = "pending";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.dataset.reveal = "done";
        observer.disconnect();
      },
      { threshold: REVEAL_AT, rootMargin: REVEAL_MARGIN },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    // The glyph is handed to CSS as a mask rather than dropped in as thirty
    // <img> elements: it is one shape repeated, it takes its colour from the
    // strip, and the build inlines this file as a data URI — which thirty
    // copies of would be thirty copies of the data.
    <section
      className="companies"
      style={{ "--companies-plane": `url("${plane}")` }}
      ref={sectionRef}
    >
      {/* The bar is its own layer: the arrival below uncovers it from the top
          down while the line riding on it stays put and comes in after. */}
      <div className="companies__bg" aria-hidden="true" />

      <div className="companies__track">
        <Run />
        {/* The same run again, so that as the first one travels out of frame
            the second is already in it. The loop moves by exactly one run's
            width and starts over, which is what makes it seamless. */}
        <Run aria="true" />
      </div>
    </section>
  );
}

export default Companies;
