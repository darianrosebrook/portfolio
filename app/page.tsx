import styles from "./page.module.css";
import OutlineBox from "@/components/Backdrop";
export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          <OutlineBox />
        </div>
        <div className={styles.headingHero}>
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
    </>
  );
}
