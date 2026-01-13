'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { useFontsLoaded } from '@/hooks/useFontsLoaded';
import styles from './Links.module.scss';

gsap.registerPlugin(useGSAP, SplitText);

export interface AnimatedLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: string; // plain text; we split into characters
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  staggerMs?: number;
  durationMs?: number;
}

export function AnimatedLink({
  href,
  children,
  className,
  onClick,
  staggerMs = 28,
  durationMs = 400,
  ...props
}: AnimatedLinkProps) {
  const rootRef = useRef<HTMLAnchorElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const cloneRef = useRef<HTMLSpanElement | null>(null);
  const fontsLoaded = useFontsLoaded();

  useGSAP(
    () => {
      const el = rootRef.current;
      const textEl = textRef.current;
      const cloneEl = cloneRef.current;
      if (!el || !textEl || !cloneEl || !fontsLoaded) return;

      // Split text into characters
      const splitText = new SplitText(textEl, {
        type: 'chars',
        charsClass: 'char',
      });

      const splitClone = new SplitText(cloneEl, {
        type: 'chars',
        charsClass: 'char',
      });

      const originalChars = splitText.chars;
      const cloneChars = splitClone.chars;

      // Set initial positions
      gsap.set(originalChars, { yPercent: 0 });
      gsap.set(cloneChars, { yPercent: 100 });

      const t = gsap.timeline({
        paused: true,
        defaults: { ease: 'expo.inOut' },
      });

      t.to(
        originalChars,
        {
          yPercent: -100,
          duration: durationMs / 1000,
          stagger: staggerMs / 1000,
        },
        0
      ).to(
        cloneChars,
        {
          yPercent: 0,
          duration: durationMs / 1000,
          stagger: staggerMs / 1000,
        },
        0
      );

      const onEnter = () => t.play();
      const onLeave = () => t.reverse();

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      el.addEventListener('focus', onEnter);
      el.addEventListener('blur', onLeave);

      return () => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.removeEventListener('focus', onEnter);
        el.removeEventListener('blur', onLeave);
        splitText.revert();
        splitClone.revert();
      };
    },
    { scope: rootRef, dependencies: [children, fontsLoaded] }
  );

  return (
    <Link
      ref={rootRef}
      href={href}
      className={`${styles.root} ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      <span className={styles.maskLine}>
        <span ref={textRef} className={styles.text}>
          {children}
        </span>
        <span ref={cloneRef} className={styles.clone} aria-hidden="true">
          {children}
        </span>
      </span>
    </Link>
  );
}

export default AnimatedLink;
