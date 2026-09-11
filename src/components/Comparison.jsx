import lockup from "../assets/bizavLockup.svg";
import checkIcon from "../assets/circle-check-icon.svg";
import crossIcon from "../assets/x-icon.svg";
import "./Comparison.css";

const todayItems = [
  "Call around to find out who might be selling",
  "Re-key the same aircraft into three systems",
  "Build the spec sheet by hand, in PowerPoint",
  "Chase signatures across email, WhatsApp and fax",
  "Learn a tail is for sale when it hits the portal",
  "Spend the week on prep instead of on the client",
];

const bizavItems = [
  "Signals surfaces owner intent 30–90 days before it lists",
  "One record per tail, kept current across the platform",
  "Spec, comps and a valuation range drafted in minutes",
  "Documents, tasks and approvals tracked in Terminal",
  "You approach the owner before the market knows",
  "Your week goes back to selling",
];

function Items({ items, icon }) {
  return (
    <ul className="comparison__items">
      {items.map((item) => (
        <li className="comparison__item" key={item}>
          {/* The marker is the panel's own — a cross or a circled check —
              and says nothing the copy beside it doesn't. */}
          <img className="comparison__icon" src={icon} alt="" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Comparison() {
  return (
    <section className="comparison">
      <div className="comparison__inner">
        <header className="comparison__header">
          <p className="comparison__eyebrow">THE WAY IT WORKS TODAY</p>

          <h2 className="comparison__title">
            {/* Broken after the comma, where the design breaks it, rather
                than wherever the measure happens to run out. */}
            <span>A brokerage still runs on phone calls, </span>
            <span>spreadsheets and PDFs</span>
          </h2>

          {/* One paragraph, not the design's two hard-broken lines: the
              measure below reproduces that same break at the design width
              and keeps reflowing under it. */}
          <p className="comparison__lead">
            Not because brokers are slow. Because nobody built the tools for
            this. Here is where the week actually goes and what it looks like
            when an agent does it instead.
          </p>
        </header>

        <div className="comparison__panels">
          <div className="comparison__panel">
            <div className="comparison__panel-header">
              <h3 className="comparison__panel-name">Today</h3>
              <p className="comparison__panel-note">
                Manual, sequential, and dependent on who you happen to know.
              </p>
            </div>

            <Items items={todayItems} icon={crossIcon} />
          </div>

          <div className="comparison__panel comparison__panel--bizav">
            <div className="comparison__panel-header">
              <h3 className="comparison__panel-name">
                With
                {/* The wordmark carries the second half of the heading, so
                    the alt text has to be the word itself. */}
                <img
                  className="comparison__panel-logo"
                  src={lockup}
                  alt="bizav.ai"
                />
              </h3>
              <p className="comparison__panel-note">
                Agentic, continuous, and anchored to one record per tail.
              </p>
            </div>

            <Items items={bizavItems} icon={checkIcon} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Comparison;
