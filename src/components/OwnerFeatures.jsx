import appStoreBadge from "../assets/aira/app-store-badge.svg";
import phoneAsset from "../assets/owner-features-phone.png";
import "./OwnerFeatures.css";

const pills = ["Track", "Uprgrade", "Sell", "Buy"];

function OwnerFeatures() {
  return (
    <section className="owner-features" id="owners-about">
      <div className="owner-features__copy">
        <p className="owner-features__eyebrow">WHAT OWNERS DOES</p>

        <div className="owner-features__head">
          <h2 className="owner-features__title">
            One place for the whole ownership cycle
          </h2>
          <p className="owner-features__body">
            With <strong>Owners</strong> app you can tracks the live market
            value of your aircraft, shows you when it makes sense to sell or
            upgrade, and helps future owners find the aircraft that actually
            fits how they fly
          </p>
        </div>

        <ul className="owner-features__pills">
          {pills.map((label) => (
            <li className="owner-features__pill" key={label}>
              {label}
            </li>
          ))}
        </ul>

        <a
          className="owner-features__badge"
          href="#app-store"
          aria-label="Download on the App Store"
        >
          <img src={appStoreBadge} alt="" loading="lazy" />
        </a>
      </div>

      <img
        className="owner-features__phone"
        src={phoneAsset}
        alt=""
        loading="lazy"
      />
    </section>
  );
}

export default OwnerFeatures;
