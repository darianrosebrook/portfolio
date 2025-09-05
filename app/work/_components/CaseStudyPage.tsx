interface CaseStudyData {
  headline: string | null;
  alternativeHeadline: string | null;
  description: string | null;
  image: string | null;
  published_at: string | null;
  html: string;
}

interface CaseStudyPageProps {
  data: CaseStudyData;
}

/**
 * CaseStudyPage component for displaying case study content
 * @param data - The case study data with HTML content
 */
export default function CaseStudyPage({ data }: CaseStudyPageProps) {
  return (
    <div className="case-study-page">
      <header>
        <h1>{data.headline}</h1>
        {data.description && <p className="description">{data.description}</p>}
      </header>

      <main>
        {/* TODO: Implement proper content rendering */}
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: data.html }}
        />
      </main>
    </div>
  );
}
