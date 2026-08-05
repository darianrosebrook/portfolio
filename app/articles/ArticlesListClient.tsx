'use client';

import {
  AnimatedCard,
  AnimatedCardImage,
  AnimatedCardTitle,
} from '@/ui/components/AnimatedCard';
import ProfileFlag from '@/ui/components/ProfileFlag';
import Image from 'next/image';
import Link from 'next/link';
import Styles from './styles.module.css';
import { Profile } from '@/types';
import { EDITORIAL_STAGGER } from '@/utils/animation';
import { useScrollReveal } from '@/utils/animation/useScrollReveal';

type ArticleWithAuthor = {
  id: number;
  headline: string | null;
  description: string | null;
  image: string | null;
  slug: string;
  author: Profile;
  published_at: string | null;
};

interface ArticlesListClientProps {
  articles: ArticleWithAuthor[];
}

function ArticleCard({
  data,
  index,
}: {
  data: ArticleWithAuthor;
  index: number;
}) {
  // Handle null values with defaults
  const headline = data.headline ?? 'Untitled';
  const image = data.image ?? '/placeholder-image.jpg';
  let description = data.description ?? 'No description available';

  if (description.length > 240) {
    description = description.slice(0, 240) + '...';
  }

  const date = data.published_at
    ? new Date(data.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Date not available';

  return (
    <AnimatedCard
      as="article"
      className="card"
      delay={index * EDITORIAL_STAGGER.cards}
      triggerOnScroll={true}
      scrollStart="top 90%"
      enableHover={true}
    >
      <AnimatedCardImage className="media">
        <Link href={`/articles/${data.slug}`}>
          <Image src={image} alt={headline} width={300} height={200} />
        </Link>
      </AnimatedCardImage>
      <div className="meta">
        <ProfileFlag profile={data.author} />
        <small>
          <time dateTime={data.published_at ?? undefined}>{date}</time>
        </small>
      </div>
      <div>
        <AnimatedCardTitle as="h5">
          <Link href={`/articles/${data.slug}`}>{headline}</Link>
        </AnimatedCardTitle>
        <p>{description}</p>
      </div>
    </AnimatedCard>
  );
}

export default function ArticlesListClient({
  articles,
}: ArticlesListClientProps) {
  // Page-level fade in. Resting state is visible, so the list renders without
  // JS; the hook applies the hidden start state and reveal only when motion is
  // allowed.
  const sectionRef = useScrollReveal<HTMLElement>({ variant: 'fade' });

  return (
    <section ref={sectionRef} className={`grid content ${Styles.articleGrid}`}>
      {articles.length > 0 &&
        articles.map((article, index) => (
          <ArticleCard key={article.id} data={article} index={index} />
        ))}
    </section>
  );
}
