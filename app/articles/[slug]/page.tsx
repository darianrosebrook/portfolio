import { createClient } from '@/utils/supabase/server';
// Next
import NextImage from 'next/image';

// TipTap

import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';

import { generateHTML } from '@tiptap/html';
import { JSONContent } from '@tiptap/react';
import { generateLDJson } from '@/utils/ldjson';

import styles from './styles.module.css';
import ProfileFlag from '@/ui/ProfileFlag';
import ShareLinks from './ShareLinks';

function getArticleContent(data: JSONContent) {
  let html: string = generateHTML(data, [CharacterCount, Image, StarterKit]);
  const h1FromHTML = html.match(/<h1>(.*?)<\/h1>/);
  const imageFromHTML = html.match(/<img(.*?)>/);
  if (h1FromHTML) {
    html = html.replace(h1FromHTML[0], '');
  }
  if (imageFromHTML) {
    html = html.replace(imageFromHTML[0], '');
  }
  const content = { h1FromHTML, imageFromHTML, html };
  return content;
}

async function getData(slug: string) {
  const supabase = await createClient();
  const { data: article } = await supabase
    .from('articles')
    .select('*, author(full_name, username, avatar_url)')
    .eq('slug', slug)
    .single();
  const published_at = article?.published_at || new Date().toISOString();
  const { data: beforeArticle } = await supabase
    .from('articles')
    .select(
      'author(full_name, username, avatar_url), slug, published_at, headline, image, description'
    )
    //  the article is published and the published date is less than the current date, limit to 1
    .eq('draft', false)
    .lt('published_at', published_at)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();
  const { data: afterArticle } = await supabase
    .from('articles')
    .select(
      'author(full_name, username, avatar_url), slug, published_at, headline, image, description'
    )
    //  the article is published and the published date is greater than the current date, limit to 1
    .eq('draft', false)
    .gt('published_at', published_at)
    .order('published_at', { ascending: true })
    .limit(1)
    .single();

  const contents = getArticleContent(article.articleBody);
  const { h1FromHTML, imageFromHTML, html } = contents;
  return {
    ...article,
    html,
    beforeArticle,
    afterArticle,
    h1FromHTML,
    imageFromHTML,
  };
}

/**
 * Generates dynamic metadata for the article page based on the slug parameter.
 * Fetches article data and constructs metadata for SEO, Open Graph, and Twitter cards.
 *
 * @param {Object} props - The props object containing route parameters.
 * @param {Object} props.params - The route parameters, including the article slug.
 * @returns {Promise<import('next').Metadata>} The metadata object for the page.
 */
export async function generateMetadata(props: { params: Params }) {
  const params = await props.params;
  const { slug } = params;
  const article = await getData(slug);
  const canonical = `https://darianrosebrook.com/articles/${slug}`;
  const openGraph = {
    title: article.headline,
    description: article.description,
    url: canonical,
    siteName: 'Darian Rosebrook | Product Designer',
    images: [
      {
        url: article.image,
        width: 800,
        height: 600,
        alt: article.headline,
      },
    ],
    locale: 'en_US',
    type: 'website',
  };
  const twitter = {
    card: 'summary_large_image',
    title: article.headline,
    description: article.description,
    creator: '@darianrosebrook',
    images: [article.image],
  };
  const meta = {
    category: 'Design',
    creator: 'Darian Rosebrook',
    description: article.description,
    title: article.headline + ' | Darian Rosebrook',
  };

  return { canonical, openGraph, twitter, ...meta };
}

type Params = Promise<{ slug: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const { slug } = params;
  const canonical = `https://darianrosebrook.com/articles/${slug}`;
  const article = await getData(slug);
  const ldJson = generateLDJson({
    article,
    canonical,
  });

  return (
    <section className="content">
      <article className={styles.articleContent}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
        <div className={styles.articleLede}>
          {article.articleSection && (
            <p className="small uppercase">
              {article.articleSection}
              {article.keywords &&
                ` |  ${article.keywords.split(',').join(' | ')}`}
            </p>
          )}
          <h1>{article.headline}</h1>
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
        <NextImage
          src={article.image}
          alt={article.headline}
          width={500}
          height={300}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 500px"
        />
        <p className="caption"></p>
        <div
          className={styles.articleContent}
          dangerouslySetInnerHTML={{ __html: article.html }}
        />
        <div className={styles.prev_next}>
          {article.beforeArticle ? (
            <article className="card">
              <h3>Previous</h3>
              <a href={`/articles/${article.beforeArticle.slug}`}>
                <NextImage
                  src={article.beforeArticle.image}
                  alt={article.beforeArticle.headline}
                  width={100}
                  height={100}
                />
                <h5>{article.beforeArticle.headline}</h5>
              </a>
            </article>
          ) : (
            <span></span>
          )}
          {article.afterArticle ? (
            <article className="card">
              <h3>Next</h3>
              <a href={`/articles/${article.afterArticle.slug}`}>
                <NextImage
                  src={article.afterArticle.image}
                  alt={article.afterArticle.headline}
                  width={100}
                  height={100}
                />
                <h5>{article.afterArticle.headline}</h5>
              </a>
            </article>
          ) : (
            <span></span>
          )}
        </div>
      </article>
    </section>
  );
}
