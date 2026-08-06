'use client';

import NextImage from 'next/image';
import { AnimatedText } from '@/ui/components/AnimatedText';
import { AnimatedSection } from '@/ui/components/AnimatedSection';
import {
  AnimatedCard,
  AnimatedCardImage,
  AnimatedCardTitle,
} from '@/ui/components/AnimatedCard';
import ProfileFlag from '@/ui/components/ProfileFlag';
import ShareLinks from './ShareLinks';
import styles from './styles.module.css';
import { EASING_PRESETS } from '@/utils/animation';
import { Profile } from '@/types';
import { useScrollReveal } from '@/utils/animation/useScrollReveal';

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
  // Lede children stagger in; the hero image scale-reveals. Resting state is
  // visible, so the article renders without JS.
  const ledeRef = useScrollReveal<HTMLDivElement>({
    target: 'children',
    variant: 'fade-up',
    duration: 0.6,
    delay: 0.1,
    ease: EASING_PRESETS.smooth,
  });
  const imageRef = useScrollReveal<HTMLDivElement>({
    variant: 'scale',
    duration: 0.8,
    delay: 0.3,
    ease: EASING_PRESETS.smooth,
  });

  return (
    <section className="content">
      <article className={styles.articleContent}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // Escape `<` so hostile CMS strings cannot break out of the script tag
            __html: JSON.stringify(ldJson).replace(/</g, '\\u003c'),
          }}
        />
        <div ref={ledeRef} className={styles.articleLede}>
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
        <div ref={imageRef}>
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
