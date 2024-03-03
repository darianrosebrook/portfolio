import Image from "next/image";
import logo from "./logo.svg";

export default function Header() {
  return (
    <header>
      <nav>
        <div>
          <Image src={logo} width="36" height="36" alt="Darian Rosebrook" className="logo" />
        </div>
        <div>
          <h1>Darian Rosebrook</h1>
          <h2>Product Designer and Developer</h2>
        </div>
      </nav>
    </header>
  );
}
