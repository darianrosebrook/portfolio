'use client';
import { useEffect, useState } from 'react';
import { Article } from '@/types';
import ContentEditor from '../../_components/ContentEditor';

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    (async () => {
      const { slug } = await params;
      const res = await fetch(`/api/articles/${slug}`);
      const data = await res.json();
      setArticle(data);
    })();
  }, [params]);

  if (!article) return <p>Loading…</p>;

  return (
    <div>
      <h2>Edit: {article.slug}</h2>
      <ContentEditor initial={article} entity="articles" />
    </div>
  );
}
