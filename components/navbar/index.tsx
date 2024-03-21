"use client"; 
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./logout-button";
import styles from "./index.module.css";
import Logo from "./logo";
import Avatar from "../avatar/avatar";

export default function Navbar({ isAuthed }) {
  const pathname = usePathname();
  const adminPaths = [
    ["/dashboard", "Dashboard"],
    ["/dashboard/articles", "Articles"],
    ["/dashboard/articles/new", "New Article"],
  ];
  const paths = [ 
    ["/articles", "Articles"],
    ["/design-system", "Design System"],
    ["/work", "Work"],
    ["/about", "About"],
  ];
  return (
    <header>
      <nav className={styles.nav}>
        <Link href="/" className="logoLink">
          <Logo />
          <h1 className="medium logo">{`Darian Rosebrook`}</h1>
        </Link>
        <ul>
          {paths.map(([route, name]) => (
            <li key={name}>
              <Link
                href={route}
                className={pathname === route ? styles.active : ""}
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
        {isAuthed && (
          <ul>
            {adminPaths.map(([route, name]) => (
              <li key={name}>
                <Link
                  href={route}
                  className={pathname === route ? styles.active : ""}
                >
                  {name}
                </Link>
              </li>
            ))}
            <li>
              <LogoutButton />
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
