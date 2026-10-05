import * as React from 'react';
import { sanitizeCmsHtml } from '@/utils/helpers/sanitizeHtml';

export interface CaseStudyContentProps {
  html: string;
  /** Optional site origin used to decide whether links are external */
  siteOrigin?: string;
}

/**
 * Quote-safe attribute text. Cell text reaches this step with double quotes
 * unescaped (the serializer only escapes &, < and > in text), so a quote would
 * otherwise close the attribute and let content add its own.
 */
function escapeAttribute(text: string): string {
  return text
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** "Table: <header cells>" from the first row after `tableStart`, or "Table". */
function tableLabel(html: string, tableStart: number): string {
  const rowEnd = html.indexOf('</tr>', tableStart);
  const firstRow = rowEnd === -1 ? '' : html.slice(tableStart, rowEnd);
  const headers = [...firstRow.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)]
    .map(([, cell]) =>
      cell
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean);
  return escapeAttribute(
    headers.length ? `Table: ${headers.join(', ')}` : 'Table'
  );
}

/**
 * Wrap each table in a focusable, labelled scroll region, so a table wider than
 * the reading column scrolls on its own instead of squeezing its cells to the
 * viewport. Open and close tags are wrapped separately, which keeps the output
 * balanced even for a table nested in a cell.
 */
export function wrapTables(html: string): string {
  return html
    .replace(
      /<table\b/gi,
      (open, offset: number) =>
        `<div class="table-scroll" role="region" tabindex="0" aria-label="${tableLabel(html, offset)}">${open}`
    )
    .replace(/<\/table>/gi, '</table></div>');
}

function enhanceHtml(html: string, siteOrigin?: string): string {
  let output = wrapTables(sanitizeCmsHtml(html));

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
