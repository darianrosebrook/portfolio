'use client';
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
          {paths.map((path) => (
            <li key={path[1]}>
              <Link
                href={path[0]}
                className={pathname === path[0] ? "active" : ""}
              >
                {path[1]}
              </Link>
            </li>
          ))}
          {isAuthed && (
            <>
              {adminPaths.map((path) => (
                <li key={path[1]}>
                  <Link
                    href={path[0]}
                    className={pathname === path[0] ? "active" : ""}
                  >
                    {path[1]}
                  </Link>
                </li>
              ))}
              <li>  
                <LogoutButton />
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
