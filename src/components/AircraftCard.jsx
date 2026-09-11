import signalContactPool from "../assets/preview/signal-contact-pool.svg";
import signalGlow from "../assets/preview/signal-glow.svg";
import "./AircraftCard.css";

// The design's "Aircraft Card / Horizontal" — 360x112 in the Signals section
// and, at a tenth of the size, in the Terminal card's hover preview. The card
// is measured in em against one em per ten design pixels, so the only thing
// either caller sets is a font-size: 10px draws it at the design's own size,
// and the preview's cqw anchor shrinks the whole card with its panel.
//
// Width is left to the caller too — the preview stacks them in a column, the
// Signals section spreads them across a row.
function AircraftCard({ name, meta, ticker, change, render }) {
  return (
    <div className="tail">
      {/* The render, its glow and the contact dots are three layers pinned
          where the design pins them, so the plane sits on the light rather
          than beside it. */}
      <div className="tail__media">
        <img className="tail__glow" src={signalGlow} alt="" loading="lazy" />
        <img
          className="tail__pool"
          src={signalContactPool}
          alt=""
          loading="lazy"
        />
        <img className="tail__render" src={render} alt="" loading="lazy" />
      </div>

      <div className="tail__body">
        <span className="tail__name">{name}</span>
        <span className="tail__meta">{meta}</span>
        <span className="tail__figures">
          <span className="tail__ticker">{ticker}</span>
          <span className="tail__change">{change}</span>
        </span>
      </div>
    </div>
  );
}

export default AircraftCard;
