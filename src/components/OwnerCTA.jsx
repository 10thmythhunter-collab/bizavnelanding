import ctaPhoto from "../assets/owner/cta-jet.jpg";
import downloadIcon from "../assets/download-icon.svg";
import "./OwnerCTA.css";

// Node 215:21794's closing banner — not the full-bleed shader panel this
// carried before: the design draws it as a rounded card inset from the page,
// over a photograph of its own, with a dark wash that blurs the photograph
// rather than just dimming it. The white around the card is the page's own.
//
// The subtitle is the design's own — the same line the last "who it's for"
// card carries, repeated here rather than a fresh one written for the
// banner. Left as authored.
function OwnerCTA() {
  return (
    <section className="owner-cta">
      <div className="owner-cta__card">
        <img
          className="owner-cta__photo"
          src={ctaPhoto}
          alt=""
          loading="lazy"
        />

        {/* The design's own rgba(0,0,0,0.38) over a 10px blur. The blur
            belongs to this layer rather than to the photograph, which is
            what keeps the card's own edges crisp inside its radius: a
            filter on the image itself would sample the transparency past
            its bounds and fade them. */}
        <div className="owner-cta__veil" aria-hidden="true" />

        <div className="owner-cta__content">
          <h2 className="owner-cta__title">Ready to start?</h2>
          <p className="owner-cta__body">
            tracking a fleet&apos;s book value over time
          </p>

          <button className="owner-cta__download" type="button">
            <span className="owner-cta__download-dot" aria-hidden="true" />
            <img
              className="owner-cta__download-icon"
              src={downloadIcon}
              alt=""
            />
            Dowanload now
          </button>
        </div>
      </div>
    </section>
  );
}

export default OwnerCTA;
