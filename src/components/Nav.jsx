import { useEffect, useId, useRef, useState } from "react";
import downloadIcon from "../assets/download-icon.svg";
import ownersLogo from "../assets/ownersLogo.svg";
import { HERO_INTRO_END } from "../timeline.js";
import "./Nav.css";

// Every section dark enough that a white bar sitting on it would clash —
// the glass treatment the hero already had, now given back whenever the bar
// is over any of these rather than only above the fold.
const DARK_SECTIONS = ".hero, .aira, .signals";

// Split from the rest of the nav because the annotation below brackets
// exactly these three — the bracket takes its width from the sub-list.
const productLinks = [
  { label: "Terminal", href: "#terminal" },
  { label: "Aira", href: "#aira" },
  { label: "Signals", href: "#signals" },
];

// Named after the section it goes to, which calls itself "Our vision" —
// "About us" was pointing at nothing in particular under a heading that
// does not exist on the page.
const links = [{ label: "Our vision", href: "#vision" }];

// Node 215:21303's own bar — a different logo, a different set of links, and
// the same white download pill the Owners hero carries, in place of the
// black "Request a demo" fill.
// In the order the page runs, which is why "Who's it for?" is last: its
// section sits past the Aira one. Each href is the id on the section it
// names — see the scroll-margin block in index.css for the offset that
// keeps the landing clear of this bar.
const ownersLinks = [
  { label: "What is Owners app", href: "#owners-about" },
  { label: "How Owners app works?", href: "#owners-how" },
  { label: "AIRA in Owners app", href: "#owners-aira" },
  { label: "Who's it for?", href: "#owners-audience" },
];

// The design's own polygon, kept verbatim and translated into a box of its
// own: in the file it sits at its place inside the 215-wide annotation group,
// and it already points down, so there is nothing to rotate.
const ARROW_PATH =
  "M108.779 39.7291C108.441 40.559 107.266 40.559 106.927 39.7291L104.133 32.8776C103.865 32.2198 104.349 31.5 105.059 31.5L110.647 31.5C111.357 31.5 111.841 32.2198 111.573 32.8776L108.779 39.7291Z";

// Where the link row folds into the button below it. Stated here as well as
// in Nav.css because the bar has to know when a menu it opened stopped
// being a menu — keep the two in step.
const MENU_BREAKPOINT = 720;

// onRequestDemo opens the panel behind the brokers' CTA. The panel itself
// lives in App, not here: this bar carries a backdrop-filter, and a dialog
// rendered inside a filtered subtree can inherit that blur in some engines
// even from the top layer.
function Nav({ audience, onRequestDemo }) {
  const barRef = useRef(null);
  const menuId = useId();
  // Narrow bars only: past MENU_BREAKPOINT the same list is the row again
  // and this does nothing. One list either way — the links are anchors into
  // the page, and a second copy of them in a separate panel would put two
  // of each in the document.
  const [menuOpen, setMenuOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  // True only at the very top of the page — the bar is transparent here,
  // and glass from the first pixel of scroll on. <= rather than === 0:
  // iOS's overscroll bounce can carry scrollY negative for a moment, which
  // is still the top as far as this is concerned.
  const [atTop, setAtTop] = useState(true);
  // Latched on purpose, and never set back: the annotation is an intro
  // flourish, and one that came back every time you returned to the top
  // would read as a bug rather than as a welcome.
  const [unscrolled, setUnscrolled] = useState(true);

  const isOwners = audience === "Owners";

  useEffect(() => {
    const darkEls = Array.from(document.querySelectorAll(DARK_SECTIONS));
    let darkRanges = [];

    // Each dark section's own [top, bottom) in document coordinates —
    // measured rather than guessed at, because the hero is a viewport tall
    // and so its height is whatever the window is. Cached: reading it per
    // scroll event would force a layout on every one of them.
    const measure = () => {
      darkRanges = darkEls.map((el) => ({
        top: el.offsetTop,
        bottom: el.offsetTop + el.offsetHeight,
      }));
    };

    // Read once before listening too: a reload partway down the page has to
    // start in whichever state it lands in — solid, and without the
    // annotation, past the hero — rather than wait for the first scroll to
    // catch up.
    const read = () => {
      const bar = barRef.current;
      const barHeight = bar ? bar.offsetHeight : 0;
      const y = window.scrollY;
      // The bar covers the document span [y, y + barHeight]; solid is
      // "clear of every dark section", so it holds only where that span
      // touches none of them.
      const overDark = darkRanges.some(
        (r) => y + barHeight > r.top && y < r.bottom,
      );
      setSolid(!overDark);
      setAtTop(y <= 0);
      if (y > 0) setUnscrolled(false);
    };

    const remeasure = () => {
      measure();
      read();
    };

    measure();
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", remeasure);
    // The hero is sized in svh, which moves when a mobile browser's own
    // chrome collapses without firing resize on every platform; the others
    // can change height as their own content loads in.
    const observer = darkEls.length > 0 ? new ResizeObserver(remeasure) : null;
    darkEls.forEach((el) => observer?.observe(el));

    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", remeasure);
      observer?.disconnect();
    };
  }, []);

  // Escape, and a press anywhere off the bar. Bound only while the menu is
  // open, so a closed bar listens for nothing. pointerdown rather than
  // click: it fires before the press can act on whatever is underneath.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onPointerDown = (event) => {
      if (!barRef.current?.contains(event.target)) setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  // Widened past the breakpoint with the menu open: the list is the bar's
  // own row again, so the open state has nothing left to describe. Reset it
  // rather than leave the button reporting aria-expanded on a row that is
  // simply there.
  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MENU_BREAKPOINT}px)`);
    const sync = () => {
      if (!query.matches) setMenuOpen(false);
    };
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    // Every colour in the bar comes off one flag — see the blocks of custom
    // properties at the top of Nav.css. The two are mutually exclusive by
    // construction: solid only ever goes true well past the top.
    <header
      className="nav"
      ref={barRef}
      data-solid={solid ? "" : undefined}
      data-top={!solid && atTop ? "" : undefined}
    >
      <nav className="nav__bar">
        {/* Left: the wordmark, out of the way of the link row now that the
            row takes the centre column — see the grid on .nav__bar. Owners
            gets its own lockup, which is a different shape (194x46 against
            the default's 106x33) — both custom properties on the mark
            below, so nothing here has to branch on width or ratio. */}
        <a className="nav__logo" href="/" aria-label="bizav.ai home">
          {/* Masked rather than an <img>: the file has a white fill baked in,
              and the wordmark has to go black on the solid bar. The link
              above carries the name, so this is decorative. */}
          <span
            className="nav__logo-mark"
            style={
              isOwners
                ? {
                    "--logo-mask": `url("${ownersLogo}")`,
                    "--logo-ratio": "194 / 46",
                  }
                : undefined
            }
            aria-hidden="true"
          />
        </a>

        {/* Centre: every link — dead-centre of the bar regardless of how
            wide the wordmark or the actions end up. Brokers keeps the
            products bracket and its own intro annotation; Owners has
            neither in the design, just its own three plain links. */}
        <ul
          className="nav__links"
          id={menuId}
          data-open={menuOpen ? "" : undefined}
          // Any link closes it: they all scroll the page underneath, and a
          // panel left open would cover what it just scrolled to.
          onClick={() => setMenuOpen(false)}
        >
          {isOwners ? (
            ownersLinks.map(({ label, href }) => (
              <li key={label}>
                <a className="nav__link" href={href}>
                  {label}
                </a>
              </li>
            ))
          ) : (
            <>
              <li className="nav__products">
                <ul className="nav__products-list">
                  {productLinks.map(({ label, href }) => (
                    <li key={label}>
                      <a className="nav__link" href={href}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>

                {/* Decorative: the three links it brackets already say
                        this. Only while the page has not moved — unmounted
                        rather than hidden, so a scroll mid-draw takes the
                        whole sequence with it instead of leaving it running
                        out of sight. */}
                {unscrolled && (
                  <span
                    className="nav__annotation"
                    // Every step below is offset from here, so the whole
                    // sequence waits for the hero's chips to finish
                    // retracting.
                    style={{
                      "--annotation-start": `${HERO_INTRO_END}ms`,
                    }}
                    aria-hidden="true"
                  >
                    <svg
                      className="nav__annotation-bracket"
                      viewBox="0 0 215 32"
                      preserveAspectRatio="none"
                      focusable="false"
                    >
                      {/* Drawn from the left stub, across, then up the
                              right one — which is what makes the dash sweep
                              read left to right. */}
                      <path d="M0.5 0V32H214.5V0" pathLength="100" />
                    </svg>

                    <svg
                      className="nav__annotation-arrow"
                      viewBox="0 0 7.976 9.059"
                      focusable="false"
                    >
                      <path
                        d={ARROW_PATH}
                        transform="translate(-103.865 -31.5)"
                      />
                    </svg>

                    <span className="nav__annotation-label">
                      Bizav.ai products
                    </span>
                  </span>
                )}
              </li>

              {links.map(({ label, href }) => (
                <li key={label}>
                  <a className="nav__link" href={href}>
                    {label}
                  </a>
                </li>
              ))}
            </>
          )}
        </ul>

        {/* Right: Brokers gets the plain sign-in-style "Request a demo"
            fill; Owners gets the same white download pill the hero's own
            CTA uses, since the design draws the two bars with different
            calls to action rather than one relabelled. */}
        <div className="nav__actions">
          {isOwners ? (
            <button className="nav__download" type="button">
              <span className="nav__download-dot" aria-hidden="true" />
              <img className="nav__download-icon" src={downloadIcon} alt="" />
              {/* The design's own copy, typo included — kept as authored,
                  the way the hero's matching button already is. */}
              Dowanload now
            </button>
          ) : (
            <button className="nav__cta" type="button" onClick={onRequestDemo}>
              Request a demo
              {/* The label again, this time on the black ground, so the two
                  reveal as one layer — see Nav.css. Hidden from the
                  accessibility tree, which already has the copy above. */}
              <span className="nav__cta-fill" aria-hidden="true">
                Request a demo
              </span>
            </button>
          )}

          {/* Only below MENU_BREAKPOINT — see Nav.css. The bars are
              decorative; the label is what says what this does, and it
              changes with the state so a screen reader hears the action
              rather than the noun. */}
          <button
            className="nav__burger"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="nav__burger-bar" aria-hidden="true" />
            <span className="nav__burger-bar" aria-hidden="true" />
            <span className="nav__burger-bar" aria-hidden="true" />
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Nav;
