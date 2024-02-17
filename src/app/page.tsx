import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className="module">
        <h1>Darian Rosebrook</h1>
        <p>Product Designer and Developer</p>
      </div>
      <div>

      <Image
        src="/darianrosebrook.jpg"
        alt="Picture of Darian Rosebrook cropped close from the chest and shoulders, wearing a sweater. They are looking off to their right, a slight smile on their face. Curly dark hair about 3 inches long. They seem tired."
        width={540}
        height={675}
      />
      </div>
      <div>

      <p>
        Just a chaos goblin creating design system tooling for designers and
        developers. Like figma plugins, design to code pipelines, etc. You could
        ask me about if it you want. That&apos;s cool I guess.
      </p>
      <p>
        Idk, here&apos;s a link to{" "}``
        <a href="https://x.com/darianrosebrook/status/847670574964920320">something i made that I posted on twitter.</a>
      </p>
      <p>I wanna go back to bed</p>
      </div>
    </main>
  );
}
