import Status from "@/components/Status";
import styles from "./page.module.css"; 
import Avatar from "@/components/Avatar/avatar";
import Button from "@/components/Button";
import LogoMaruqee from "@/components/LogoMarquee";
import SvgSprite from "./heroes/svgSprite";
import Blueprints from "./heroes/blueprints";
import Swatches from "./heroes/swatches";
export default function Home() {
  return (
    <>
      <SvgSprite />
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          <Blueprints />
          <div className={styles.cover}></div>
        </div>
        <div className={styles.headingHero}>
          <div className="gooey"><Status status="error">Available for work</Status></div>
          <h1 className="gooey">
            <span>Product Designer &amp; Developer</span>
            <br />
            <span>
              Connecting Design &rarr; Code
              with Design Systems &amp;
              Custom Plugins
            </span>
          </h1>
        </div>
      </section>
      <section className={styles.quip}>
        <LogoMaruqee />
        <div className="content">
          <div className="avatarFlag">
            <Avatar size="extra-large" name="Darian Rosebrook" src="/darian-square.jpg" />
            <div className="flag">
              <p><strong>Darian Rosebrook</strong></p>
              <p>
                <span className="icon">
                  <svg height="16" width="11" fill="none" viewBox="0 0 11 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.83721 10.12C8.1018 11.2333 7.36817 12.344 7.05091 13.6184C6.62733 15.3199 6.45793 16.0003 5.38302 16.0003C4.28287 16.0003 4.18609 15.6165 3.74974 13.8861C3.42209 12.5868 2.68835 11.4352 1.95406 10.2828C1.25762 9.18974 0.56069 8.09593 0.209267 6.87456C0.0730014 6.40098 0 5.9006 0 5.38318C0 2.41013 2.41013 0 5.38318 0C8.35622 0 10.7664 2.41013 10.7664 5.38318C10.7664 6.02616 10.6536 6.64281 10.4469 7.21445C10.0722 8.25031 9.45406 9.18608 8.83721 10.12ZM5.38298 8.97221C7.36501 8.97221 8.97177 7.36546 8.97177 5.38343C8.97177 3.4014 7.36501 1.79464 5.38298 1.79464C3.40095 1.79464 1.7942 3.4014 1.7942 5.38343C1.7942 7.36546 3.40095 8.97221 5.38298 8.97221Z" fill="#D9D9D9" fillRule="evenodd" />
                  </svg>
                </span>
                Portland, Oregon
              </p>
            </div>
          </div>
          <p className="heading-02">Hello! I&#8217;m Darian Rosebrook 👋🏼</p>
          <p className="heading-05">I&#8217;m a seasoned Product Designer with a strong background in front-end engineering, I specialize in crafting robust design systems and developing custom design tooling for Figma that optimizes product development workflows.</p>
          <p className="heading-05">I live at the intersection of design and development  where I dedicate my efforts to streamlining collaboration and optimizing product development cycles.</p>
          <Button href="/about" variant="secondary" >Learn more about me &#8594;</Button>
        </div>
      </section>
      <section className={styles.marquee}>

        <div className="content">
          <h3>Where I&#8217;ve been</h3>
          <p className="body-01">Over the last ten years, I have spent my career building up skills at creating, maintaining, and scaling design systems across different sized initiatives.</p>
          <p className="body-01">For large and small brands alike, throughout my career, I have successfully led cross-functional teams through highly technical projects, collaborating with project managers and development leads to break down complex initiatives into manageable arcs of work. By effectively managing and delegating resources, I ensure the smooth execution of projects, delivering results that exceed expectations.</p>
          <p className="body-01">I am passionate about making things that make it easier for people to make things, and love a challenge when it comes to interesting problems to solve for.</p>
          <p className="body-01">You can see some of the places where I have worked to make their brand excel through my work with design systems </p>
          <p>p.s. A lot of this site is still a work in progress, as is the folly of all portfolio sites. haha</p>
          <Button href="/work" variant="secondary" >View my work &#8594;</Button>
        </div>
      </section>
      <section className={`${styles.education}`}>
        <div className="content">
          <h2>Design System Education</h2>
        </div> 
      </section>
      <section className={`${styles.hero} ${styles.tokens}`}>
        <div className={styles.heroImage}>
          <div className="backdropContainer">
            <Swatches />
          </div>
        </div>
        <div className={`${styles.headingHero}`}>
          <h1 className="gooey">  <span>Fundamentals</span><br /><span>
            Design Tokens
          </span>
          </h1>
        </div>
      </section>
    </>
  );
}
