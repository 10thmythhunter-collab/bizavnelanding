import jetcraft from "../assets/jetcraftlogo.png";
import "./Companies.css";

// Four slots in the design, all filled with the same placeholder wordmark
// until the real logos land.
const companies = [
  { name: "Jetcraft", logo: jetcraft },
  { name: "Jetcraft", logo: jetcraft },
  { name: "Jetcraft", logo: jetcraft },
  { name: "Jetcraft", logo: jetcraft },
];

function Companies() {
  return (
    <section className="companies">
      <div className="companies__inner">
        <h2 className="companies__title">
          <span>Brokers at these companies</span>
          <span>cut workflow time by 40%</span>
        </h2>

        <ul className="companies__logos">
          {companies.map(({ name, logo }, index) => (
            <li key={index}>
              <img className="companies__logo" src={logo} alt={name} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Companies;
