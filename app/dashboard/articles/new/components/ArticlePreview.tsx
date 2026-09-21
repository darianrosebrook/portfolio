'use client';

import styles from '@/app/articles/[slug]/styles.module.css';
import chrome from './ArticlePreview.module.css';
import type { Article } from '@/types';
import { Image } from '@/ui/components/Image';
import { processArticleContent } from '@/utils/tiptap/htmlGeneration';

interface ArticlePreviewProps {
  article: Partial<Article>;
  onClose: () => void;
}

/**
 * Article preview component
 * Shows how the article will look on the live site.
 *
 * Two style modules on purpose: `styles` is the public article page's own module,
 * borrowed so the preview matches the live site, and `chrome` is this overlay.
 */
export function ArticlePreview({ article, onClose }: ArticlePreviewProps) {
  if (!article.articleBody) {
    return <div className={chrome.empty}>No content to preview</div>;
  }

  const contents = processArticleContent(article.articleBody);
  const { html, h1Text, imageSrc } = contents;

  return (
    <div className={chrome.overlay}>
      <div className={chrome.bar}>
        <h2>Preview</h2>
        <div className={chrome.barActions}>
          <small className={chrome.hint}>Press Esc to close</small>
          <button
            type="button"
            className={chrome.closeButton}
            onClick={onClose}
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
              <Image
                src={article.image || imageSrc || ''}
                alt={article.headline || 'Article cover'}
                // Image forwards `style` to the inner <img> but `className` to its
                // container, so this one stays a style prop rather than moving the
                // sizing onto the wrong element.
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
