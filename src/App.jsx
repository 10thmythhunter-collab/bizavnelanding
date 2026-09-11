import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Aira from "./components/Aira.jsx";
import Companies from "./components/Companies.jsx";
import Comparison from "./components/Comparison.jsx";
import DemoDialog from "./components/DemoDialog.jsx";
import Footer from "./components/Footer.jsx";
import Hero from "./components/Hero.jsx";
import Loading from "./components/Loading.jsx";
import Nav from "./components/Nav.jsx";
import OwnerAudience from "./components/OwnerAudience.jsx";
import OwnerCTA from "./components/OwnerCTA.jsx";
import OwnerFeatures from "./components/OwnerFeatures.jsx";
import OwnerProblem from "./components/OwnerProblem.jsx";
import OwnerWorkings from "./components/OwnerWorkings.jsx";
import Pricing from "./components/Pricing.jsx";
import Vision from "./components/Vision.jsx";
import Products from "./components/Products.jsx";
import SignalMetrics from "./components/SignalMetrics.jsx";
import WhyNotSubscription from "./components/WhyNotSubscription.jsx";
import Signals from "./components/Signals.jsx";
import Testimonials from "./components/Testimonials.jsx";

// The intro screen is off: the site paints straight away. Flip this back to
// true to restore it — nothing else has to change, the handover below just
// starts gated again instead of pre-satisfied.
const SHOW_LOADER = false;

// Matches .app__rest / .app__owners's own transition-duration in App.css.
const FADE_MS = 400;

// Now that there are two full pages stacked past the hero, whichever one is
// not showing has to leave the document's flow — left in it, its own height
// would either strand the visible page under a block of blank space (if it
// comes first) or leave a long scroll of nothing past the real content (if
// it comes last). display: none is what takes it out; the trick is not
// applying that the instant the audience changes, or the outgoing page
// would vanish before its own opacity fade ever played. This keeps a page
// in flow for exactly as long as its fade takes, on the way out, and drops
// it back in immediately, before the fade in, on the way in.
function useInFlow(active) {
  const [inFlow, setInFlow] = useState(active);

  useEffect(() => {
    if (active) {
      setInFlow(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setInFlow(false), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [active]);

  return inFlow;
}

function App() {
  // Two steps, not one: the site mounts when the loader is finished with the
  // screen, and the loader stays on top for its fade. Mounting any earlier
  // would run the hero's intro behind the loader, where nobody sees it.
  // With no loader, both start already past.
  const [siteReady, setSiteReady] = useState(!SHOW_LOADER);
  const [loaderGone, setLoaderGone] = useState(!SHOW_LOADER);

  const handleDone = useCallback(() => setSiteReady(true), []);
  const handleExited = useCallback(() => setLoaderGone(true), []);

  // Lifted out of Hero: switching to Owners is a Hero-only view for now, so
  // App has to see the choice too, to fade the rest of the page out rather
  // than Hero acting alone on state nothing else could reach.
  const [audience, setAudience] = useState("Brokers");
  const showRest = audience === "Brokers";

  // The brokers bar's "Request a demo" panel. Held here rather than in Nav
  // so it renders outside the bar's own filtered subtree, and outside both
  // audience blocks — neither of which should be able to hide it.
  const [demoOpen, setDemoOpen] = useState(false);

  const openDemo = useCallback(() => setDemoOpen(true), []);
  const closeDemo = useCallback(() => setDemoOpen(false), []);

  const restInFlow = useInFlow(showRest);
  const ownersInFlow = useInFlow(!showRest);

  return (
    <>
      {siteReady && (
        <>
          <Nav audience={audience} onRequestDemo={openDemo} />
          <Hero audience={audience} onAudienceChange={setAudience} />

          <DemoDialog open={demoOpen} onClose={closeDemo} />

          {/* Never torn down and rebuilt on the way back to Brokers — a
              remount would pop straight back in at full opacity with
              nothing to transition from. display: none is what actually
              takes it out of the page while Owners is showing (see
              useInFlow above); the opacity class underneath it is what
              fades it there first. */}
          <div
            className={`app__rest${showRest ? "" : " app__rest--hidden"}`}
            style={restInFlow ? undefined : { display: "none" }}
            aria-hidden={showRest ? undefined : "true"}
            inert={!showRest}
          >
            <Companies />
            <Comparison />
            <Products />
            <Aira />
            <Signals />
            <SignalMetrics />
            <WhyNotSubscription />
            <Pricing />
            <Vision />
            <Testimonials />
            <Footer />
          </div>

          <div
            className={`app__owners${showRest ? " app__owners--hidden" : ""}`}
            style={ownersInFlow ? undefined : { display: "none" }}
            aria-hidden={showRest ? "true" : undefined}
            inert={showRest}
          >
            <OwnerProblem />
            <OwnerFeatures />
            <OwnerWorkings />
            {/* The same Aira section the brokers get, stacked and centred
                the way node 215:21752 draws it — see the variant prop. */}
            <Aira variant="owners" />
            <OwnerAudience />
            <OwnerCTA />
            {/* The design gives this page the brokers' own footer now
                (node 225:21819 — the logo and one bottom bar), in place of
                the four-column one it used to draw here, so both pages
                render the one component. */}
            <Footer />
          </div>
        </>
      )}

      {SHOW_LOADER && !loaderGone && (
        <Loading onDone={handleDone} onExited={handleExited} />
      )}
    </>
  );
}

export default App;
