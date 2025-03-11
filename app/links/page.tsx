import Link from 'next/link';
import Image from 'next/image';
import Styles from './page.module.css';
export default function page() {
  const size = 128;
  const avatarUrl = '/darian-square.jpg';

  return (
    <section className={`${Styles.linktree} content`}>
      <h1>Thanks for taking some time to connect!</h1>
      <p>
        You can find out more about me and my work here, or find me elsewhere
        around the web below!
      </p>
      <div className={Styles.avatarFlag}>
        <Link href="/about">
          <Image
            width={size}
            height={size}
            src={avatarUrl}
            alt="Avatar"
            className="avatar image"
            style={{ height: size, width: size }}
          />
        </Link>
        <div className={Styles.flag}>
          <h5>Darian Rosebrook</h5>
          <p className={Styles.flagText}>Product Designer</p>
          <p>Design Systems</p>
        </div>
      </div>
    </section>
  );
}
