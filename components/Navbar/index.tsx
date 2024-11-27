"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./index.module.css";
import Logo from "./logo";
import Avatar from "../Avatar";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
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
  const [profile, setProfile] = useState(null);
  const [slider, setSlider] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const full_name = profile?.full_name || "Darian Rosebrook";
  const avatar_url = profile?.avatar_url || "/images/avatar.png";
  const pathname = usePathname();

  const handlePrefersReducedMotion = (e) => {
    const enabled = e.target.checked;
    setPrefersReducedMotion(enabled);

    // Update body attribute for global effect
    const body = document.querySelector("body");
    if (enabled) {
      body.classList.add("reduce-motion");
    } else {
      body.classList.remove("reduce-motion");
    }
    // Persist preference in localStorage
    localStorage.setItem("prefersReducedMotion", enabled.toString());
  };

  const handleTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  useEffect(() => {
    // Set initial theme based on system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.body.classList.add("dark");
    } else {
      setTheme("light");
      document.body.classList.add("light");
    }

    // Set initial reduced-motion preference
    const storedMotionPreference = localStorage.getItem("prefersReducedMotion");
    const prefersMotion =
      storedMotionPreference !== null
        ? storedMotionPreference === "true"
        : window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setPrefersReducedMotion(prefersMotion);
    const body = document.querySelector("body");
    if (prefersMotion) {
      body.setAttribute("data-prefers-reduced-motion", "reduce");
    } else {
      body.removeAttribute("data-prefers-reduced-motion");
    }

    // Dynamic listening for reduced-motion changes
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionListener = (event) => {
      setPrefersReducedMotion(event.matches);
    };
    motionQuery.addEventListener("change", motionListener);

    return () => {
      motionQuery.removeEventListener("change", motionListener);
    };
  }, [id, profile]);

  useEffect(() => {
    if (id && !profile) {
      const getProfile = async () => {
        const client = await createClient();
        const response = await client.from("profiles").select("*").eq("id", id);
        setProfile(response.data[0]);
      };
      getProfile();
    }
  }, [id, profile]);

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
          {profile && (
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
          )}
        </ul>
      </nav>
    </header>
  );
}
