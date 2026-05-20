'use client';
import { useReducedMotion, useUser } from '@/context';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import Icon from '@/ui/components/Icon';
// import { AnimatedLink } from '@/ui/components/Links/Links';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import Popover from '../../components/Popover/Popover';
import { SwitchField } from '../../components/Switch';
import Logo from './Logo';
import styles from './Navbar.module.css';

const faBars = byPrefixAndName['far']['bars'];
const faUser = byPrefixAndName['far']['user'];
const faList = byPrefixAndName['far']['list'];
const faArrowRight = byPrefixAndName['far']['arrow-right'];

export type NavbarProps = {
  pages: { name: string; path: string; admin: boolean }[] | null;
};

// Subscribe to the OS prefers-color-scheme media query as an external store so
// theme stays in sync without a setState-in-effect cycle.
function subscribePrefersDark(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function getPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function Navbar({ pages = [] }: NavbarProps) {
  const { user, profile, loading } = useUser();

  const [slider, setSlider] = useState(false);
  const prefersDark = useSyncExternalStore(
    subscribePrefersDark,
    getPrefersDark,
    () => false
  );
  // The toggle adds the opposite-of-system class to <html>; preserves prior
  // semantics where slider on top of a dark system added the "light" class.
  const theme = prefersDark ? 'light' : 'dark';
  const pathname = usePathname();
  const router = useRouter();
  const { isEnabled: performanceEnabled, togglePerformanceMonitor } =
    usePerformanceMonitor();
  const hanldeRouteChange = (
    event: React.MouseEvent<HTMLAnchorElement>,
    route: string
  ) => {
    event.preventDefault();
    router.push(route);
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
      const html = document.documentElement;
      html.classList.remove(theme === 'dark' ? 'light' : 'dark');
      if (enabled) {
        html.classList.add(theme);
      } else {
        html.classList.remove(theme);
      }
    },
    [theme]
  );

  // When the OS theme preference changes, reset any user override:
  // - State part (slider): adjust during render via the "previous-value"
  //   pattern (https://react.dev/learn/you-might-not-need-an-effect#adjusting-state-when-a-prop-changes).
  // - DOM part (classList): keep in an effect since it's a side effect,
  //   not state derivation.
  const [prevPrefersDark, setPrevPrefersDark] = useState(prefersDark);
  if (prevPrefersDark !== prefersDark) {
    setPrevPrefersDark(prefersDark);
    setSlider(false);
  }
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
  }, [prefersDark]);

  return (
    <header className={styles.navContainer}>
      <nav className={styles.nav}>
        <div className={styles.logoLink}>
          <Logo />
          <h1 className="medium logo">
            <Link href="/">Darian&nbsp;Rosebrook</Link>
          </h1>
        </div>
        <ul className={styles.navLinks}>
          {pages &&
            pages.length > 0 &&
            pages.map((page) => (
              <li key={page.name}>
                <Link
                  href={`/${page.path}`}
                  className={pathname === page.path ? styles.active : ''}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                    hanldeRouteChange(e, `/${page.path}`)
                  }
                >
                  {page.name}
                </Link>
              </li>
            ))}
          <li>
            <Popover>
              <Button
                asChild
                variant="tertiary"
                size="small"
                ariaLabel="Menu"
                title="Menu"
              >
                <Popover.Trigger>
                  <Icon icon={faBars} />
                </Popover.Trigger>
              </Button>
              <Popover.Content>
                <ul className="menuList">
                  <li>
                    <SwitchField
                      checked={prefersReducedMotion}
                      onChange={handlePrefersReducedMotion}
                      size="lg"
                      label="Reduce motion"
                    />
                  </li>
                  <li>
                    <SwitchField
                      checked={slider}
                      onChange={handleTheme}
                      size="lg"
                      label={`Use ${theme} theme`}
                    />
                  </li>
                  {process.env.NODE_ENV === 'development' && (
                    <li>
                      <SwitchField
                        checked={performanceEnabled}
                        onChange={(e) =>
                          togglePerformanceMonitor(e.target.checked)
                        }
                        size="lg"
                        label="Performance monitor"
                      />
                    </li>
                  )}
                </ul>
              </Popover.Content>
            </Popover>
          </li>
          {user && !loading && (
            <li>
              <Popover>
                <Button
                  asChild
                  variant="secondary"
                  size="small"
                  ariaLabel="User menu"
                  title="User menu"
                >
                  <Popover.Trigger>
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
                  </Popover.Trigger>
                </Button>
                <Popover.Content>
                  <ul className="menuList">
                    <li>
                      <Link
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
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
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                          hanldeRouteChange(e, '/dashboard')
                        }
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
