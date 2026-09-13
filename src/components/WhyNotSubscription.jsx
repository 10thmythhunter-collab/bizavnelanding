import badgeMinus from "../assets/why-not/badge-minus.svg";
import badgePlus from "../assets/why-not/badge-plus.svg";
import "./WhyNotSubscription.css";

// Node 205:19561's current content — the same frame the Signals timing
// metrics were built from earlier, since re-edited in Figma into this
// competitor table. The words below are the design's, verbatim, with one
// fix: two rows carry a double space where a dash reads as the only sense —
// "lists  or" and "Terminal  one record" — so those two get an em dash back
// rather than the blank the extraction dropped.
const rows = [
  {
    label: "What you get",
    competitor: "A searchable record of what already happened",
    bizav: "An agent that works the deal with you",
  },
  {
    label: "When you learn a tail is moving",
    competitor: "When it lists — or when someone calls you",
    bizav: "10–30 days from the owner’s intent",
  },
  {
    label: "Research",
    competitor: "You run the search, you read the results",
    bizav: "AIRA runs it and writes the brief",
  },
  {
    label: "Owner outreach",
    competitor: "You draft every note from scratch",
    bizav: "Drafted from the record, in your voice",
  },
  {
    label: "Spec and valuation",
    competitor: "Export it, then rebuild it by hand",
    bizav: "Generated, sourced and kept current",
  },
  {
    label: "Where the deal lives",
    competitor: "Your inbox and a spreadsheet",
    bizav: "Terminal — one record per tail",
  },
  {
    label: "What it replaces",
    competitor: "Nothing. It is another tab",
    bizav: "The phone-around, the re-keying, the paper file",
  },
];

function WhyNotSubscription() {
  return (
    <section className="why-not">
      <header className="why-not__head">
        <p className="why-not__eyebrow">WHY NOT JUST A DATA SUBSCRIPTION</p>
        <h2 className="why-not__title">
          <span>You already pay for outdated software</span>
          <span>None of it does the work</span>
        </h2>
        <p className="why-not__body">
          They are databases, and good ones. But a database hands you a record
          and stops. Finding the intent, qualifying it, drafting the approach,
          building the spec, moving the paper — all of that still lands on your
          desk.
        </p>
      </header>

      <div className="why-not__table" role="table">
        <div className="why-not__row why-not__row--head" role="row">
          <div
            className="why-not__cell why-not__cell--competitor"
            role="columnheader"
          >
            <span className="why-not__badge why-not__badge--minus">
              <img src={badgeMinus} alt="" loading="lazy" />
            </span>
            <p className="why-not__col-title">With current systems</p>
          </div>
          <div
            className="why-not__cell why-not__cell--bizav"
            role="columnheader"
          >
            <span className="why-not__badge why-not__badge--plus">
              <img src={badgePlus} alt="" loading="lazy" />
            </span>
            <p className="why-not__col-title">Your flow with Bizav.ai</p>
          </div>
        </div>

        {rows.map(({ label, competitor, bizav }) => (
          <div className="why-not__row" role="row" key={label}>
            <div
              className="why-not__cell why-not__cell--competitor"
              role="cell"
            >
              <p className="why-not__row-title why-not__row-title--competitor">
                {label}
              </p>
              <p className="why-not__row-note">{competitor}</p>
            </div>
            <div className="why-not__cell why-not__cell--bizav" role="cell">
              <p className="why-not__row-title why-not__row-title--bizav">
                {label}
              </p>
              <p className="why-not__row-note">{bizav}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WhyNotSubscription;
