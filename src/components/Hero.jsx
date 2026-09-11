import { useEffect, useRef, useState } from "react";
import airaIcon from "../assets/aira.png";
import downloadIcon from "../assets/download-icon.svg";
import heroPoster from "../assets/hero-skyline.jpg";
import keyIcon from "../assets/key-icon.svg";
import ownersVideo from "../assets/ownersapp.mp4";
import terminalIcon from "../assets/terminal-mini.svg";
import userTieIcon from "../assets/user-tie-icon.svg";
import heroVideo from "../assets/video.mp4";
import waveIcon from "../assets/wave.svg";
import { RETRACT_AT, RETRACT_MS, STEP_MS } from "../timeline.js";
import "./Hero.css";

const products = [
  {
    name: "Terminal",
    icon: terminalIcon,
    color: "#a3e635",
    iconScale: "1.1875em",
  },
  { name: "Aira", icon: airaIcon, color: "#a9acf9", iconScale: "1.3em" },
  { name: "Signals", icon: waveIcon, color: "#ffffff", iconScale: "1.3em" },
];

// The two icons are masked rather than dropped in as <img>, so one file each
// covers both states — the glyph takes its colour from the option it sits in,
// which flips from white-on-glass to near-black-on-white when selected.
const audiences = [
  { name: "Brokers", icon: userTieIcon, iconSize: "18px" },
  { name: "Owners", icon: keyIcon, iconSize: "16px" },
];

const stats = [
  { value: "1.5B", label: "Datapoints" },
  { value: "4", label: "Modules" },
  { value: "Global", label: "Coverage" },
  { value: "20+", label: "Pre-registered firms" },
];

function ProductBadge({ product }) {
  return (
    <>
      <img
        className="hero__pill-icon"
        style={{ "--pill-icon-scale": product.iconScale }}
        src={product.icon}
        alt=""
      />
      <span className="hero__pill-label" style={{ color: product.color }}>
        {product.name}
      </span>
    </>
  );
}

function Hero({ audience, onAudienceChange }) {
  const listRef = useRef(null);
  const [offsets, setOffsets] = useState(null);
  const [phase, setPhase] = useState("intro");
  const [active, setActive] = useState(0);
  // The owners video is the one thing here heavy enough to matter: no sense
  // decoding a second stream for everyone who never touches the switch, so
  // it mounts on the first switch to Owners and simply stays mounted after
  // that — the same trade the pricing scenes make lower on the page. Armed
  // from the switch's own click handler below rather than an effect
  // watching the prop, since the click is already the event that decides it.
  // Latched on the first switch and never cleared: the intro below is the
  // page's own arrival, and it is keyed off whichever panel is active — so
  // without this it plays again every time the audience changes, with the
  // incoming copy rising through the cross-fade while the outgoing copy
  // snaps back as its animation is taken off it.
  const [switched, setSwitched] = useState(false);

  const [ownersVideoArmed, setOwnersVideoArmed] = useState(
    audience === "Owners",
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const toRetract = setTimeout(() => {
      // Measured here rather than on mount so a resize during the intro can't
      // leave the chips travelling to a stale position. offsetLeft is
      // layout-based, so the entrance transforms don't skew it.
      const chips = Array.from(listRef.current.children);
      const base = chips[0].offsetLeft;
      setOffsets(chips.map((chip) => base - chip.offsetLeft));
      setPhase("retract");
    }, RETRACT_AT);

    const toCarousel = setTimeout(
      () => setPhase("carousel"),
      RETRACT_AT + RETRACT_MS,
    );

    return () => {
      clearTimeout(toRetract);
      clearTimeout(toCarousel);
    };
  }, []);

  useEffect(() => {
    if (phase !== "carousel") return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % products.length),
      STEP_MS,
    );
    return () => clearInterval(id);
  }, [phase]);

  // Where each product sits in the vertical strip: the outgoing one drops out
  // the bottom, everything else waits above.
  const slotOf = (index) => {
    if (index === active) return "current";
    if (index === (active - 1 + products.length) % products.length) {
      return "below";
    }
    return "above";
  };

  const isBrokers = audience === "Brokers";

  return (
    <section className="hero" data-switched={switched ? "" : undefined}>
      <div className="hero__media" aria-hidden="true">
        {/* Both videos stay mounted (once Owners has armed its own) and
            simply swap which one is opaque — a crossfade between two decoded
            streams rather than one <video> reloading a new src, which would
            drop a frame to black mid-switch. */}
        <video
          className="hero__video"
          data-active={isBrokers ? "" : undefined}
          src={heroVideo}
          poster={heroPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        {ownersVideoArmed && (
          <video
            className="hero__video"
            data-active={isBrokers ? undefined : ""}
            src={ownersVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        )}
        <div className="hero__overlay" />
      </div>

      <div className="hero__content">
        <div className="hero__switch" role="group" aria-label="Audience">
          {audiences.map(({ name, icon, iconSize }) => (
            <button
              className="hero__switch-option"
              type="button"
              key={name}
              aria-pressed={name === audience}
              onClick={() => {
                setSwitched(true);
                if (name === "Owners") setOwnersVideoArmed(true);
                onAudienceChange(name);
              }}
            >
              {/* Always in the flow rather than mounted only on the selected
                  option: conditional mounting took its 4px plus the row's
                  own gap with it, so the option a click landed on visibly
                  grew a beat after its background did. Rendering it on both
                  and fading it in CSS keeps both buttons the same width
                  throughout, which is what makes the switch itself read as
                  one smooth move rather than a resize plus a fade. */}
              <span
                className="hero__switch-dot"
                data-active={name === audience ? "" : undefined}
                aria-hidden="true"
              />
              <span
                className="hero__switch-icon"
                style={{
                  // Quoted: the build inlines these two files as data URIs,
                  // and the single quotes inside one are illegal in a bare
                  // url() token.
                  "--switch-icon": `url("${icon}")`,
                  "--switch-icon-size": iconSize,
                }}
                aria-hidden="true"
              />
              {name}
            </button>
          ))}
        </div>

        {/* Both panels share one grid cell — see Hero.css — so the stage's
            own height follows whichever is taller instead of snapping when
            Owners' shorter content takes over, and the switch above never
            moves regardless of which panel is live. */}
        <div className="hero__stage">
          <div
            className="hero__panel"
            data-active={isBrokers ? "" : undefined}
            aria-hidden={isBrokers ? undefined : "true"}
            inert={!isBrokers}
          >
            <h1 className="hero__title">
              {/* The trailing space is the design's own and it has to
                  survive: below 700px these two go inline, and without it
                  the line reads "aviationworkflow". */}
              <span>Every private aviation </span>
              <span>workflow now on one platform</span>
            </h1>

            <div className="hero__subtitle">
              <p className="hero__subtitle-text">
                Do more in one day than what was needed in a week before with
              </p>

              <ul
                className={`hero__products hero__products--${phase}`}
                ref={listRef}
              >
                {products.map((product, index) => (
                  <li
                    className="hero__pill"
                    key={product.name}
                    style={
                      offsets
                        ? { "--retract-x": `${offsets[index]}px` }
                        : undefined
                    }
                    // The trailing chips exist only for the intro. The
                    // carousel in the first chip keeps all three names in
                    // the accessibility tree, so hiding these avoids reading
                    // each product twice.
                    aria-hidden={index > 0 ? true : undefined}
                  >
                    {index === 0 ? (
                      <span className="hero__carousel">
                        {products.map((item, itemIndex) => (
                          <span
                            className="hero__carousel-item"
                            key={item.name}
                            data-slot={slotOf(itemIndex)}
                          >
                            <ProductBadge product={item} />
                          </span>
                        ))}
                      </span>
                    ) : (
                      <ProductBadge product={product} />
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <ul className="hero__stats">
              {stats.map((stat) => (
                <li className="hero__stat" key={stat.label}>
                  <span className="hero__stat-value">{stat.value}</span>
                  <span className="hero__stat-label">{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="hero__panel"
            data-active={isBrokers ? undefined : ""}
            aria-hidden={isBrokers ? "true" : undefined}
            inert={isBrokers}
          >
            <h1 className="hero__title">
              <span>Know what your aircraft </span>
              <span>is worth. Always</span>
            </h1>

            <div className="hero__subtitle">
              {/* The design's own line, typo included. */}
              <p className="hero__subtitle-text">
                Your aircraft is a asset. Track it like one
              </p>
            </div>

            <button className="hero__download" type="button">
              <span className="hero__download-dot" aria-hidden="true" />
              <img className="hero__download-icon" src={downloadIcon} alt="" />
              {/* The design's own copy, typo included — kept as authored,
                  the way this project leaves the rest of the design's own
                  slips rather than silently correcting its wording. */}
              Dowanload now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
