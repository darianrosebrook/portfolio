'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CaseStudy } from '@/types';
import ContentEditor from '../../_components/ContentEditor';

export default function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [record, setRecord] = useState<CaseStudy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setRecord(null);
    setError(null);
    void (async () => {
      try {
        const { slug } = await params;
        if (!active) return;
        const response = await fetch(
          `/api/case-studies/${encodeURIComponent(slug)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? 'This case study could not be found.'
              : 'The case study could not be loaded. Try again.'
          );
        }
        const data = await response.json();
        if (
          !data ||
          !Number.isSafeInteger(data.id) ||
          typeof data.slug !== 'string'
        ) {
          throw new Error(
            'The server returned an invalid case study. Try again.'
          );
        }
        if (active) setRecord(data);
      } catch (failure) {
        if (active)
          setError(
            failure instanceof Error
              ? failure.message
              : 'The case study could not be loaded.'
          );
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [params, attempt]);

  if (error)
    return (
      <div role="alert">
        <p>{error}</p>
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          Try again
        </button>
        <p>
          <Link href="/dashboard/case-studies">Back to Case Studies</Link>
        </p>
      </div>
    );
  if (!record) return <p role="status">Loading case study…</p>;
  return (
    <div>
      <h2>Edit: {record.slug}</h2>
      <ContentEditor initial={record} entity="case-studies" />
    </div>
  );
}
