import checkIcon from "../assets/pricing/check.svg";
import "./Pricing.css";

// Node 215:20884, in the frame the last few sections came from. Copied as
// authored — the blue accents, the pale-mint check circles, the grey body
// text are all the design's own, not this site's usual palette, but the
// user asked for the design as it is rather than a reinterpretation.
const plans = [
  {
    key: "growth",
    name: "Growth Plan",
    description:
      "Independents and small-mid firms scaling beyond spreadsheets.",
    cta: "Talk to sales",
    ctaVariant: "outline",
    includesLabel: "Includes:",
    items: [
      "Terminal · all seats",
      "Aira — your agentic analyst, on demand",
      "Signals — pre-market intent feeds, priced by tier",
    ],
  },
  {
    key: "in-house",
    // "In-House Plan", to the same pattern as the one beside it — the plan
    // named first, the word "Plan" after it.
    name: "In-House Plan",
    badge: "Most adopted",
    // Two sentences where the other card has one: who it is for, and then
    // what is actually being bought. The second is the whole difference
    // between this tier and the one beside it — at this price a firm is not
    // buying more seats, it is having its own AI and machine learning team
    // built — and nothing else on the card was saying it.
    description:
      "Large-mid and mega-brokers running institutional-grade workflow. At this tier we build your In-House AI and machine learning team.",
    cta: "Discuss your In-House solution",
    ctaVariant: "solid",
    includesLabel: "Everything, fully unlocked:",
    items: [
      // First in the list for the same reason: it is the reason for the
      // tier, not a line item under it.
      "An In-House AI and machine learning team, built with your desk and working only on it",
      "Terminal, Aira & Signals — unlimited seats, full run rate, all feed tiers bundled",
      "Custom development & intelligence — bespoke builds and research for your desk",
    ],
  },
];

function Pricing() {
  return (
    <section className="pricing">
      <header className="pricing__head">
        <p className="pricing__eyebrow">PRICING</p>
        <h2 className="pricing__title">Two ways to work with us</h2>
      </header>

      <div className="pricing__cards">
        {plans.map(
          ({
            key,
            name,
            badge,
            description,
            cta,
            ctaVariant,
            includesLabel,
            items,
          }) => (
            <div
              className="pricing__card"
              data-featured={key === "in-house" ? "" : undefined}
              key={key}
            >
              <div className="pricing__card-head">
                <div className="pricing__title-row">
                  <p className="pricing__plan">{name}</p>
                  {badge && <span className="pricing__badge">{badge}</span>}
                </div>
                <p className="pricing__description">{description}</p>
              </div>

              <div className="pricing__card-body">
                <button
                  className={`pricing__cta pricing__cta--${ctaVariant}`}
                  type="button"
                >
                  {cta}
                </button>

                <div className="pricing__includes">
                  <p className="pricing__includes-label">{includesLabel}</p>
                  <ul className="pricing__list">
                    {items.map((item) => (
                      <li className="pricing__item" key={item}>
                        <span className="pricing__check">
                          <img src={checkIcon} alt="" loading="lazy" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}

export default Pricing;
