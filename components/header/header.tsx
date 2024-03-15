"use client";
import Image from "next/image";
import logo from "./logo.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./logout-button";

export default function Header({ isAuthed }) {
  const pathname = usePathname();
  const adminPaths = [
    ["/dashboard", "Dashboard"],
    ["/dashboard/articles", "Articles"],
    ["/dashboard/articles/new", "New Article"],
  ];
  const paths = [
    ["/", "Home"],
    ["/articles", "Articles"],
    ["/design-system", "Design System"],
    ["/work", "Work"],
    ["/about", "About"],
  ];
  return (
    <header>
      <nav>
        <Link href="/" className="logoLink">
          <Image
            src={logo}
            width="36"
            height="36"
            alt="Darian Rosebrook"
            className="logo"
          />

          <h1 className="large">{`Darian Rosebrook`}</h1>
        </Link>
        <ul>
          {paths.map(([route, name]) => (
            <li key={name}>
              <Link
                href={route}
                className={pathname === route ? "active" : ""}
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
                  className={pathname === route ? "active" : ""}
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
