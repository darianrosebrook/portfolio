'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/context/ReducedMotionContext';
import { AnimatedText } from '@/ui/components/AnimatedText';
import { AnimatedSection } from '@/ui/components/AnimatedSection';
import { RelatedContentSection } from '@/app/_components/RelatedContentSection';
import type { RelatedContentItem } from '@/utils/supabase/contentRelations';
import CaseStudyContent from './CaseStudyContent';
import { EASING_PRESETS } from '@/utils/animation';
import styles from './CaseStudyPage.module.css';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CaseStudyData {
  headline: string | null;
  alternativeHeadline: string | null;
  description: string | null;
  image: string | null;
  published_at: string | null;
  html: string;
  relations?: RelatedContentItem[];
  backlinks?: RelatedContentItem[];
}

interface CaseStudyPageProps {
  data: CaseStudyData;
}

const WORDS_PER_MINUTE = 230;

/** Estimated minutes to read the body text; 0 when the body has no words. */
export function readingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return words === 0 ? 0 : Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/**
 * Long-form date in UTC. Pinning the zone keeps the server render and the
 * browser hydration on the same calendar day.
 */
export function formatPublishedDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * CaseStudyPage component for displaying case study content
 * @param data - The case study data with HTML content
 */
export default function CaseStudyPage({ data }: CaseStudyPageProps) {
  const { prefersReducedMotion } = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  // Pre-paint (layout) effect: hides before the browser paints, so no inline
  // opacity is needed in the server markup and no-JS visitors see the content.
  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      const ctx = gsap.context(() => {
        // Animate description with fade-up
        if (headerRef.current) {
          const description = headerRef.current.querySelector('.description');
          if (description) {
            gsap.fromTo(
              description,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: EASING_PRESETS.smooth,
                delay: 0.4,
              }
            );
          }
        }
      });

      return () => ctx.revert();
    },
    { dependencies: [prefersReducedMotion] }
  );

  const publishedDate = formatPublishedDate(data.published_at);
  const minutes = readingMinutes(data.html);

  return (
    <article className={`case-study-page ${styles.page}`}>
      <header ref={headerRef} className={styles.header}>
        <p className={styles.kicker}>Case study</p>
        {data.headline && (
          <AnimatedText
            text={data.headline}
            as="h1"
            variant="blur-in"
            delay={0.1}
            className={styles.title}
          />
        )}
        {data.description && (
          <p className={`description ${styles.description}`}>
            {data.description}
          </p>
        )}
        {(publishedDate || minutes > 0) && (
          <p className={styles.meta}>
            {publishedDate && data.published_at && (
              <time dateTime={data.published_at}>{publishedDate}</time>
            )}
            {publishedDate && minutes > 0 && (
              <span aria-hidden="true" className={styles.separator}>
                ·
              </span>
            )}
            {minutes > 0 && <span>{minutes} min read</span>}
          </p>
        )}
      </header>

      <div className={styles.main}>
        <AnimatedSection
          as="div"
          className={`content ${styles.content}`}
          variant="fade-up"
          delay={0.5}
          triggerOnScroll={false}
        >
          <CaseStudyContent html={data.html} />
        </AnimatedSection>
        <RelatedContentSection
          relations={data.relations ?? []}
          backlinks={data.backlinks ?? []}
        />
      </div>
    </article>
  );
}
