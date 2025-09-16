'use client';

import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';
import styles from './Footer.module.scss';
import Marquee from './marquee';

export interface FooterLink {
  title: string;
  icon: any;
  url: string;
}

export interface FooterProps {
  className?: string;
  links?: FooterLink[];
  showCopyright?: boolean;
  copyrightText?: string;
}

const Footer: React.FC<FooterProps> = ({
  className = '',
  links = [],
  showCopyright = true,
  copyrightText,
}) => {
  const year = new Date().getFullYear();
  const currentYear = `2015 - ${year}`;

  // Default social links
  const defaultLinks: FooterLink[] = [
    {
      title: 'Resume',
      icon: byPrefixAndName['far']['file-alt'],
      url: 'https://drive.google.com/file/d/1h2QH7K7153QGbW59CHWWt07Dzhgzst3a/view?usp=sharing',
    },
    {
      title: 'GitHub',
      icon: byPrefixAndName['fab']['github'],
      url: 'https://github.com/darianrosebrook',
    },
    {
      title: 'LinkedIn',
      icon: byPrefixAndName['fab']['linkedin'],
      url: 'https://linkedin.com/in/darianrosebrook',
    },
    {
      title: 'Twitter',
      icon: byPrefixAndName['fab']['twitter'],
      url: 'https://twitter.com/darianrosebrook',
    },
    {
      title: 'YouTube',
      icon: byPrefixAndName['fab']['youtube'],
      url: 'https://youtube.com/@darian.rosebrook',
    },
    {
      title: 'Instagram',
      icon: byPrefixAndName['fab']['instagram'],
      url: 'https://instagram.com/darianrosebrook',
    },
  ];

  const socialLinks = links.length > 0 ? links : defaultLinks;
  const copyright =
    copyrightText || `© ${currentYear} Darian Rosebrook. All rights reserved.`;

  return (
    <footer className={`${styles.footer} ${className}`}>
      <div className={styles.social}>
        <h2 className={styles.socialTitle}>Elsewhere</h2>
      </div>
      <ul className={styles.links}>
        {socialLinks.map((link, index) => (
          <li key={index} className={styles.linkItem}>
            <Marquee {...link} />
          </li>
        ))}
      </ul>
      {showCopyright && (
        <div className={styles.copyright}>
          <p className={styles.copyrightText}>
            <small>{copyright}</small>
          </p>
        </div>
      )}
    </footer>
  );
};

export { Footer };
export default Footer;
