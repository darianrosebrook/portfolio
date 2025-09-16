'use client';

import { useRef, useEffect, useState } from 'react';
import styles from './LogoMarquee.module.scss';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { horizontalLoop } from '@/utils';
import LogoSprite from './LogoSprite';

export interface LogoMarqueeProps {
  className?: string;
  speed?: number;
  repeat?: number;
  paused?: boolean;
  logos?: string[];
}

const LogoMarquee: React.FC<LogoMarqueeProps> = ({
  className = '',
  speed = 1,
  repeat = -1,
  paused = false,
  logos = [],
}) => {
  const logoMarqueeRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLElement | null>(null);
  const [boxes, setBoxes] = useState<React.ReactElement[] | null>(null);
  const [isBoxesReady, setIsBoxesReady] = useState(false);

  const box = (svg: Element) => (
    <div className={styles.box} key={svg.id}>
      <svg className={styles.logo}>
        <use href={`#${svg.id}`} />
      </svg>
    </div>
  );

  const clones = Array(20).fill(box);

  useGSAP(
    () => {
      if (!isBoxesReady) return;
      if (!logoMarqueeRef.current) return;
      const boxElements = logoMarqueeRef.current.children;
      gsap.set(logoMarqueeRef.current, { perspective: 500 });
      const loop = horizontalLoop(boxElements, {
        repeat,
        paused,
        speed,
      });
      return () => {
        if (loop) loop.kill();
      };
    },
    {
      scope: logoMarqueeRef,
      dependencies: [isBoxesReady, speed, repeat, paused],
    }
  );

  useEffect(() => {
    const LOGOSPRITE = document.getElementById('LOGOSPRITE');
    if (LOGOSPRITE) {
      spriteRef.current = LOGOSPRITE as HTMLElement;
      const children = LOGOSPRITE.children;
      const newBoxes = Array.from(children).map((child) => box(child));
      setBoxes(newBoxes);
      setIsBoxesReady(true);
    }
  }, []);

  return (
    <div className={`${styles.marqueeContainer} ${className}`}>
      <LogoSprite />
      <div className={styles.marquee} ref={logoMarqueeRef}>
        {clones &&
          boxes &&
          boxes.map((box, index) => <div key={index}>{box}</div>)}
      </div>
      <div className={styles.cover}></div>
    </div>
  );
};

export { LogoMarquee };
export default LogoMarquee;
