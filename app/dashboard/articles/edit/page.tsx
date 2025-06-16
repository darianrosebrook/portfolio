'use client';
import { useState } from 'react';
import { Tiptap } from '@/components/Tiptap';
import { Article } from '@/types';

import { calculateReadingTime, debounce } from '@/utils';
import { beforeArticleUpdate } from '@/utils/supabase/article-cleanup';

import ToggleSwitch from '@/components/ToggleSwitch';
import Link from 'next/link';

import styles from './page.module.scss';

const articleDefaults: Article = {
  alternativeHeadline: '',
  articleSection: '',
  articleBody: {},
  author: null,
  created_at: new Date().toISOString(),
  description: '',
  draft: true,
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
    setArticle({ ...article, draft: e.target.checked });
  };

  const pushChanges = async (article: Article) => {
    // Run image cleanup before saving if we have an article ID
    if (article.id && article.articleBody) {
      await beforeArticleUpdate(article.id, article.articleBody);
    }

    // push changes to the server
    // You would implement your actual save logic here
  };

  const handleUpdate = debounce((article: Article) => {
    const updatedArticle = { ...article };
    updatedArticle.headline = getH1FromArticleBody(updatedArticle.articleBody);
    updatedArticle.alternativeHeadline = updatedArticle.headline;
    updatedArticle.modified_at = updatedArticle.published_at
      ? new Date().toISOString()
      : null;
    updatedArticle.slug =
      (updatedArticle.headline &&
        createSlugFromHeadline(updatedArticle.headline)) ||
      null;
    updatedArticle.image = getArticleImage(updatedArticle.articleBody);
    pushChanges(updatedArticle);
  }, 1000); // If the user stops typing for 10 seconds, push the changes to the server

  const handlePublish = async () => {
    // Run image cleanup before publishing
    if (article.id && article.articleBody) {
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

  const getH1FromArticleBody = (articleBody) => {
    if (!articleBody?.content) {
      return null;
    }
    const h1 = articleBody.content.find(
      (node) => node.type === 'heading' && node.attrs?.level === 1
    );
    return h1?.content?.[0]?.text ?? null;
  };

  const getArticleImage = (articleBody) => {
    if (!articleBody?.content) {
      return null;
    }
    const image = articleBody.content.find((node) => node.type === 'image');
    return image?.attrs?.src ?? null;
  };

  const createSlugFromHeadline = (headline: string) => {
    return headline
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const parseUpdateFromInput = (e) => {
    setArticle({ ...article, [e.target.name]: e.target.value });
    handleUpdate(article);
  };

  return (
    <div className={styles.editorGroups}>
      <div className={styles.publishBar}>
        <Link href={`/dashboard/articles/${article.slug}/preview`}>
          Preview
        </Link>
        <button className="publishButton" onClick={handlePublish}>
          {article.draft ? 'Save Draft' : 'Publish'}
        </button>
      </div>
      <div className="grid">
        <div>
          <label htmlFor="headline">Headline</label>
          <input
            type="text"
            name="headline"
            placeholder="Title"
            value={article.headline}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="alternativeHeadline">Alternative Headline</label>
          <input
            type="text"
            name="alternativeHeadline"
            placeholder="Alternative Headline"
            value={article.alternativeHeadline}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            placeholder="Description"
            value={article.description}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="keywords">Keywords</label>
          <input
            type="text"
            name="keywords"
            placeholder="Keywords"
            value={article.keywords}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="image">Image</label>
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={article.image}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="slug">Slug</label>
          <input
            type="text"
            name="slug"
            placeholder="Slug"
            value={article.slug}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="articleSection">Article Section</label>
          <input
            type="text"
            name="articleSection"
            placeholder="Article Section"
            value={article.articleSection}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="published_at">published_at</label>
          <input
            type="date"
            name="published_at"
            value={
              article.created_at &&
              new Date(article.created_at).toISOString().split('T')[0]
            }
            onChange={parseUpdateFromInput}
          />
        </div>
      </div>
      <p className="minuteInWords">
        Reading time:{' '}
        <strong>{calculateReadingTime(article.wordCount)} minute read</strong>
      </p>
      <ToggleSwitch checked={article.draft} onChange={handleToggle}>
        Draft
      </ToggleSwitch>
      <div className={styles.articleContent}>
        <Tiptap handleUpdate={handleUpdate} article={article} />
      </div>
    </div>
  );
};

export default EditArticle;
