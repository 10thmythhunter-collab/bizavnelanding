import "./OwnerAudience.css";

// Node 215:21303's "Who it's for?" row. The five cards share the design's
// own outline-card recipe — the same one the Signals timing metrics use
// above (border, radius, content pinned to the floor) — so this reuses that
// look rather than a fourth version of the same idea.
const audiences = [
  {
    title: "Owners",
    body: "who want to know where they stand without starting a sales process",
  },
  {
    title: "Owners ready to sell",
    body: "who want to price from data instead of instinct",
  },
  {
    title: "Owners considering an upgrade",
    body: "who need the trade-in and step-up numbers side by side",
  },
  {
    title: "First-time buyers",
    body: "who'd rather define the mission than guess at the model",
  },
  {
    title: "Flight departments and family offices",
    body: "tracking a fleet's book value over time",
  },
];

function OwnerAudience() {
  return (
    <section className="owner-audience" id="owners-audience">
      <header className="owner-audience__head">
        <h2 className="owner-audience__title">Who&apos;s it for?</h2>
        <p className="owner-audience__sub">Who will benefit from this app</p>
      </header>

      <ul className="owner-audience__list">
        {audiences.map(({ title, body }, index) => (
          <li className="owner-audience__card" key={title}>
            <div className="owner-audience__body">
              <p className="owner-audience__number">{index + 1}.</p>
              <p className="owner-audience__card-title">{title}</p>
              <p className="owner-audience__card-body">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default OwnerAudience;
