import Link from "next/link";
import Button from "../Button";

import styles from "./index.module.css";
import Marquee from "./marquee";
const Footer = () => {
  const year = new Date().getFullYear();
  const currentYear = `2015 - ${year}`;
  const links: {
    [key: string]: [string, string];
  } = {
    resume: [
      "https://drive.google.com/file/d/1h2QH7K7153QGbW59CHWWt07Dzhgzst3a/view?usp=sharing",
      "file-alt",
    ],
    twitter: ["https://twitter.com/darianrosebrook", "twitter"],
    github: ["https://github.com/darianrosebrook", "github"],
    linkedin: ["https://linkedin.com/in/darianrosebrook", "linkedin"],
    youtube: ["https://youtube.com/@darian.rosebrook", "youtube"],
    instagram: ["https://instagram.com/darianrosebrook", "instagram"],
    medium: ["https://read.compassofdesign.com/@darianrosebrook", "medium"],
  };
  return (
    <footer className={styles.footer}>
      <div className={styles.social}>
        <h2 className="light">Elsewhere</h2>
      </div>
      <ul>
        {Object.entries(links).map(([key, value]) => {
          const siteName = key;
          const items = value;

          return (
            <li key={key}>
              <Marquee title={siteName} items={items} />
            </li>
          );
        })}
      </ul>
      <div className={styles.copyRight}>
        <p>
          <small>&copy; {currentYear} Darian Rosebrook.</small>
        </p>
        <p>
          <small> All rights reserved.</small>
        </p>
      </div>
    </footer>
  );
};
export default Footer;
