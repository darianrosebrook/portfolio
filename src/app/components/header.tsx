import Image from "next/image";

export default function Header() {
  return (
    <header>
      <nav>
        <Image
          className="logo"
          src="/logo.svg"
          alt="Darian Rosebrook"
          width={36}
          height={36}
        />
        <div>
          <h1>Darian Rosebrook</h1>
          <h2>Product Designer and Developer</h2>
        </div>
      </nav>
    </header>
  );
}
