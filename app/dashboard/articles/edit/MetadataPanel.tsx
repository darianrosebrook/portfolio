'use client';

import { Article } from '@/types';
import Link from 'next/link';
import ToggleSwitch from '@/components/ToggleSwitch';
import { calculateReadingTime } from '@/utils';

type MetadataPanelProps = {
  article: Article;
  onUpdate: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onPublish: () => void;
  onToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const MetadataPanel = ({
  article,
  onUpdate,
  onPublish,
  onToggle,
}: MetadataPanelProps) => {
  return (
    <div>
      <div>
        <Link href={`/dashboard/articles/${article.slug}/preview`}>
          Preview
        </Link>
        <button className="publishButton" onClick={onPublish}>
          {article.status === 'draft' ? 'Save Draft' : 'Publish'}
        </button>
      </div>
      <div>
        <label htmlFor="headline">Headline</label>
        <input
          type="text"
          name="headline"
          placeholder="Title"
          value={article.headline || ''}
          onChange={onUpdate}
        />
      </div>
      <div>
        <label htmlFor="alternativeHeadline">Alternative Headline</label>
        <input
          type="text"
          name="alternativeHeadline"
          placeholder="Alternative Headline"
          value={article.alternativeHeadline || ''}
          onChange={onUpdate}
        />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          name="description"
          placeholder="Description"
          value={article.description || ''}
          onChange={onUpdate}
        />
      </div>
      <div>
        <label htmlFor="keywords">Keywords</label>
        <input
          type="text"
          name="keywords"
          placeholder="Keywords"
          value={article.keywords || ''}
          onChange={onUpdate}
        />
      </div>
      <div>
        <label htmlFor="image">Image</label>
        <input
          type="text"
          name="image"
          placeholder="Image URL"
          value={article.image || ''}
          onChange={onUpdate}
        />
      </div>
      <div>
        <label htmlFor="slug">Slug</label>
        <input
          type="text"
          name="slug"
          placeholder="Slug"
          value={article.slug || ''}
          onChange={onUpdate}
        />
      </div>
      <div>
        <label htmlFor="articleSection">Article Section</label>
        <input
          type="text"
          name="articleSection"
          placeholder="Article Section"
          value={article.articleSection || ''}
          onChange={onUpdate}
        />
      </div>
      <div>
        <label htmlFor="published_at">published_at</label>
        <input
          type="date"
          name="published_at"
          value={
            article.created_at
              ? new Date(article.created_at).toISOString().split('T')[0]
              : ''
          }
          onChange={onUpdate}
        />
      </div>
      <p>
        Reading time:{' '}
        <strong>{calculateReadingTime(article.wordCount)} minute read</strong>
      </p>
      <ToggleSwitch checked={article.status === 'draft'} onChange={onToggle}>
        Draft
      </ToggleSwitch>
    </div>
  );
};

export default MetadataPanel;
