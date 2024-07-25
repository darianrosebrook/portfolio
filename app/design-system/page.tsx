import SvgSprite from "./svgSprite";
import Blueprints from "./heroes/blueprints";
import Style from "./page.module.css";
import Swatches from "./heroes/swatches";
export default function Page() {

  return (
    <>
      <SvgSprite />
      <section className={Style.hero}>
        <div className={Style.heroImage}>
          <div className="backdropContainer">
            <Blueprints />
          </div>
        </div>
        <div className={Style.headingHero}>
          <h1 className="gooey">
            <span>Design System Database</span>
            <br />
            <span>Design Systems</span>
          </h1>
        </div>
      </section>
      <section className={Style.hero+ ' primitives'}>
        <h2 className="gooey"><span>
          Design System Primitives
        </span>
        </h2>
        <div className={Style.heroImage }>
          <div className="backdropContainer "> 
            <Swatches />
          </div>
        </div>
      </section>
      <section className={Style.hero}>
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
