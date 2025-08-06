'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { EditorErrorBoundary } from '@/components/ErrorBoundary';

// Dynamically import Tiptap editor for better performance
const Tiptap = dynamic(
  () => import('@/components/Tiptap').then((mod) => ({ default: mod.Tiptap })),
  {
    loading: () => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '500px',
          color: 'var(--color-foreground-secondary)',
          border: '1px solid var(--color-border-primary)',
          borderRadius: 'var(--radius-02)',
          background: 'var(--color-background-secondary)',
        }}
      >
        <div>Loading editor...</div>
      </div>
    ),
    ssr: false, // Tiptap editor requires client-side initialization
  }
);
import { Article } from '@/types';

import { debounce } from '@/utils';
import { beforeArticleUpdate } from '@/utils/supabase/article-cleanup';
import { extractMetadata } from '@/utils/metadata';

import styles from './page.module.scss';
import ArticleList from './ArticleList';
import MetadataPanel from './MetadataPanel';

const articleDefaults: Article = {
  id: 0, // Will be set by database on creation
  index: null,
  alternativeHeadline: '',
  articleSection: '',
  articleBody: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
  },
  author: null,
  created_at: new Date().toISOString(),
  description: '',
  status: 'draft',
  editor: '',
  headline: '',
  image: '',
  keywords: '',
  modified_at: new Date().toISOString(),
  published_at: '',
  wordCount: 0,
  slug: '',
};

const EditArticle = () => {
  const [article, setArticle] = useState(articleDefaults);
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArticle({
      ...article,
      status: e.target.checked ? 'draft' : 'published',
    });
  };

  const pushChanges = async (article: Partial<Article>) => {
    // Run image cleanup before saving if we have an article ID
    if (
      article.id &&
      article.articleBody &&
      typeof article.articleBody === 'object' &&
      'type' in article.articleBody
    ) {
      await beforeArticleUpdate(article.id, article.articleBody);
    }

    // push changes to the server
    // You would implement your actual save logic here
  };

  const handleUpdate = debounce((article: Partial<Article>) => {
    const updatedArticle = { ...article } as Article;
    let title = '';
    let description = '';
    let coverImage = '';
    let wordCount = 0;
    if (
      updatedArticle.articleBody &&
      typeof updatedArticle.articleBody === 'object' &&
      'type' in updatedArticle.articleBody
    ) {
      const meta = extractMetadata(updatedArticle.articleBody);
      title = meta.title ?? '';
      description = meta.description ?? '';
      coverImage = meta.coverImage ?? '';
      wordCount = meta.wordCount ?? 0;
    }

    updatedArticle.headline = title;
    updatedArticle.description = description;
    updatedArticle.image = coverImage;
    updatedArticle.wordCount = wordCount;
    updatedArticle.alternativeHeadline = title;
    updatedArticle.modified_at = updatedArticle.published_at
      ? new Date().toISOString()
      : null;

    if (!updatedArticle.slug && updatedArticle.headline) {
      updatedArticle.slug = createSlugFromHeadline(updatedArticle.headline);
    }
    setArticle(updatedArticle);
    pushChanges(updatedArticle);
  }, 1000) as (article: Partial<Article>) => void;

  const handlePublish = async () => {
    // Run image cleanup before publishing
    if (
      article.id &&
      article.articleBody &&
      typeof article.articleBody === 'object' &&
      'type' in article.articleBody
    ) {
      await beforeArticleUpdate(article.id, article.articleBody);
    }

    // publish the article
    const response = await fetch('/api/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(article),
    });
    return response;
  };

  const createSlugFromHeadline = (headline: string) => {
    return headline
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const parseUpdateFromInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const updatedArticle = { ...article, [e.target.name]: e.target.value };
    setArticle(updatedArticle);
    handleUpdate(updatedArticle);
  };

  return (
    <div className={styles.container}>
      <div className={styles.articleList}>
        <ArticleList
          onSelectArticle={setArticle}
          articleDefaults={articleDefaults}
        />
      </div>
      <div className={styles.editorContainer}>
        <EditorErrorBoundary>
          <Tiptap handleUpdate={handleUpdate} article={article} />
        </EditorErrorBoundary>
      </div>
      <div className={styles.metadataPanel}>
        <MetadataPanel
          article={article}
          onUpdate={parseUpdateFromInput}
          onPublish={handlePublish}
          onToggle={handleToggle}
        />
      </div>
    </div>
  );
};

export default EditArticle;
