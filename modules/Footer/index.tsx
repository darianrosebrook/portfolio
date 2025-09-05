import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';
import styles from './index.module.css';
import Marquee from './marquee';
const Footer = () => {
  const year = new Date().getFullYear();
  const currentYear = `2015 - ${year}`;
  const faFileAlt = byPrefixAndName['far']['file-alt'];
  const faGithub = byPrefixAndName['fab']['github'];
  const faLinkedin = byPrefixAndName['fab']['linkedin'];
  const faTwitter = byPrefixAndName['fab']['twitter'];
  const faYoutube = byPrefixAndName['fab']['youtube'];
  const faInstagram = byPrefixAndName['fab']['instagram'];
  const links = [
    {
      title: 'Resume',
      icon: faFileAlt,
      url: 'https://drive.google.com/file/d/1h2QH7K7153QGbW59CHWWt07Dzhgzst3a/view?usp=sharing',
    },
    {
      title: 'GitHub',
      icon: faGithub,
      url: 'https://github.com/darianrosebrook',
    },
    {
      title: 'LinkedIn',
      icon: faLinkedin,
      url: 'https://linkedin.com/in/darianrosebrook',
    },
    {
      title: 'Twitter',
      icon: faTwitter,
      url: 'https://twitter.com/darianrosebrook',
    },
    {
      title: 'YouTube',
      icon: faYoutube,
      url: 'https://youtube.com/@darian.rosebrook',
    },
    {
      title: 'Instagram',
      icon: faInstagram,
      url: 'https://instagram.com/darianrosebrook',
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.social}>
        <h2 className="light">Elsewhere</h2>
      </div>
      <ul>
        {Object.entries(links).map(([key, value]) => {
          return (
            <li key={key}>
              <Marquee {...value} />
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
