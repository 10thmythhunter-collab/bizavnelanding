import { useEffect, useRef } from "react";
import aircraft1 from "../assets/preview/aircraft-1.png";
import aircraft2 from "../assets/preview/aircraft-2.png";
import aircraft3 from "../assets/preview/aircraft-3.png";
import AircraftCard from "./AircraftCard.jsx";
import SonicWaveform from "./SonicWaveform.jsx";
import "./Signals.css";

// How much of the section has to be on screen before it starts arriving.
const REVEAL_AT = 0.2;

// The tails come in one at a time once the copy above them is in. Their own
// delay is per-element, so it is carried on the markup; the rest of the
// order lives in Signals.css.
const CARD_IN = 1250;
const CARD_STEP = 320;

// The same three tails the Terminal card's hover preview shows, at the
// design's own size here. Their figures differ from the preview's because the
// two designs give them different numbers — each follows its own node.
const aircraft = [
  {
    name: "Gulfstream G100",
    meta: "Heavy Tier 2 | 4 signals",
    ticker: "GULF",
    change: "+10.0%",
    render: aircraft1,
  },
  {
    name: "Falcon 8X",
    meta: "Heavy Tier 2 | 4 signals",
    ticker: "FAL",
    change: "+10.0%",
    render: aircraft2,
  },
  {
    name: "Citation CJ1",
    meta: "Heavy Tier 2 | 4 signals",
    ticker: "CJ1",
    change: "+10.0%",
    render: aircraft3,
  },
];

function Signals() {
  const sectionRef = useRef(null);

  // Arrives once, on the first time it is scrolled to, and stays arrived —
  // the observer disconnects on that crossing, so coming back up the page
  // finds it already there. Armed from here rather than from the stylesheet
  // so a reader whose JavaScript never ran is not left with a blank band.
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
      { threshold: REVEAL_AT },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="signals" id="signals" ref={sectionRef}>
      {/* The waveform the Signals product card runs, given the whole width.
          It is a band rather than the full section: the design leaves black
          above the type and below the cards, and the band's height is what
          sets the wave's amplitude. */}
      <div className="signals__wave" aria-hidden="true">
        <SonicWaveform className="signals__wave-canvas sonic-waveform" />
      </div>

      <div className="signals__inner">
        <header className="signals__head">
          <p className="signals__eyebrow">SIGNALS</p>

          <h2 className="signals__title">
            {/* Two blocks rather than one line with a break, so the design's
                own break holds on a wide screen and the words run together
                normally once the column is too narrow for it. */}
            <span>You see the deal </span>
            <span>before the deal exists</span>
          </h2>

          <p className="signals__body">
            The industry average sits roughly 100 days behind origin by the time
            a tail surfaces on a portal, half the qualified buyers have already
            moved past it. bizav.ai Signals operates 10 to 30 days from origin.
            That&apos;s a 30 to 90 day window where the only people who know are
            the seller, their advisor, and you.
          </p>
        </header>

        <div className="signals__cards">
          {aircraft.map((tail, index) => (
            // The wrapper is what the arrival is put on: the card itself is
            // shared with the Terminal panel's hover preview, which has an
            // entrance of its own to keep.
            <div
              className="signals__card"
              style={{ "--signals-in": `${CARD_IN + index * CARD_STEP}ms` }}
              key={tail.ticker}
            >
              <AircraftCard {...tail} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Signals;
