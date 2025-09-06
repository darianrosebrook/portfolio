'use client';
import { useEffect, useState } from 'react';
import type { CaseStudy } from '@/types';
import ContentEditor from '../../_components/ContentEditor';

export default function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [record, setRecord] = useState<CaseStudy | null>(null);

  useEffect(() => {
    (async () => {
      const { slug } = await params;
      const res = await fetch(`/api/case-studies/${slug}`);
      const data = await res.json();
      setRecord(data);
    })();
  }, [params]);

  if (!record) return <p>Loading…</p>;

  return (
    <div>
      <h2>Edit: {record.slug}</h2>
      <ContentEditor initial={record as CaseStudy} entity="case-studies" />
    </div>
  );
}
