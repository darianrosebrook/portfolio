 
import Image from "next/image";

export default function Header() {
  return (
    <header>
      <nav>
        <div>
            <Image src="/logo.svg" alt="Darian Rosebrook" />
        </div>
        <div>
          <h1>Darian Rosebrook</h1>
          <h2>Product Designer and Developer</h2>
        </div>
      </nav>
    </header>
  );
}
