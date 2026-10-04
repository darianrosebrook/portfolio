import { render, screen } from '@testing-library/react';
import { ReducedMotionProvider } from '@/context/ReducedMotionContext';
import CaseStudyPage, {
  formatPublishedDate,
  readingMinutes,
} from '@/app/work/_components/CaseStudyPage';

const words = (n: number) =>
  `<p>${Array.from({ length: n }, (_, i) => `w${i}`).join(' ')}</p>`;

describe('readingMinutes', () => {
  it('counts words in the text, not in tags or attributes', () => {
    // 460 words of text at 230 wpm; the markup around them must not add to the count
    const html = `<div class="table-scroll" role="region" aria-label="Table: a, b">${words(460)}</div>`;
    expect(readingMinutes(html)).toBe(2);
  });

  it('rounds to the nearest minute and never reports less than one for any text', () => {
    expect(readingMinutes(words(10))).toBe(1);
    expect(readingMinutes(words(2382))).toBe(10);
  });

  it('reports zero for a body with no words', () => {
    expect(readingMinutes('')).toBe(0);
    expect(readingMinutes('<p></p><img src="/x.png" alt="">')).toBe(0);
  });
});

describe('formatPublishedDate', () => {
  it('formats the UTC calendar date so server and browser render the same text', () => {
    expect(formatPublishedDate('2026-10-04T23:30:00+00:00')).toBe(
      'October 4, 2026'
    );
    expect(formatPublishedDate('2026-10-04T01:00:00+00:00')).toBe(
      'October 4, 2026'
    );
  });

  it('returns null for a missing or unparseable timestamp', () => {
    expect(formatPublishedDate(null)).toBeNull();
    expect(formatPublishedDate('not a date')).toBeNull();
  });
});

function renderPage(
  overrides: Partial<Parameters<typeof CaseStudyPage>[0]['data']> = {}
) {
  return render(
    <ReducedMotionProvider>
      <CaseStudyPage
        data={{
          headline: 'Can You Induce a Domain?',
          alternativeHeadline: null,
          description: 'A worked example.',
          image: null,
          published_at: '2026-10-04T18:00:00+00:00',
          html: words(700),
          ...overrides,
        }}
      />
    </ReducedMotionProvider>
  );
}

describe('CaseStudyPage header', () => {
  it('shows the case-study label, the publish date and the reading time', () => {
    const { container } = renderPage();

    expect(screen.getByText('Case study')).toBeInTheDocument();
    const time = container.querySelector('header time');
    expect(time?.getAttribute('datetime')).toBe('2026-10-04T18:00:00+00:00');
    expect(time?.textContent).toBe('October 4, 2026');
    expect(screen.getByText('3 min read')).toBeInTheDocument();
  });

  it('omits the reading time for an empty body and the date when there is none', () => {
    const { container } = renderPage({ html: '', published_at: null });

    expect(container.querySelector('header time')).toBeNull();
    expect(screen.queryByText(/min read/)).toBeNull();
  });

  it('renders the page as one article without nesting a second main landmark', () => {
    const { container } = renderPage();

    expect(container.querySelector('article.case-study-page')).not.toBeNull();
    expect(container.querySelectorAll('main')).toHaveLength(0);
  });
});
