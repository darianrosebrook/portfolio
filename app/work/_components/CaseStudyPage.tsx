'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/context/ReducedMotionContext';
import { AnimatedText } from '@/ui/components/AnimatedText';
import { AnimatedSection } from '@/ui/components/AnimatedSection';
import CaseStudyContent from './CaseStudyContent';
import { EASING_PRESETS } from '@/utils/animation';

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
}

interface CaseStudyPageProps {
  data: CaseStudyData;
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

  return (
    <div className="case-study-page">
      <header ref={headerRef}>
        {data.headline && (
          <AnimatedText
            text={data.headline}
            as="h1"
            variant="blur-in"
            delay={0.1}
          />
        )}
        {data.description && <p className="description">{data.description}</p>}
      </header>

      <main>
        <AnimatedSection
          as="div"
          className="content"
          variant="fade-up"
          delay={0.5}
          triggerOnScroll={false}
        >
          <CaseStudyContent html={data.html} />
        </AnimatedSection>
      </main>
    </div>
  );
}
