'use client';
import { useTransitionRouter } from 'next-view-transitions';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './index.module.css';
import Logo from './logo';
import React, { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from '@/context';
import Popover from '../Popover/Popover';
import Button from '../Button';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';
import Icon from '@/components/Icon';
import ToggleSwitch from '../ToggleSwitch';

const faBars = byPrefixAndName['far']['bars'];

type NavbarProps = {
  pages: { name: string; path: string; admin: boolean }[] | null;
  id: string;
};

export default function Navbar({ pages = [] }: NavbarProps) {
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
        // { opacity: 0, clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
        // { opacity: 1, clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)" },
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
  const hanldeRouteChange = (
    event: React.MouseEvent<HTMLAnchorElement>,
    route: string
  ) => {
    event.preventDefault();
    router.push(route, {
      onTransitionReady: slideInOut,
    });
  };

  const { prefersReducedMotion, setPrefersReducedMotion } = useReducedMotion();
  const handlePrefersReducedMotion = (e) => {
    const enabled = e.target.checked;
    setPrefersReducedMotion(enabled);
  };
  const handleTheme = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const enabled = e.target.checked;
      setSlider(enabled);
      const body = document.querySelector('body');
      if (enabled) {
        body.classList.add(theme);
      } else {
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
      body.classList.remove(theme);
      console.log(e.matches);
    };
  }, [theme]);

  return (
    <header className={styles.navContainer}>
      <nav className={styles.nav}>
        <Link
          onClick={(e) => hanldeRouteChange(e, '/')}
          href="/"
          className="logoLink"
        >
          <Logo />
          <h1 className="medium logo">{`Darian Rosebrook`}</h1>
        </Link>
        <ul className={styles.navLinks}>
          {pages.length > 0 &&
            pages.map((page) => (
              <li key={page.name}>
                <a
                  onClick={(e) => hanldeRouteChange(e, `/${page.path}`)}
                  href={`/${page.path}`}
                  className={pathname === page.path ? styles.active : ''}
                >
                  {page.name}
                </a>
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
                <ul className="menuList">
                  <li>
                    <ToggleSwitch
                      checked={prefersReducedMotion}
                      onChange={handlePrefersReducedMotion}
                    >
                      Reduce motion
                    </ToggleSwitch>
                  </li>
                  <li>
                    <ToggleSwitch checked={slider} onChange={handleTheme}>
                      Use {theme} theme
                    </ToggleSwitch>
                  </li>
                </ul>
              </Popover.Content>
            </Popover>
          </li>
          {/* {profile && (
            <li>
              <Popover>
                <Popover.Trigger>
                  <Avatar src={avatar_url} name={full_name} size="large" />
                </Popover.Trigger>
                <Popover.Content>
                  <ul className="menuList">
                    <li>
                      <Link onClick={(e) => hanldeRouteChange(e, "/")} className="menuItem" href={`/profile/${id}`}>
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link onClick={(e) => hanldeRouteChange(e, "/")} className="menuItem" href="/dashboard">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link onClick={(e) => hanldeRouteChange(e, "/")} className="menuItem" href="/settings">
                        Settings
                      </Link>
                    </li>
                  </ul>
                  <Button href="/signout" as="a">
                    Logout
                  </Button>
                </Popover.Content>
              </Popover>
            </li>
          )} */}
        </ul>
      </nav>
    </header>
  );
}
