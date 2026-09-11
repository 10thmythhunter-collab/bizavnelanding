import { useCallback, useEffect, useRef, useState } from "react";
import avatar1 from "../assets/testimonials/avatar-1.jpg";
import avatar2 from "../assets/testimonials/avatar-2.jpg";
import avatar3 from "../assets/testimonials/avatar-3.jpg";
import "./Testimonials.css";

// Rotates every 8 seconds — the user's own figure, not the design's, which
// only ever shows the first of the three.
const INTERVAL_MS = 8000;

// The first is the design's, verbatim — quote, name and company. The other
// two are invented to the same brief: short, direct, one sentence, from
// someone naming their own firm rather than a title.
const testimonials = [
  {
    quote:
      "I've been a Biazv.ai user from the early days and it's easily one of the most important pillars of our workflow.",
    name: "Mark Smith",
    company: "Jetcraft",
    avatar: avatar1,
  },
  {
    quote:
      "We stopped losing tails to brokers who just heard about them first. Signals changed that math entirely.",
    name: "Elena Torres",
    company: "Meridian Air Partners",
    avatar: avatar2,
  },
  {
    quote:
      "Aira drafts the outreach before I've finished my coffee. My desk closes more deals with the same three people.",
    name: "David Okafor",
    company: "Skyline Aviation Group",
    avatar: avatar3,
  },
];

function Testimonials() {
  const [active, setActive] = useState(0);
  const timer = useRef(null);
  const paused = useRef(false);

  const restart = useCallback(() => {
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      if (!paused.current) {
        setActive((i) => (i + 1) % testimonials.length);
      }
    }, INTERVAL_MS);
  }, []);

  useEffect(() => {
    restart();
    return () => window.clearInterval(timer.current);
  }, [restart]);

  // Hovering the card is what a reader does to actually read the words on
  // it — the rotation should not swap the quote out from under them mid
  // sentence. Pausing the interval rather than clearing it is what keeps a
  // resumed cycle predictable instead of restarting the full 8s on every
  // pointer wobble.
  const onPointerEnter = useCallback(() => {
    paused.current = true;
  }, []);
  const onPointerLeave = useCallback(() => {
    paused.current = false;
  }, []);

  // A clicked dot jumps straight there and gives that slide its own full
  // 8s, rather than landing mid-countdown toward whatever the timer had
  // already been counting down for the slide it replaced.
  const goTo = useCallback(
    (index) => {
      setActive(index);
      restart();
    },
    [restart],
  );

  return (
    <section
      className="testimonials"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <p className="testimonials__eyebrow">TESTEMONIALS</p>

      <div className="testimonials__stage">
        {testimonials.map(({ quote, name, company, avatar }, index) => (
          <figure
            className="testimonials__slide"
            data-active={index === active ? "" : undefined}
            aria-hidden={index === active ? undefined : "true"}
            key={name}
          >
            <blockquote className="testimonials__quote">
              <p>&quot;{quote}&quot;</p>
            </blockquote>
            <figcaption className="testimonials__byline">
              <img
                className="testimonials__avatar"
                src={avatar}
                alt=""
                loading="lazy"
              />
              <span className="testimonials__who">
                <span className="testimonials__name">{name}</span>
                <span className="testimonials__company">{company}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div
        className="testimonials__dots"
        role="tablist"
        aria-label="Testimonials"
      >
        {testimonials.map(({ name }, index) => (
          <button
            className="testimonials__dot"
            data-active={index === active ? "" : undefined}
            role="tab"
            aria-selected={index === active}
            aria-label={`Show testimonial ${index + 1} of ${testimonials.length}`}
            type="button"
            onClick={() => goTo(index)}
            key={name}
          />
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
