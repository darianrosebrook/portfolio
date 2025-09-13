'use client';
import { useTransitionRouter } from 'next-view-transitions';
import Link from 'next/link';
import { AnimatedLink } from '@/ui/components/links/AnimatedLink';
import { usePathname } from 'next/navigation';
import styles from './index.module.css';
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

type NavbarProps = {
  pages: { name: string; path: string; admin: boolean }[] | null;
};

export default function Navbar({ pages = [] }: NavbarProps) {
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
    <header className={styles.navContainer}>
      <nav className={styles.nav}>
        <div className="logoLink">
          <Logo />
          <h1 className="medium logo">
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
                  onClick={(e) => hanldeRouteChange(e, `/${page.path}`)}
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
                  <ul className="menuList">
                    <li>
                      <Link
                        onClick={(e) =>
                          hanldeRouteChange(e, '/dashboard/profile')
                        }
                        className="menuItem"
                        href="/dashboard/profile"
                      >
                        <Icon icon={faUser} />
                        Account
                      </Link>
                    </li>
                    <li>
                      <Link
                        onClick={(e) => hanldeRouteChange(e, '/dashboard')}
                        className="menuItem"
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
}
