"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./index.module.css";
import Logo from "./logo"; 
import { useCallback, useEffect, useState } from "react"; 
import { useReducedMotion } from "@/context";
import Popover from "../Popover/Popover";
import Button from "../Button";
import { byPrefixAndName } from "@awesome.me/kit-0ba7f5fefb/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ToggleSwitch from "../ToggleSwitch";

const faBars = byPrefixAndName["far"]["bars"];

type NavbarProps = {
  pages: { name: string; path: string; admin: boolean }[] | null;
  id: string;
};

export default function Navbar({ pages = [], id = null }: NavbarProps) { 
  const [slider, setSlider] = useState(false);
  const [theme, setTheme] = useState("dark"); 
  const pathname = usePathname();

  const { prefersReducedMotion, setPrefersReducedMotion } = useReducedMotion();

  const handlePrefersReducedMotion = (e) => {
      const enabled = e.target.checked;
      setPrefersReducedMotion(enabled);
  };
  const handleTheme = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setSlider(enabled);
    const body = document.querySelector("body");
    if (enabled) {
      body.classList.add("light");
      body.classList.remove("dark");
    } else {
      body.classList.add("dark");
      body.classList.remove("light");
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return; 
    const initialTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(initialTheme);
    document.body.classList.add(initialTheme);
  }, []);
 

  useEffect(() => {
    console.log('Navbar props or state changed:', { id, slider, theme });
  }, [id, slider, theme]);
return (
    <header className={styles.navContainer}>
      <nav className={styles.nav}>
        <Link href="/" className="logoLink">
          <Logo />
          <h1 className="medium logo">{`Darian Rosebrook`}</h1>
        </Link>
        <ul className={styles.navLinks}>
          {pages.length > 0 &&
            pages.map((page) => (
              <li key={page.name}>
                <Link
                  href={`/${page.path}`}
                  className={pathname === page.path ? styles.active : ""}
                >
                  {page.name}
                </Link>
              </li>
            ))}
          <li>
            <Popover>
              <Popover.Trigger>
                <Button variant="tertiary" size="small">
                  <FontAwesomeIcon icon={faBars} />
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
                      Use {theme} mode
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
                      <Link className="menuItem" href={`/profile/${id}`}>
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="menuItem" href="/dashboard">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link className="menuItem" href="/settings">
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
