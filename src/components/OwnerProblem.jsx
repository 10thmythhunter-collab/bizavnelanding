import "./OwnerProblem.css";

// Node 215:21303, the section right under the Owners hero — a plain
// centred statement, the same shape every other eyebrow/title/body opener
// on the site already uses.
function OwnerProblem() {
  return (
    <section className="owner-problem">
      <p className="owner-problem__eyebrow">THE PROBLEM</p>
      <h2 className="owner-problem__title">
        Most owners find out what their aircraft is worth at the worst possible
        moment
      </h2>
      <p className="owner-problem__body">
        You learn the number when you&apos;ve already decided to sell
      </p>
    </section>
  );
}

export default OwnerProblem;
