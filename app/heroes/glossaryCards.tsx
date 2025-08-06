'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import styles from './glossaryCards.module.scss';
import { useInteraction } from '@/context';
import { glossaryItems as terms } from './glossaryItems';
import Icon from '@/components/Icon';

gsap.registerPlugin(ScrollTrigger);

export default function GlossaryCards() {
  const containerRef = useRef<HTMLDivElement>(null);

  let glossaryItems = terms.slice(0, 14);
  //if container is less than 800px wide, slice the glossaryItems to 10
  if (
    containerRef.current?.clientWidth &&
    containerRef.current.clientWidth < 800
  ) {
    glossaryItems = glossaryItems.slice(0, 10);
  }
  const cardsRef = useRef<HTMLDivElement[]>([]);
  /**
   * Each card's transform and center, cached after entrance animation.
   * @type {React.MutableRefObject<Array<{ xEnd: number; yEnd: number; rotEnd: number; centerX: number; centerY: number }>>}
   */
  const transformsRef = useRef<
    {
      xEnd: number;
      yEnd: number;
      rotEnd: number;
      centerX: number;
      centerY: number;
    }[]
  >([]);
  const { mouse, prefersReducedMotion } = useInteraction();
  const wasInRange = useRef<boolean[]>(
    new Array(glossaryItems.length).fill(false)
  );
  // IntersectionObserver: track if container is in view
  const [isInView, setIsInView] = useState(false);
  // quickTo setters for each card
  const quickToX = useRef<((v: number) => void)[]>([]);
  const quickToY = useRef<((v: number) => void)[]>([]);
  const quickToRot = useRef<((v: number) => void)[]>([]);
  // 1) Entrance animation + compute each card's rest transform and center
  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const {
        width: cw,
        height: ch,
        left: cLeft,
        top: cTop,
      } = containerRef.current!.getBoundingClientRect();

      cardsRef.current.forEach((card, i) => {
        // random start
        const xStart = gsap.utils.random(-cw / 2, cw / 2);
        const yStart = gsap.utils.random(-ch / 2, ch / 2);
        const rotStart = gsap.utils.random(-45, 45);

        // random rest
        const xEnd = gsap.utils.random(-cw / 2, cw / 2, 12);
        const yEnd = gsap.utils.random(-ch / 2, ch / 3, 24);
        const rotEnd = gsap.utils.random(-10, 10);

        // Set initial transform
        gsap.set(card, { x: xEnd, y: yEnd, rotation: rotEnd, opacity: 1 });
        // Compute center based on rest position
        const cardRect = card.getBoundingClientRect();
        const centerX = (cardRect.left + cardRect.right) / 2 - cLeft;
        const centerY = (cardRect.top + cardRect.bottom) / 2 - cTop;
        transformsRef.current[i] = { xEnd, yEnd, rotEnd, centerX, centerY };

        gsap.fromTo(
          card,
          { x: xStart, y: yStart, rotation: rotStart, opacity: 0 },
          {
            x: xEnd,
            y: yEnd,
            rotation: rotEnd,
            opacity: 1,
            ease: 'power4.out',
            duration: 2,
            stagger: 0.08,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
            },
            onComplete: () => {
              // After animation, recalculate center in case layout changed
              const cardRect2 = card.getBoundingClientRect();
              const centerX2 = (cardRect2.left + cardRect2.right) / 2 - cLeft;
              const centerY2 = (cardRect2.top + cardRect2.bottom) / 2 - cTop;
              transformsRef.current[i] = {
                xEnd,
                yEnd,
                rotEnd,
                centerX: centerX2,
                centerY: centerY2,
              };
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new window.IntersectionObserver((entries) => {
      setIsInView(
        entries[0].isIntersecting && entries[0].intersectionRatio > 0.05
      );
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  // Build quickTo setters on mount
  useEffect(() => {
    if (!containerRef.current) return;
    quickToX.current = cardsRef.current.map((el) =>
      gsap.quickTo(el, 'x', { duration: 1, ease: 'power4.out' })
    );
    quickToY.current = cardsRef.current.map((el) =>
      gsap.quickTo(el, 'y', { duration: 1, ease: 'power4.out' })
    );
    quickToRot.current = cardsRef.current.map((el) =>
      gsap.quickTo(el, 'rotation', { duration: 1, ease: 'power4.out' })
    );
  }, [prefersReducedMotion, isInView]);

  // 2) Pointer-driven "knock" effect, per-card, using only cached values
  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion || !isInView) return;
    let lastMouse = { x: 0, y: 0 };
    let rafId: number;
    const radius = 100; // px

    const loop = () => {
      const { left, top } = containerRef.current!.getBoundingClientRect();
      const px = mouse.x - left;
      const py = mouse.y - top;
      // compute pointer "velocity"
      const vx = px - lastMouse.x;
      const vy = py - lastMouse.y;
      const vMag = Math.hypot(vx, vy);

      transformsRef.current.forEach((transform, i) => {
        const { xEnd, yEnd, rotEnd, centerX, centerY } = transform;
        const dx = px - centerX;
        const dy = py - centerY;
        const dist = Math.hypot(dx, dy);
        const inRange = dist < radius;

        // on first entry → impulse
        if (inRange && !wasInRange.current[i]) {
          const normX = dx / dist;
          const normY = dy / dist;
          // force ∝ how fast you moved
          const force = ((1 - dist / radius) * vMag) / 2;
          // target = rest minus push vector
          const tx = xEnd - normX * force;
          const ty = yEnd - normY * force;
          const tr = rotEnd + dx * 0.03;

          // Use quickTo setters for buttery performance
          quickToX.current[i]?.(tx);
          quickToY.current[i]?.(ty);
          quickToRot.current[i]?.(tr);

          // update rest to this new spot
          transformsRef.current[i] = {
            xEnd: tx,
            yEnd: ty,
            rotEnd: tr,
            centerX,
            centerY,
          };
        }

        wasInRange.current[i] = inRange;
      });

      lastMouse = { x: px, y: py };
      rafId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(rafId);
  }, [mouse, prefersReducedMotion, isInView]);

  return (
    <div ref={containerRef} className={styles.cardsContainer}>
      {glossaryItems.map((item, i) => (
        <div
          key={item.id}
          ref={(el) => {
            if (el) cardsRef.current[i] = el;
          }}
          className={styles.card}
          style={{ opacity: prefersReducedMotion ? 1 : 0 }}
        >
          <div className={styles.cardLabel}>{item.name}</div>
          <div className={styles.cardContent}>
            {item.icon ? (
              <Icon icon={item.icon} width={56} height={56} />
            ) : (
              <span>{item.letter}</span>
            )}
          </div>
          <div className={styles.cardTerm}>{item.name}</div>
        </div>
      ))}
    </div>
  );
}
