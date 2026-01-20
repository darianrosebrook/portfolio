'use client';

import NextImage from 'next/image';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/context/ReducedMotionContext';
import { AnimatedText } from '@/ui/components/AnimatedText';
import { AnimatedSection } from '@/ui/components/AnimatedSection';
import {
  AnimatedCard,
  AnimatedCardImage,
  AnimatedCardTitle,
} from '@/ui/components/AnimatedCard';
import ProfileFlag from '@/ui/components/ProfileFlag';
import ShareLinks from './ShareLinks';
import styles from './styles.module.scss';
import { EASING_PRESETS, EDITORIAL_STAGGER } from '@/utils/animation';
import { Profile } from '@/types';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ArticleData {
  headline: string;
  alternativeHeadline?: string;
  articleSection?: string;
  keywords?: string;
  published_at: string;
  image: string;
  html: string;
  author: Profile;
  beforeArticle?: {
    slug: string;
    headline: string;
    image: string;
  } | null;
  afterArticle?: {
    slug: string;
    headline: string;
    image: string;
  } | null;
}

interface ArticleDetailClientProps {
  article: ArticleData;
  canonical: string;
  ldJson: Record<string, unknown>;
}

export default function ArticleDetailClient({
  article,
  canonical,
  ldJson,
}: ArticleDetailClientProps) {
  const { prefersReducedMotion } = useReducedMotion();
  const imageRef = useRef<HTMLDivElement>(null);
  const ledeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Animate the hero image
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, scale: 1.02 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: EASING_PRESETS.smooth,
            delay: 0.3,
          }
        );
      }

      // Animate the lede section children with stagger
      if (ledeRef.current) {
        // First, make the container visible
        gsap.set(ledeRef.current, { opacity: 1 });
        
        // Then animate the children
        const children = ledeRef.current.children;
        gsap.fromTo(
          children,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: EASING_PRESETS.smooth,
            stagger: EDITORIAL_STAGGER.sections,
            delay: 0.1,
          }
        );
      }
    });

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section className="content">
      <article className={styles.articleContent}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
        <div
          ref={ledeRef}
          className={styles.articleLede}
          style={{ opacity: prefersReducedMotion ? 1 : 0 }}
        >
          {article.articleSection && (
            <p className="small uppercase">
              {article.articleSection}
              {article.keywords &&
                ` |  ${article.keywords.split(',').join(' | ')}`}
            </p>
          )}
          <AnimatedText
            text={article.headline}
            as="h1"
            variant="blur-in"
            delay={0.2}
          />
          {article.alternativeHeadline && (
            <h2 className="medium light">{article.alternativeHeadline}</h2>
          )}
          <hr />
          <div className={styles.meta}>
            <div className={styles.byline}>
              <p className="small">
                Published on{' '}
                <time dateTime={article.published_at}>
                  <small className="bold">
                    {new Date(article.published_at).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </small>
                </time>{' '}
                by
              </p>
              <ProfileFlag profile={article.author} />
            </div>
            <ShareLinks url={canonical} article={article} />
          </div>
        </div>
        <div
          ref={imageRef}
          style={{ opacity: prefersReducedMotion ? 1 : 0 }}
        >
          <NextImage
            src={article.image}
            alt={article.headline}
            width={500}
            height={300}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 500px"
          />
        </div>
        <p className="caption"></p>
        <AnimatedSection
          as="div"
          variant="fade-up"
          delay={0.5}
          triggerOnScroll={false}
        >
          <div
            className={styles.articleContent}
            dangerouslySetInnerHTML={{ __html: article.html }}
          />
        </AnimatedSection>
        <div className={styles.prev_next}>
          {article.beforeArticle ? (
            <AnimatedCard
              as="article"
              className="card"
              delay={0.1}
              triggerOnScroll={true}
            >
              <h3>Previous</h3>
              <a href={`/articles/${article.beforeArticle.slug}`}>
                <AnimatedCardImage>
                  <NextImage
                    src={article.beforeArticle.image}
                    alt={article.beforeArticle.headline}
                    width={100}
                    height={100}
                  />
                </AnimatedCardImage>
                <AnimatedCardTitle as="h5">
                  {article.beforeArticle.headline}
                </AnimatedCardTitle>
              </a>
            </AnimatedCard>
          ) : (
            <span></span>
          )}
          {article.afterArticle ? (
            <AnimatedCard
              as="article"
              className="card"
              delay={0.2}
              triggerOnScroll={true}
            >
              <h3>Next</h3>
              <a href={`/articles/${article.afterArticle.slug}`}>
                <AnimatedCardImage>
                  <NextImage
                    src={article.afterArticle.image}
                    alt={article.afterArticle.headline}
                    width={100}
                    height={100}
                  />
                </AnimatedCardImage>
                <AnimatedCardTitle as="h5">
                  {article.afterArticle.headline}
                </AnimatedCardTitle>
              </a>
            </AnimatedCard>
          ) : (
            <span></span>
          )}
        </div>
      </article>
    </section>
  );
}
