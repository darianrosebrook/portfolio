import Button from "../Button";

import styles from "./footer.module.css";
const Footer = () => {
  const year = new Date().getFullYear();
  const currentYear = `2015 - ${year}`;
  const links = {
    twitter: "https://twitter.com/darianrosebrook",
    github: "https://github.com/darianrosebrook",
    linkedin: "https://linkedin.com/in/darianrosebrook",
    youtube: "https://youtube.com/@darian.rosebrook",
    instagram: "https://instagram.com/darianrosebrook",
    medium: "https://read.compassofdesign.com/@darianrosebrook",
  }
  return (
    <footer className={styles.footer}>
      <p>
        <small>&copy; {currentYear} Darian Rosebrook. All rights reserved.</small>
      </p> 
      <ul>
        {Object.keys(links).map((key) => (
          <li key={key}>
            <Button
              href={links[key]}
              variant="primary"
              size="small"
              >
                <i className={`fab fa-${key}`} aria-label={key}><span>{key}</span></i>

              </Button>
          </li>))}
      </ul>
    </footer>
  );
};
export default Footer;