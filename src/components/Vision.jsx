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
function Vision() {
  return (
    <section className="vision" id="vision">
      <header className="vision__head">
        <p className="vision__eyebrow">WHAT IS OUR FINAL GOAL</p>
        <h2 className="vision__title">Our vision</h2>
      </header>

      <div className="vision__group">
        <figure className="vision__panel">
          <img
            className="vision__panel-bg"
            src={officePhoto}
            alt=""
            loading="lazy"
          />
          <div className="vision__panel-veil" aria-hidden="true" />

          <blockquote className="vision__quote">
            <p>
              Every industry reaches a point where the old way stops being good
              enough. Aviation is there now. We&apos;re building the layer that
              sits between the way brokers work today and the way they&apos;ll
              work tomorrow — closer to the deal, further from the busywork. The
              details will change. The direction won&apos;t.
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
              <p className="vision__name">Asad Rahman</p>
              <p className="vision__role">Founder &amp; CEO of bizav.ai</p>
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
