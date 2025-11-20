'use client';

import styles from '@/app/articles/[slug]/styles.module.scss';
import type { Article } from '@/types';
import { processArticleContent } from '@/utils/tiptap/htmlGeneration';

interface ArticlePreviewProps {
  article: Partial<Article>;
  onClose: () => void;
}

/**
 * Article preview component
 * Shows how the article will look on the live site
 */
export function ArticlePreview({ article, onClose }: ArticlePreviewProps) {
  if (!article.articleBody) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--semantic-color-foreground-secondary)',
        }}
      >
        No content to preview
      </div>
    );
  }

  const contents = processArticleContent(article.articleBody);
  const { html, h1Text, imageSrc } = contents;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--semantic-color-background-primary)',
        zIndex: 1000,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'var(--semantic-color-background-primary)',
          borderBottom: '1px solid var(--semantic-color-border-primary)',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1001,
        }}
      >
        <h2>Preview</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <small
            style={{ color: 'var(--semantic-color-foreground-secondary)' }}
          >
            Press Esc to close
          </small>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--semantic-color-border-primary)',
              borderRadius: 'var(--core-shape-radius-small)',
              background: 'var(--semantic-color-background-secondary)',
              color: 'var(--semantic-color-foreground-primary)',
              cursor: 'pointer',
            }}
          >
            Close Preview
          </button>
        </div>
      </div>

      <section className="content">
        <article className={styles.articleContent}>
          <div className={styles.articleLede}>
            {article.articleSection && (
              <p className="small uppercase">
                {article.articleSection}
                {article.keywords &&
                  ` |  ${article.keywords.split(',').join(' | ')}`}
              </p>
            )}
            <h1>{article.headline || h1Text || 'Untitled'}</h1>
            {article.alternativeHeadline && (
              <h2 className="medium light">{article.alternativeHeadline}</h2>
            )}
            <hr />
            <div className={styles.meta}>
              <div className={styles.byline}>
                <p className="small">
                  {article.published_at ? (
                    <>
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
                      </time>
                    </>
                  ) : (
                    'Draft - Not published'
                  )}
                </p>
              </div>
            </div>
          </div>
          {(article.image || imageSrc) && (
            <>
              <img
                src={article.image || imageSrc || ''}
                alt={article.headline || 'Article cover'}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 'var(--core-shape-radius-medium)',
                  marginBottom: '1rem',
                }}
              />
              <p className="caption"></p>
            </>
          )}
          <div
            className={styles.articleContent}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </section>
    </div>
  );
}
