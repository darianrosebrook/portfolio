import { render } from '@testing-library/react';
import { ReducedMotionProvider } from '@/context/ReducedMotionContext';
import WorkPageClient from '@/app/work/WorkPageClient';

function caseStudyHrefs(): string[] {
  const { container } = render(
    <ReducedMotionProvider>
      <WorkPageClient />
    </ReducedMotionProvider>
  );
  return [...container.querySelectorAll('a[href^="/work/"]')].map(
    (a) => a.getAttribute('href') ?? ''
  );
}

describe('WorkPageClient', () => {
  it('links to the induction case study', () => {
    expect(caseStudyHrefs()).toContain(
      '/work/can-you-induce-a-domain-you-do-not-already-understand'
    );
  });

  it('links only to case studies that are published', () => {
    // design-process was unpublished: its body was empty
    expect(caseStudyHrefs().sort()).toEqual([
      '/work/can-you-induce-a-domain-you-do-not-already-understand',
      '/work/definition-of-done',
      '/work/iconography-sync',
    ]);
  });
});
