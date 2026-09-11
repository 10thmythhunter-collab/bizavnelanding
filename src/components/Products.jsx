import { useEffect, useRef } from "react";
import burstInner from "../assets/burst-inner.svg";
import burstOuter from "../assets/burst-outer.svg";
import terminalShot from "../assets/product-terminal.png";
import ProductPreview from "./ProductPreview.jsx";
import ShaderBackground from "./ShaderBackground.jsx";
import SonicWaveform from "./SonicWaveform.jsx";
import UnicornEmbed from "./UnicornEmbed.jsx";
import "./Products.css";

// How far into the row has to be on screen before the cards come in. A share
// rather than a pixel count, so it reads the same on a phone as on a desktop.
const REVEAL_AT = 0.15;

// The heading is one sentence with the product name set bold inside it, so it
// is carried as three pieces rather than as markup repeated per card.
const products = [
  {
    key: "terminal",
    before: "Organize everything through the bizav.ai ",
    strong: "terminal",
    after: "",
    body: "This is not just a simple CRM, this spine of your everyday workflow. Terminal can speed up and automate majority of your tasks as a broker",
    image: terminalShot,
    // Sits over the card's own image, at the design's 74/103 inset.
    overlay: null,
  },
  {
    key: "aira",
    before: "",
    strong: "Aira",
    after: " agent always on, always briefed",
    body: "The first agentic AI for private jet sales. Aira does the research, drafting, and prep so your brokers can sell.",
    image: null,
    shader: true,
    // Sits on the shader the way the burst PNG did: the scene paints only
    // the logo and stays transparent around it, so the panel behind still
    // shows through.
    scene: "PgSnHHrpAUlw55P5oWco",
  },
  {
    key: "signals",
    before: "",
    strong: "Signals",
    after: " be first to get offer for an aircraft",
    body: "Pre-market intelligence aircraft that may come up for sale, before they're listed.",
    // Black in the design, with the waveform inset over it.
    image: null,
    waveform: true,
    overlay: null,
  },
];

// The bar's Terminal link lands on the card row below rather than on this
// section's own top: Terminal is one of those three cards, and a jump that
// stopped at the section's header would leave the thing it was aimed at
// still below the fold.
function Products() {
  const listRef = useRef(null);

  // The cards come in when the row is scrolled to, and stay in: the
  // observer disconnects on the first crossing, so nothing re-plays on the
  // way back up. Only a reload starts it over.
  //
  // The hidden state is armed here rather than in the stylesheet, and the
  // attribute is written straight to the node rather than held in state:
  // armed from CSS alone, a reader whose JavaScript never ran would be left
  // with three invisible cards, and state here would only re-render the
  // section to set an attribute the DOM can carry itself.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    if (!("IntersectionObserver" in window)) {
      list.dataset.reveal = "done";
      return undefined;
    }

    list.dataset.reveal = "pending";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        list.dataset.reveal = "done";
        observer.disconnect();
      },
      { threshold: REVEAL_AT },
    );

    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="products">
      <header className="products__header">
        <p className="products__eyebrow">WHO ARE WE</p>

        {/* The burst, layered the way the design has it: an outer ring of
            rays and a shorter inner one, each its own export. */}
        <span className="products__mark" aria-hidden="true">
          <img className="products__mark-outer" src={burstOuter} alt="" />
          <img className="products__mark-inner" src={burstInner} alt="" />
        </span>

        <h2 className="products__title">
          {/* Broken where the design breaks it rather than wherever the
              measure runs out. */}
          <span>We simplify tasks in private </span>
          <span>broker business</span>
        </h2>

        <p className="products__lead">Bizav.ai products</p>
      </header>

      <ol className="products__list" id="terminal" ref={listRef}>
        {products.map(
          (
            {
              key,
              before,
              strong,
              after,
              body,
              image,
              shader,
              scene,
              waveform,
            },
            index,
          ) => (
            <li className="products__card" key={key}>
              <div className={`products__visual products__visual--${key}`}>
                {shader && <ShaderBackground className="products__shader" />}
                {waveform && (
                  <SonicWaveform className="products__waveform sonic-waveform" />
                )}
                {scene && (
                  <UnicornEmbed
                    className="products__scene"
                    projectId={scene}
                    // Percent rather than the scene's authored 1440x900: the
                    // panel is 442x523 in the design, fluid under it. 80%,
                    // because the scene sizes the logo against its own canvas
                    // — shrinking the canvas is what takes the logo down 20%,
                    // and it renders fewer pixels doing it than painting the
                    // full panel and scaling that down.
                    width="80%"
                    height="80%"
                    scale={1}
                    dpi={1.5}
                  />
                )}
                {image && <img className="products__shot" src={image} alt="" />}

                {/* The glass and the mockup drawn on it are one layer, held
                    at zero opacity until the card is hovered. Last in the
                    panel, so it sits over every visual above. */}
                <div className="products__preview">
                  <ProductPreview variant={key} />
                </div>
              </div>

              <div className="products__copy">
                <h3 className="products__name">
                  {/* The number is content, not a list marker: it has to sit
                    with the heading under the image, not beside the card. */}
                  <span className="products__index">{index + 1}.</span> {before}
                  <strong>{strong}</strong>
                  {after}
                </h3>

                <p className="products__body">{body}</p>
              </div>
            </li>
          ),
        )}
      </ol>
    </section>
  );
}

export default Products;
