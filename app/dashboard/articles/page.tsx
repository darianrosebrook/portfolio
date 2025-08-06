import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import ProfileFlag from '@/components/ProfileFlag';
import styles from './page.module.scss';
import { Article } from '@/types';
async function getData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select(` *,  author(*)  `)
    .order('published_at', { ascending: false });
  return data;
}
function Card(data: Article) {
  const url = `/dashboard/articles/${data.slug}/edit`;
  let { description } = data;
  if (description?.length && description.length > 240) {
    description = description.slice(0, 240) + '...';
  }
  const date = new Date(
    data.published_at || data.created_at || new Date()
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <article className="card">
      <div className="media">
        <Link href={url}>
          <Image
            src={data.image || '/darianrosebrook.jpg'}
            alt={data.headline || 'Article'}
            width={300}
            height={200}
            loading="lazy"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 300px"
          />
        </Link>
        <div className="meta">
          <ProfileFlag
            profile={typeof data.author === 'string' ? null : data.author}
          />
          <small>
            <time dateTime={date} className="small" title={date}>
              {date}
            </time>
          </small>
        </div>
      </div>
      <div>
        <Link href={url}>
          <p className="medium">{data.headline}</p>
        </Link>
        <p>{description}</p>
      </div>
    </article>
  );
}
export default async function Page() {
  const articles = await getData();
  return (
    <div className={styles.articleGrid}>
      <div>
        <Link href="articles/edit">New Article</Link>
      </div>
      {articles?.map((article: Article) => (
        <Card key={article.id} {...article} />
      ))}
    </div>
  );
}
