import Style from "./page.module.css";
export default function Page() {
  return (
    <>
      <section className={Style.hero}>
        <h1 className="gooey">
          <span>Design System Database</span>
          <br />
          <span>Design Systems</span>
        </h1>
      </section>
      <section className="content">
        <h2>Design System Primitives</h2>
      </section>
      <section className="content">
        <h2>Component Blueprints</h2>
      </section>
      <section className="content">
        <h2>Design Patterns</h2>
      </section>
      <section className="content">
        <h2>Building your team</h2>
      </section>
      <section className="content">
        <h2>Building your design process</h2>
      </section>
    </>
  );
}
