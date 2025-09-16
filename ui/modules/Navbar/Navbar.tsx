'use client';

import { useTransitionRouter } from 'next-view-transitions';
import Link from 'next/link';
import { AnimatedLink } from '@/ui/components/Links';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.scss';
import Logo from './logo';
import React, { useCallback, useEffect, useState } from 'react';
import { useReducedMotion, useUser } from '@/context';
import Popover from '../../components/Popover/Popover';
import Button from '../../components/Button';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';
import Icon from '@/ui/components/Icon';
import ToggleSwitch from '../../components/ToggleSwitch';
import Avatar from '../../components/Avatar';

const faBars = byPrefixAndName['far']['bars'];
const faUser = byPrefixAndName['far']['user'];
const faList = byPrefixAndName['far']['list'];
const faArrowRight = byPrefixAndName['far']['arrow-right'];

export interface NavbarPage {
  name: string;
  path: string;
  admin: boolean;
}

export interface NavbarProps {
  pages?: NavbarPage[] | null;
  className?: string;
  showThemeToggle?: boolean;
  showMotionToggle?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  pages = [],
  className = '',
  showThemeToggle = true,
  showMotionToggle = true,
}) => {
  const { user, profile, loading } = useUser();
  const [slider, setSlider] = useState(false);
  const [theme, setTheme] = useState('dark');
  const pathname = usePathname();
  const router = useTransitionRouter();

  const slideInOut = useCallback(() => {
    document.documentElement.animate(
      [
        { opacity: 1, transform: 'translatex(0)' },
        { opacity: 0.0, transform: 'translatex(-35%)' },
      ],
      {
        duration: 500,
        easing: 'cubic-bezier(0.8, 0, 0.15, 1)',
        fill: 'forwards',
        pseudoElement: '::view-transition-old(main)',
      }
    );
    document.documentElement.animate(
      [
        { opacity: 0, transform: 'translatex(35%)' },
        { opacity: 1, transform: 'translatex(0)' },
      ],
      {
        duration: 500,
        easing: 'cubic-bezier(0.8, 0, 0.176, 1)',
        fill: 'forwards',
        pseudoElement: '::view-transition-new(main)',
      }
    );
  }, []);

  const handleRouteChange = (
    event: React.MouseEvent<HTMLAnchorElement>,
    route: string
  ) => {
    event.preventDefault();
    router.push(route, {
      onTransitionReady: slideInOut,
    });
  };

  const { prefersReducedMotion, setPrefersReducedMotion } = useReducedMotion();
  const handlePrefersReducedMotion = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const enabled = e.target.checked;
    setPrefersReducedMotion(enabled);
  };

  const handleTheme = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const enabled = e.target.checked;
      setSlider(enabled);
      const body = document.querySelector('body');
      if (enabled && body) {
        body.classList.add(theme);
      } else if (body) {
        body.classList.remove(theme);
      }
    },
    [theme]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersColorSchemeDarkQuery = window?.matchMedia(
      '(prefers-color-scheme: dark)'
    );
    const body = document.querySelector('body');
    if (prefersColorSchemeDarkQuery.matches) {
      setTheme('light');
    }
    prefersColorSchemeDarkQuery.onchange = (e) => {
      setSlider(false);
      setTheme(e.matches ? 'light' : 'dark');
      if (body) {
        body.classList.remove(theme);
      }
    };
  }, [theme]);

  return (
    <header className={`${styles.navContainer} ${className}`}>
      <nav className={styles.nav}>
        <div className={styles.logoLink}>
          <Logo />
          <h1 className={styles.logoTitle}>
            <AnimatedLink href="/">Darian&nbsp;Rosebrook</AnimatedLink>
          </h1>
        </div>
        <ul className={styles.navLinks}>
          {pages &&
            pages.length > 0 &&
            pages.map((page) => (
              <li key={page.name}>
                <AnimatedLink
                  href={`/${page.path}`}
                  className={pathname === page.path ? styles.active : ''}
                  onClick={(e) => handleRouteChange(e, `/${page.path}`)}
                >
                  {page.name}
                </AnimatedLink>
              </li>
            ))}
          <li>
            <Popover>
              <Popover.Trigger>
                <Button variant="tertiary" size="small">
                  <Icon icon={faBars} />
                </Button>
              </Popover.Trigger>
              <Popover.Content>
                <ul className={styles.menuList}>
                  {showMotionToggle && (
                    <li>
                      <ToggleSwitch
                        checked={prefersReducedMotion}
                        onChange={handlePrefersReducedMotion}
                      >
                        Reduce motion
                      </ToggleSwitch>
                    </li>
                  )}
                  {showThemeToggle && (
                    <li>
                      <ToggleSwitch checked={slider} onChange={handleTheme}>
                        Use {theme} theme
                      </ToggleSwitch>
                    </li>
                  )}
                </ul>
              </Popover.Content>
            </Popover>
          </li>
          {user && !loading && (
            <li>
              <Popover>
                <Popover.Trigger>
                  <Button variant="secondary" size="small">
                    <Avatar
                      src={
                        profile?.avatar_url || user.user_metadata?.avatar_url
                      }
                      name={
                        profile?.full_name ||
                        user.user_metadata?.full_name ||
                        user.email ||
                        'User'
                      }
                      size="large"
                    />
                  </Button>
                </Popover.Trigger>
                <Popover.Content>
                  <ul className={styles.menuList}>
                    <li>
                      <Link
                        onClick={(e) =>
                          handleRouteChange(e, '/dashboard/profile')
                        }
                        className={styles.menuItem}
                        href="/dashboard/profile"
                      >
                        <Icon icon={faUser} />
                        Account
                      </Link>
                    </li>
                    <li>
                      <Link
                        onClick={(e) => handleRouteChange(e, '/dashboard')}
                        className={styles.menuItem}
                        href="/dashboard"
                      >
                        <Icon icon={faList} />
                        Dashboard
                      </Link>
                    </li>
                  </ul>
                  <Button
                    href="/signout"
                    as="a"
                    variant="secondary"
                    size="small"
                  >
                    <Icon icon={faArrowRight} />
                    Logout
                  </Button>
                </Popover.Content>
              </Popover>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export { Navbar };
export default Navbar;
