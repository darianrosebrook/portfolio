import type { FoundationPageContent } from '@/types/foundationContent';
import { generateFoundationLDJson } from '@/utils/ldjson';
import { EducationPageTemplate } from '../_components/EducationPageTemplate';

interface FoundationPageProps {
  content: FoundationPageContent;
}

/**
 * Server component wrapper for foundation pages.
 *
 * Renders the JSON-LD schema scripts here, in the server tree, so they are
 * present in the initial HTML. Client-rendered inline <script> elements are
 * not inserted into the DOM on hydration, so emitting them from the client
 * template leaves pages without structured data. The interactive education
 * template stays a client component beneath this wrapper.
 */
export function FoundationPage({ content }: FoundationPageProps) {
  const canonical = content.metadata.canonicalUrl;
  const jsonLdSchemas = generateFoundationLDJson({
    metadata: content.metadata,
    canonical,
  });

  return (
    <>
      {jsonLdSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <EducationPageTemplate content={content} />
    </>
  );
}
