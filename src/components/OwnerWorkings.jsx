import ShaderBackground from "./ShaderBackground.jsx";
import phone1 from "../assets/owner/workings-phone-1-v2.png";
import phone2 from "../assets/owner/workings-phone-2-v2.png";
import phone3 from "../assets/owner/workings-phone-3-v2.png";
import "./OwnerWorkings.css";

// Node 215:21303's "WORKINGS" section — a plain light header, the same
// shape every other section opener on the page uses, followed by three
// cards of the design's own 442×523 box. The design gives each card its
// own still gradient as a background; asked to carry Aira's own animated
// shader there instead, so each card gets its own instance rather than the
// still. The phones themselves are full mockup renders provided directly
// (not cropped exports off the design's own overlapping node), sized to
// land in roughly the same box the design's own crop did.
//
// The design repeats the problem section's own body line here rather than
// giving this one its own — left as authored, the way this project leaves
// the rest of the design's slips rather than silently rewriting its copy.
//
// The step each card illustrates travels with it rather than in a row of
// its own below: the design draws two rows because at that width they line
// up either way, but a row of cards and a row of captions stack as three
// cards and then three captions, which reads as two lists rather than
// three steps. One card and its own words per cell keeps the pairs
// together whatever the row does.
//
// One shader three times over, but not three times the same: each card
// gets its own seed and its own head start, so the row reads as three
// backgrounds rather than one animation playing in triplicate. The phases
// are thirds of the pattern's own ~64s cycle — see ShaderBackground.jsx —
// which is what puts each card at a different point in it at any moment.
const steps = [
  {
    phone: phone1,
    seed: 1170,
    phase: 0,
    title: "Add your aircraft or your mission",
    body: "Number and a few details for owners. A short profile for buyers.",
  },
  {
    phone: phone2,
    seed: 402,
    phase: 21.5,
    title: "Get your numbers",
    body: "A valuation with the comparable behind it, or a shortlist scored against your mission.",
  },
  {
    phone: phone3,
    seed: 913,
    phase: 43,
    title: "Decide, with the assistant alongside you",
    body: "Hold, list, upgrade, or keep watching. Nothing is locked in and nothing is public until you say so.",
  },
];

function OwnerWorkings() {
  return (
    <section className="owner-workings" id="owners-how">
      <div className="owner-workings__head">
        <p className="owner-workings__eyebrow">WORKINGS</p>
        <h2 className="owner-workings__title">How Owners work</h2>
      </div>

      <ol className="owner-workings__cards">
        {steps.map(({ phone, seed, phase, title, body }, index) => (
          <li className="owner-workings__step" key={phone}>
            <div className="owner-workings__card">
              <div className="owner-workings__card-bg" aria-hidden="true">
                <ShaderBackground
                  className="owner-workings__card-shader"
                  seed={seed}
                  phase={phase}
                />
                <div className="owner-workings__card-veil" />
              </div>
              <img
                className="owner-workings__card-phone"
                src={phone}
                alt=""
                loading="lazy"
              />
            </div>

            <div className="owner-workings__copy">
              {/* The design numbers the third item inline in its own
                  paragraph rather than with the list the first two use — a
                  slip rather than an intention, so all three are numbered
                  the one way here. */}
              <p className="owner-workings__step-title">
                <span className="owner-workings__step-number">
                  {index + 1}.
                </span>{" "}
                {title}
              </p>
              <p className="owner-workings__step-body">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default OwnerWorkings;
