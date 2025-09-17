import * as React from 'react';

export interface CaseStudyContentProps {
  html: string;
  /** Optional site origin used to decide whether links are external */
  siteOrigin?: string;
}

function enhanceHtml(html: string, siteOrigin?: string): string {
  let output = html;

  // Add lazy-loading and async decoding to images that lack them
  output = output.replace(/<img\b([^>]*?)>/g, (_m, attrs: string) => {
    const hasLoading = /\bloading\s*=/.test(attrs);
    const hasDecoding = /\bdecoding\s*=/.test(attrs);
    const nextAttrs = [
      attrs.trim(),
      hasLoading ? '' : 'loading="lazy"',
      hasDecoding ? '' : 'decoding="async"',
    ]
      .filter(Boolean)
      .join(' ');
    return `<img ${nextAttrs}>`;
  });

  // Add rel/target to external links (avoid touching same-origin or fragment/mailto/tel)
  output = output.replace(
    /<a\b([^>]*?)href=("|')(.*?)(\2)([^>]*)>/g,
    (
      _m,
      pre: string,
      quote: string,
      href: string,
      _q2: string,
      post: string
    ) => {
      const isFragment = href.startsWith('#');
      const isMailto = href.startsWith('mailto:');
      const isTel = href.startsWith('tel:');
      const isHttp = /^https?:\/\//i.test(href);
      const sameOrigin =
        siteOrigin && isHttp ? href.startsWith(siteOrigin) : false;
      if (!isHttp || isFragment || isMailto || isTel || sameOrigin) {
        return `<a${pre}href=${quote}${href}${quote}${post}>`;
      }
      const hasTarget = /\btarget\s*=/.test(pre + post);
      const hasRel = /\brel\s*=/.test(pre + post);
      const additions = [
        hasTarget ? '' : ' target="_blank"',
        hasRel ? '' : ' rel="noopener noreferrer"',
      ]
        .filter(Boolean)
        .join('');
      return `<a${pre}href=${quote}${href}${quote}${post}${additions}>`;
    }
  );

  return output;
}

export default function CaseStudyContent({
  html,
  siteOrigin,
}: CaseStudyContentProps) {
  const enhanced = React.useMemo(
    () => enhanceHtml(html, siteOrigin),
    [html, siteOrigin]
  );
  return (
    <div
      className="case-study-content"
      dangerouslySetInnerHTML={{ __html: enhanced }}
    />
  );
}
