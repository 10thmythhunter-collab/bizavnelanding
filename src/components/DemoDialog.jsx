import { useEffect, useId, useRef, useState } from "react";
import "./DemoDialog.css";

// The brokers bar's "Request a demo". Copy, fields and field order are the
// reference's own; everything else is this site's — a white panel, the same
// eyebrow/title/body ladder every section opener uses, the pill radii, and
// #3b82f6 on focus.
//
// A real <dialog> rather than a div with a high z-index: showModal() is what
// gives Escape, the focus ring staying inside the panel, the rest of the
// page going inert, and ::backdrop to blur it through — and it paints in the
// top layer, so the fixed nav cannot land on top of it.

// The reference shows only the placeholders for these two, so the options
// are ours. Bands rather than exact headcounts, and the types are the roles
// this market actually comes in.
const SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];

const TYPES = [
  "Brokerage",
  "Operator",
  "OEM",
  "Management company",
  "MRO",
  "Finance or leasing",
  "Other",
];

const FIELDS = [
  {
    name: "name",
    label: "Full name",
    type: "text",
    placeholder: "John Smith",
    autoComplete: "name",
  },
  {
    name: "email",
    label: "Email address",
    type: "email",
    placeholder: "john@company.com",
    autoComplete: "email",
  },
  {
    name: "company",
    label: "Company name",
    type: "text",
    placeholder: "Your company",
    autoComplete: "organization",
  },
];

function DemoDialog({ open, onClose }) {
  const ref = useRef(null);
  const ids = useId();
  const [sent, setSent] = useState(false);

  // showModal()/close() rather than an open attribute: only the method call
  // puts the dialog in the top layer and makes it modal.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      // showModal() lands on the first focusable thing it finds, which is
      // the close button — the one control nobody opened this to press.
      // The first field is where the next keystroke wants to go.
      el.querySelector("input, select")?.focus();
    }
    if (!open && el.open) el.close();
  }, [open]);

  // The page behind a modal dialog still scrolls on its own, and the bar
  // above reads scroll position — so a wheel over the backdrop would move
  // the page under the panel. The padding is the scrollbar's width, put
  // back so locking it does not shift the page sideways.
  useEffect(() => {
    if (!open) return undefined;
    const { body, documentElement: html } = document;
    const gutter = window.innerWidth - html.clientWidth;
    const overflow = body.style.overflow;
    const padding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;
    return () => {
      body.style.overflow = overflow;
      body.style.paddingRight = padding;
    };
  }, [open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Nothing to post to yet — the panel confirms and holds the answer
    // until there is an endpoint (or a form service) to hand it to. Wire
    // this one call and the rest of the flow is already here.
    setSent(true);
  };

  const close = () => {
    onClose();
    // Reset behind the fade so a second open starts on the form rather than
    // on the last answer's receipt.
    window.setTimeout(() => setSent(false), 200);
  };

  return (
    <dialog
      className="demo"
      ref={ref}
      aria-labelledby={`${ids}-title`}
      aria-describedby={`${ids}-body`}
      // Escape and the backdrop both come back as the dialog's own events,
      // so the state that opened it is what closes it either way.
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === ref.current) close();
      }}
    >
      <div className="demo__panel">
        <button
          className="demo__close"
          type="button"
          onClick={close}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              d="M6 6 18 18M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <p className="demo__eyebrow">REGISTER INTEREST</p>
        <h2 className="demo__title" id={`${ids}-title`}>
          Discuss your enterprise solution
        </h2>
        <p className="demo__body" id={`${ids}-body`}>
          A 30-minute walkthrough on your own market. Pick the OEM, pick the
          cohort.
        </p>

        {sent ? (
          <div className="demo__done" role="status">
            <p className="demo__done-line">Thanks — that&apos;s with us.</p>
            <p className="demo__done-note">
              We&apos;ll come back to you at the address you left, inside a
              working day, with a time to walk through your own market.
            </p>
            <button className="demo__submit" type="button" onClick={close}>
              Close
            </button>
          </div>
        ) : (
          <form className="demo__form" onSubmit={handleSubmit}>
            {FIELDS.map(({ name, label, type, placeholder, autoComplete }) => (
              <div className="demo__field" key={name}>
                <label className="demo__label" htmlFor={`${ids}-${name}`}>
                  {label} <span aria-hidden="true">*</span>
                </label>
                <input
                  className="demo__input"
                  id={`${ids}-${name}`}
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  required
                />
              </div>
            ))}

            {/* The reference puts these two on one row, and they are the
                only pair short enough to take it. */}
            <div className="demo__row">
              {[
                {
                  name: "size",
                  label: "Company size",
                  hint: "Select size",
                  options: SIZES,
                },
                {
                  name: "type",
                  label: "Company type",
                  hint: "Select type",
                  options: TYPES,
                },
              ].map(({ name, label, hint, options }) => (
                <div className="demo__field" key={name}>
                  <label className="demo__label" htmlFor={`${ids}-${name}`}>
                    {label} <span aria-hidden="true">*</span>
                  </label>
                  <div className="demo__select">
                    <select
                      className="demo__input"
                      id={`${ids}-${name}`}
                      name={name}
                      defaultValue=""
                      required
                    >
                      {/* Empty and disabled, so required catches it rather
                          than the first real option being a silent default. */}
                      <option value="" disabled>
                        {hint}
                      </option>
                      {options.map((option) => (
                        <option value={option} key={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="demo__chevron"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        d="m6 9 6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            <button className="demo__submit" type="submit">
              Submit
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}

export default DemoDialog;
