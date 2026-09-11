import lockup from "../assets/bizavLockup.svg";
import "./Footer.css";

// Node 215:21170 — the same "Homepage - Brokers" frame the last several
// sections came from, since re-edited into this footer. It replaces the
// richer newsletter/quick-links/socials footer this file shipped with
// before: that one was scaffolded from a generic reference (its own
// comments called out the address and phone number as placeholders,
// waiting on a real one), and this frame is that real one.
const legalLinks = [
  { label: "Privacy Policy", href: "#privacy" },
  { label: "Terms of Service", href: "#terms" },
  { label: "Support", href: "#support" },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <img className="footer__logo" src={lockup} alt="bizav.ai" />

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} bizav.ai · A Jetquity company
          </p>

          <nav className="footer__legal" aria-label="Legal">
            {legalLinks.map(({ label, href }) => (
              <a className="footer__link" href={href} key={label}>
                {label}
              </a>
            ))}
            {/* The design's own fourth item: an address rather than a page,
                so it is a mailto: rather than a match for the three links
                beside it. */}
            <a className="footer__link" href="mailto:support@bizav.ai">
              support@bizav.ai
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
