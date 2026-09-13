import { useEffect, useRef } from "react";
import founderPhoto from "../assets/vision/founder.png";
import officePhoto from "../assets/vision/office.jpg";
import signature from "../assets/signature.png";
import "./Vision.css";

// Node 215:21286 — the design's own composition: a 297-wide photo card
// overlapping the left edge of a 986x579 quote panel, with the byline (name,
// role, signature) under the portrait.
//
// The two paragraphs are the design's, verbatim, with one fix: "work
// tomorrow  closer to the deal" carries a double space where a dash reads as
// the only sense — the same dropped-em-dash pattern already seen and fixed in
// the competitor table above — so it gets the dash back.
// How much of the section has to be on screen before it starts arriving.
const REVEAL_AT = 0.15;

function Vision() {
  const sectionRef = useRef(null);

  // Arrives once, the first time it is scrolled to, and stays arrived: the
  // observer disconnects on that crossing, so coming back up the page finds
  // it already there and only a reload plays it again.
  //
  // The hidden state is armed from here rather than from the stylesheet, and
  // written straight to the node rather than held in state: armed from CSS
  // alone, a reader whose JavaScript never ran would be left with an empty
  // panel, and state here would re-render the section to set an attribute the
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
      { threshold: REVEAL_AT },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="vision" id="vision" ref={sectionRef}>
      <header className="vision__head">
        <p className="vision__eyebrow">WHAT IS OUR FINAL GOAL</p>
        <h2 className="vision__title">Our vision</h2>
      </header>

      <div className="vision__group">
        <figure className="vision__panel">
          {/* Not lazy, alone among the photographs on this page. The
              arrival below holds this one clipped to nothing until its turn
              comes, and a browser will not spend bandwidth on a lazy image
              it is not going to paint — so it would still be loading when
              the wipe uncovered it, and what the wipe uncovered would be the
              veil over an empty box rather than a room. Low priority and
              async decoding keep it from competing with anything above it:
              it is fetched when there is room to, long before the reader
              arrives here. */}
          <img
            className="vision__panel-bg"
            src={officePhoto}
            alt=""
            fetchPriority="low"
            decoding="async"
          />
          <div className="vision__panel-veil" aria-hidden="true" />

          <blockquote className="vision__quote">
            <p>
              Every industry reaches a point where the old way stops being good
              enough. Private aviation is there now. We&apos;re building the
              layer that sits between the way brokers work today and the way
              they&apos;ll work tomorrow — closer to the deal, further from the
              busywork. “The details will change, the direction and the
              relationships won&apos;t.
            </p>
            <p>
              We believe the way this industry works is changing, and that the
              people who move first will define what comes next. We&apos;re
              building for that moment. Not for how things have always been
              done, but for how they&apos;re about to be.
            </p>
          </blockquote>

          {/* Inside the figure, which is where it has to live to be able to
              sit on the photograph once the two stop standing side by side:
              on wide screens it is lifted out to the panel's left, where the
              design has it, and below 950 it stays put as a caption under
              the quote. One copy either way — see Vision.css. */}
          <figcaption className="vision__card">
            <img
              className="vision__portrait"
              src={founderPhoto}
              alt="Asad Rahman"
              loading="lazy"
            />
            <div className="vision__byline">
              <p className="vision__name vision__byline-line">Asad Rahman</p>
              <p className="vision__role vision__byline-line">
                Founder &amp; CEO of bizav.ai
              </p>
              <img
                className="vision__signature"
                src={signature}
                alt=""
                loading="lazy"
              />
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export default Vision;
