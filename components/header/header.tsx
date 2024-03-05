import Image from "next/image";
import logo from "./logo.svg";
import Link from "next/link";
export default function Header() {
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

          <h1 className="large">Darian Rosebrook</h1>
        </Link> 
        <ul> 
          <li>
            <Link href="/articles">Articles</Link>
          </li>
          <li>
            <Link href="/design-system">Design System</Link>
          </li>
          <li>
            <Link href="/work">Work</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
