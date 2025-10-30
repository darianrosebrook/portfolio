'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import styles from './glossaryCards.module.scss';
import { useInteraction } from '@/context';
import { glossaryItems as terms } from './glossaryItems';
import Icon from '@/ui/components/Icon';

gsap.registerPlugin(ScrollTrigger);

export default function GlossaryCards() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize glossary items based on container width
  const [glossaryItems, setGlossaryItems] = useState(() => terms.slice(0, 14));
  
  // Update glossary items count based on container width
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateItems = () => {
      const width = containerRef.current?.clientWidth || 0;
      setGlossaryItems(
        width < 800 ? terms.slice(0, 10) : terms.slice(0, 14)
      );
    };
    
    updateItems();
    
    // Use ResizeObserver for responsive updates
    if (containerRef.current && 'ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(updateItems);
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);
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
  const wasInRange = useRef<boolean[]>([]);
  // IntersectionObserver: track if container is in view
  const [isInView, setIsInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  // quickTo setters for each card
  const quickToX = useRef<((v: number) => void)[]>([]);
  const quickToY = useRef<((v: number) => void)[]>([]);
  const quickToRot = useRef<((v: number) => void)[]>([]);

  // Drag state management
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDragging = useRef<boolean>(false);
  const [isDraggingState, setIsDraggingState] = useState<boolean>(false);
  // Track current visual scale during drag to keep pointer anchor stable
  const currentScale = useRef<number>(1);
  // Track pointer and transform at drag start for delta-based dragging
  const dragStartMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartTransform = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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
        if (!card) return;

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

  // Optimized IntersectionObserver with better options
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        setIsInView(
          entries[0].isIntersecting && entries[0].intersectionRatio > 0.05
        );
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.05, 0.5, 1],
      }
    );

    observerRef.current.observe(container);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Build quickTo setters on mount and when glossary items change
  useEffect(() => {
    if (!containerRef.current || !glossaryItems.length) return;
    
    // Initialize wasInRange array when items change
    wasInRange.current = new Array(glossaryItems.length).fill(false);
    
    quickToX.current = cardsRef.current
      .filter((el) => el !== null)
      .map((el) =>
        gsap.quickTo(el, 'x', {
          duration: 1,
          ease: 'power4.out',
          overwrite: 'auto',
        })
      );
    quickToY.current = cardsRef.current
      .filter((el) => el !== null)
      .map((el) =>
        gsap.quickTo(el, 'y', {
          duration: 1,
          ease: 'power4.out',
          overwrite: 'auto',
        })
      );
    quickToRot.current = cardsRef.current
      .filter((el) => el !== null)
      .map((el) =>
        gsap.quickTo(el, 'rotation', {
          duration: 1,
          ease: 'power4.out',
          overwrite: 'auto',
        })
      );
  }, [prefersReducedMotion, isInView, glossaryItems.length]);

  // 2) Pointer-driven "knock" effect, per-card, using only cached values
  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion || !isInView) return;
    
    let lastMouse = { x: 0, y: 0 };
    let rafId: number;
    let rafRunning = true;
    const radius = 100; // px

    const loop = () => {
      if (!rafRunning || !containerRef.current) {
        rafRunning = false;
        return;
      }
      
      const { left, top } = containerRef.current.getBoundingClientRect();
      const px = mouse.x - left;
      const py = mouse.y - top;

      // Handle dragging
      if (isDragging.current && draggedCard !== null) {
        const card = cardsRef.current[draggedCard];
        if (card) {
          const dx = px - dragStartMouse.current.x;
          const dy = py - dragStartMouse.current.y;
          const newX = (dragStartTransform.current.x ?? 0) + dx;
          const newY = (dragStartTransform.current.y ?? 0) + dy;

          // Update card position directly
          gsap.set(card, { x: newX, y: newY });

          // Update the transform cache
          const cardRect = card.getBoundingClientRect();
          const centerX = (cardRect.left + cardRect.right) / 2 - left;
          const centerY = (cardRect.top + cardRect.bottom) / 2 - top;

          transformsRef.current[draggedCard] = {
            xEnd: newX,
            yEnd: newY,
            rotEnd: transformsRef.current[draggedCard]?.rotEnd ?? 0,
            centerX,
            centerY,
          };
        }
        lastMouse = { x: px, y: py };
        rafId = requestAnimationFrame(loop);
        return;
      }

      // compute pointer "velocity"
      const vx = px - lastMouse.x;
      const vy = py - lastMouse.y;
      const vMag = Math.hypot(vx, vy);

      transformsRef.current.forEach((transform, i) => {
        // Skip the dragged card
        if (i === draggedCard) return;
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
      
      if (rafRunning) {
        rafId = requestAnimationFrame(loop);
      }
    };

    loop();
    
    return () => {
      rafRunning = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [mouse, prefersReducedMotion, isInView, draggedCard]);

  // Drag event handlers - optimized with useCallback
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, cardIndex: number) => {
      if (prefersReducedMotion) return;

      e.preventDefault();
      const card = cardsRef.current[cardIndex];
      if (!card || !containerRef.current) return;

      // Stop any entrance/ongoing tweens that could fight the drag
      gsap.killTweensOf(card);

      const containerRect = containerRef.current.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const startPx = mouse.x - containerRect.left;
      const startPy = mouse.y - containerRect.top;

      // Calculate offset from mouse to card center
      const cardCenterX =
        (cardRect.left + cardRect.right) / 2 - containerRect.left;
      const cardCenterY =
        (cardRect.top + cardRect.bottom) / 2 - containerRect.top;

      dragOffset.current = {
        x: mouse.x - containerRect.left - cardCenterX,
        y: mouse.y - containerRect.top - cardCenterY,
      };

      // Record starting mouse position and element transform for delta-based dragging
      dragStartMouse.current = { x: startPx, y: startPy };
      dragStartTransform.current = {
        x: (Number(gsap.getProperty(card, 'x')) as number) || 0,
        y: (Number(gsap.getProperty(card, 'y')) as number) || 0,
      };

      // Visually scale on drag start without interfering with translation
      currentScale.current = 1.05;
      gsap.to(card, {
        scale: 1.05,
        duration: 0.15,
        ease: 'power2.out',
        overwrite: 'auto',
        transformOrigin: '50% 50%',
      });

      setDraggedCard(cardIndex);
      isDragging.current = true;
      setIsDraggingState(true);
    },
    [prefersReducedMotion, mouse]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging.current && draggedCard !== null) {
      isDragging.current = false;
      setIsDraggingState(false);
      // Reset scale
      const card = cardsRef.current[draggedCard];
      currentScale.current = 1;
      if (card) {
        gsap.to(card, {
          scale: 1,
          duration: 0.15,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
      setDraggedCard(null);
    }
  }, [draggedCard]);

  // Global mouse up listener
  useEffect(() => {
    if (isDraggingState) {
      const handleGlobalMouseUp = () => handleMouseUp();
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mouseleave', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('mouseleave', handleGlobalMouseUp);
      };
    }
  }, [isDraggingState, handleMouseUp]);

  return (
    <div ref={containerRef} className={styles.cardsContainer}>
      {glossaryItems.map((item, i) => (
        <div
          key={item.id}
          ref={(el) => {
            if (el) cardsRef.current[i] = el;
          }}
          className={styles.card}
          style={{
            opacity: prefersReducedMotion ? 1 : 0,
            cursor: isDraggingState && draggedCard === i ? 'grabbing' : 'grab',
            zIndex: isDraggingState && draggedCard === i ? 1000 : 'auto',
          }}
          onMouseDown={(e) => handleMouseDown(e, i)}
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
