import airaAvatar from "../assets/preview/aira-avatar.png";
import aircraft1 from "../assets/preview/aircraft-1.png";
import aircraft2 from "../assets/preview/aircraft-2.png";
import aircraft3 from "../assets/preview/aircraft-3.png";
import chatDivider from "../assets/preview/chat-divider.svg";
import iconClients from "../assets/preview/icon-clients.svg";
import iconComms from "../assets/preview/icon-comms.svg";
import iconDashboard from "../assets/preview/icon-dashboard.svg";
import iconInventory from "../assets/preview/icon-inventory.svg";
import iconLeads from "../assets/preview/icon-leads.svg";
import iconMakeModel from "../assets/preview/icon-make-model.svg";
import iconMatching from "../assets/preview/icon-matching.svg";
import iconSparkle from "../assets/preview/icon-sparkle.svg";
import terminalLogo from "../assets/preview/terminal-logo.svg";
import AircraftCard from "./AircraftCard.jsx";
import "./ProductPreview.css";

// Every icon carries its own colour from the export — #B5B5B5 for the resting
// rows, #0C1A10 for the one on the lime tile — so none of them are masked.
const navRows = [
  { label: "Dashboard", icon: iconDashboard },
  { label: "Clients", icon: iconClients, active: true },
  { label: "Make/Model", icon: iconMakeModel },
  { label: "Inventory", icon: iconInventory },
  { label: "Comms", icon: iconComms },
  { label: "Leads", icon: iconLeads },
  { label: "Matching", icon: iconMatching },
];

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
    meta: "Heavy Tier 2 | 1 signals",
    ticker: "FAL",
    change: "+3.0%",
    render: aircraft2,
  },
  {
    name: "Citation CJ1",
    meta: "Heavy Tier 2 | 4 signals",
    ticker: "CJ1",
    change: "+2.0%",
    render: aircraft3,
  },
];

function TerminalMenu() {
  return (
    <div className="preview__panel preview__panel--menu">
      <div className="preview__menu-logo">
        <img src={terminalLogo} alt="" loading="lazy" />
      </div>

      <div className="preview__rule" />

      <div className="preview__toggle-wrap">
        <div className="preview__toggle">
          <div className="preview__seg preview__seg--on">Terminal</div>
          <div className="preview__seg">
            <img
              className="preview__seg-icon"
              src={iconSparkle}
              alt=""
              loading="lazy"
            />
            Aira
          </div>
        </div>
      </div>

      {navRows.map(({ label, icon, active }) => (
        <div
          className={`preview__row${active ? " preview__row--on" : ""}`}
          key={label}
        >
          {active ? (
            <span className="preview__row-tile">
              <img src={icon} alt="" loading="lazy" />
            </span>
          ) : (
            <img
              className="preview__row-icon"
              src={icon}
              alt=""
              loading="lazy"
            />
          )}
          {label}
        </div>
      ))}

      <div className="preview__rule preview__rule--foot" />
    </div>
  );
}

// The same exchange the full demo plays — an aircraft search, not a charter
// booking — cut to what fits a card this size: the type asked for, three
// tails that are actually on the market, and the one line of mission that
// turns the search over. See AiraChat.jsx for the whole thing.
function AiraChat() {
  return (
    <div className="preview__panel preview__panel--chat">
      <div className="preview__chat-head">
        <span className="preview__chat-who">
          <img
            className="preview__chat-avatar"
            src={airaAvatar}
            alt=""
            loading="lazy"
          />
          Aira
        </span>
        <span className="preview__chat-status">AI assistant · online</span>
      </div>

      <div className="preview__rule preview__rule--chat" />

      <p className="preview__bubble preview__bubble--user">
        Find me a Challenger 350.
      </p>

      <p className="preview__bubble preview__bubble--ai">
        Three on the market: a 2016 at 1,980 hours, $15.9M; a 2018 EASA tail,
        $18.4M; and one off-market at $14.2M. Want the full specs?
      </p>

      <img
        className="preview__chat-line"
        src={chatDivider}
        alt=""
        loading="lazy"
      />

      <span className="preview__chat-suggest">
        It&rsquo;ll mostly fly Nice&ndash;London
      </span>
    </div>
  );
}

function SignalCards() {
  return (
    <div className="preview__panel preview__panel--signals">
      {aircraft.map((tail) => (
        <AircraftCard {...tail} key={tail.ticker} />
      ))}
    </div>
  );
}

const variants = {
  terminal: TerminalMenu,
  aira: AiraChat,
  signals: SignalCards,
};

function ProductPreview({ variant }) {
  const Panel = variants[variant];
  if (!Panel) return null;

  // aria-hidden throughout: this is a picture of the product, and every word
  // in it is already said by the card's own heading and copy.
  return (
    <div className="preview" aria-hidden="true">
      <Panel />
    </div>
  );
}

export default ProductPreview;
