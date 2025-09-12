import ProfileFlag from '@/ui/ProfileFlag';
import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import Styles from './styles.module.css';
import { Profile } from '@/types';

// Type for the specific fields we select in the query
type ArticleWithAuthor = {
  id: number;
  headline: string | null;
  description: string | null;
  image: string | null;
  slug: string;
  author: Profile;
  published_at: string | null;
};
async function getData(): Promise<ArticleWithAuthor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select(
      `
    id,
    headline,
    description,
    image,
    slug,
    author(*),
    published_at
    `
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  console.log(data, error);
  if (error) {
    console.error(error);
    return [] as ArticleWithAuthor[];
  }
  return data as unknown as ArticleWithAuthor[];
}
function Card(data: ArticleWithAuthor) {
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
    <article className="card">
      <div className="media">
        <Link href={`/articles/${data.slug}`}>
          <Image src={image} alt={headline} width={300} height={200} />
        </Link>
      </div>
      <div className="meta">
        <ProfileFlag profile={data.author} />
        <small>
          <time dateTime={data.published_at ?? undefined}>{date}</time>
        </small>
      </div>
      <div>
        <h5>
          <Link href={`/articles/${data.slug}`}>{headline}</Link>
        </h5>
        <p>{description}</p>
      </div>
    </article>
  );
}
export default async function Page() {
  const articles = await getData();
  return (
    <section className={`grid content ${Styles.articleGrid}`}>
      {articles.length > 0 &&
        articles.map((article) => <Card key={article.id} {...article} />)}
    </section>
  );
}
