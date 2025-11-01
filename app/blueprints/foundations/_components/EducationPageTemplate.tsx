'use client';

import { useReducedMotion } from '@/context/ReducedMotionContext';
import type { FoundationPageContent } from '@/types/foundationContent';
import type { TrackId } from '@/types/tracks';
import Tabs from '@/ui/components/Tabs';
import Link from 'next/link';
import React, { useEffect, useMemo } from 'react';
import { getAssessmentRubric } from '../_lib/assessmentRubrics';
import {
  trackCrossReferenceClick,
  trackFoundationPageView,
} from '../_lib/metrics';
import { getSectionRelevance } from '../_lib/tracks';
import { AlignmentNotice } from './AlignmentNotice';
import { AssessmentRubricComponent } from './AssessmentRubric';
import { AuthorProfile } from './AuthorProfile';
import { ComponentReference } from './ComponentReference';
import { ConceptLinkComponent } from './ConceptLink';
import styles from './EducationPageTemplate.module.scss';
import { FeedbackForm } from './FeedbackForm';
import { GlossaryPopover } from './GlossaryPopover';
import { ReflectionCallout } from './ReflectionCallout';
import { TrackBadge } from './TrackBadge';
import { TrackSelector } from './TrackSelector';

interface EducationPageTemplateProps {
  content: FoundationPageContent;
  jsonLd?: object | object[]; // Support single schema or array of schemas
}

export function EducationPageTemplate({
  content,
  jsonLd,
}: EducationPageTemplateProps) {
  useReducedMotion(); // Respect reduced motion preferences

  const [selectedTrack, setSelectedTrack] = React.useState<TrackId | null>(
    null
  );

  // Load saved track preference from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('foundation_selected_track');
      if (
        saved &&
        ['designer', 'developer', 'cross-functional'].includes(saved)
      ) {
        setSelectedTrack(saved as TrackId);
      }
    }
  }, []);

  // Track page view on mount
  useEffect(() => {
    trackFoundationPageView(content.metadata.slug);
  }, [content.metadata.slug]);

  // Sort sections by order
  const sortedSections = useMemo(() => {
    return [...content.sections].sort((a, b) => a.order - b.order);
  }, [content.sections]);

  // Helper to render content with glossary popovers
  const renderContentWithGlossary = (
    contentNode: React.ReactNode,
    glossaryIds: string[]
  ): React.ReactNode => {
    if (!contentNode || glossaryIds.length === 0) return contentNode;

    // For now, return content as-is
    // In the future, we could parse text and wrap glossary terms
    return contentNode;
  };

  const renderSection = (section: (typeof content.sections)[0]) => {
    switch (section.type) {
      case 'meta-header':
        return (
          <header className={styles.metaHeader} id={section.id}>
            <div className={styles.headerContent}>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>{content.metadata.title}</h1>
                <div className={styles.metadata}>
                  <span
                    className={styles.badge}
                    data-level={content.metadata.learning.learning_level}
                  >
                    {content.metadata.learning.learning_level}
                  </span>
                  <span className={styles.readingTime}>
                    {content.metadata.learning.estimated_reading_time} min read
                  </span>
                  {content.metadata.learning.role_relevance.map((role) => (
                    <span key={role} className={styles.roleBadge}>
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              <p className={styles.description}>
                {content.metadata.description}
              </p>
            </div>
            <AuthorProfile
              author={content.metadata.author}
              publishedDate={content.metadata.published_at}
              modifiedDate={content.metadata.modified_at}
            />
          </header>
        );

      case 'alignment-notice':
        return (
          <div id={section.id}>
            <AlignmentNotice governance={content.metadata.governance} />
          </div>
        );

      case 'why-matters':
      case 'core-concepts':
      case 'system-roles':
      case 'applied-example':
      case 'constraints-tradeoffs':
      case 'additional-resources':
        // Get section relevance for selected track
        const sectionRelevance = selectedTrack
          ? getSectionRelevance(
              content.metadata.slug,
              section.id,
              selectedTrack
            )
          : null;

        return (
          <section
            className={`${styles.section} ${sectionRelevance === 'high' ? styles.highRelevance : ''} ${sectionRelevance === 'medium' ? styles.mediumRelevance : ''}`}
            id={section.id}
          >
            {section.title && (
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                {sectionRelevance && selectedTrack && (
                  <TrackBadge
                    track={selectedTrack}
                    size="sm"
                    className={styles.sectionTrackBadge}
                  />
                )}
              </div>
            )}
            <div className={styles.sectionContent}>
              {renderContentWithGlossary(
                section.content,
                content.crossReferences.glossary || []
              )}
            </div>
          </section>
        );

      case 'design-code-interplay':
        return (
          <section className={styles.section} id={section.id}>
            {section.title && (
              <h2 className={styles.sectionTitle}>{section.title}</h2>
            )}
            <div className={styles.tabsContainer}>
              <Tabs defaultValue="design">
                <Tabs.List>
                  <Tabs.Tab value="design">Design</Tabs.Tab>
                  <Tabs.Tab value="code">Code</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="design">
                  <div className={styles.tabContent}>
                    {renderContentWithGlossary(
                      section.content,
                      content.crossReferences.glossary || []
                    )}
                  </div>
                </Tabs.Panel>
                <Tabs.Panel value="code">
                  <div className={styles.tabContent}>
                    {renderContentWithGlossary(
                      section.content,
                      content.crossReferences.glossary || []
                    )}
                  </div>
                </Tabs.Panel>
              </Tabs>
            </div>
          </section>
        );

      case 'verification-checklist':
        return (
          <section className={styles.section} id={section.id}>
            {section.title && (
              <h2 className={styles.sectionTitle}>{section.title}</h2>
            )}
            <div className={styles.checklist}>
              <ul className={styles.checklistList}>
                {content.verificationChecklist.map((item) => (
                  <li key={item.id} className={styles.checklistItem}>
                    <label className={styles.checklistLabel}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        disabled={item.required}
                        defaultChecked={item.required}
                      />
                      <span className={styles.checklistText}>
                        <strong>{item.label}</strong>
                        {item.description && (
                          <span className={styles.checklistDescription}>
                            {' '}
                            — {item.description}
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );

      case 'cross-references':
        return (
          <section className={styles.section} id={section.id}>
            {section.title && (
              <h2 className={styles.sectionTitle}>{section.title}</h2>
            )}
            <div className={styles.crossReferences}>
              {content.crossReferences.concepts.length > 0 && (
                <div className={styles.referenceGroup}>
                  <h3 className={styles.referenceGroupTitle}>
                    Related Concepts
                  </h3>
                  <div className={styles.conceptGrid}>
                    {content.crossReferences.concepts.map((concept) => (
                      <ConceptLinkComponent
                        key={concept.slug}
                        concept={concept}
                        variant="card"
                      />
                    ))}
                  </div>
                </div>
              )}
              {content.crossReferences.components.length > 0 && (
                <div className={styles.referenceGroup}>
                  <h3 className={styles.referenceGroupTitle}>
                    Component Examples
                  </h3>
                  <div className={styles.componentReferences}>
                    {content.crossReferences.components.map((ref) => (
                      <ComponentReference key={ref.slug} reference={ref} />
                    ))}
                  </div>
                </div>
              )}
              {content.crossReferences.glossary &&
                content.crossReferences.glossary.length > 0 && (
                  <div className={styles.referenceGroup}>
                    <h3 className={styles.referenceGroupTitle}>
                      Glossary Terms
                    </h3>
                    <div className={styles.glossaryTerms}>
                      {content.crossReferences.glossary.map((termId) => (
                        <GlossaryPopover key={termId} termId={termId}>
                          <Link
                            href={`/blueprints/glossary#glossary-letter-${termId.charAt(0).toUpperCase()}`}
                            onClick={() =>
                              trackCrossReferenceClick(
                                content.metadata.slug,
                                termId,
                                'glossary'
                              )
                            }
                          >
                            {termId}
                          </Link>
                        </GlossaryPopover>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </section>
        );

      case 'assessment-prompt':
        return (
          <section className={styles.section} id={section.id}>
            {section.title && (
              <h2 className={styles.sectionTitle}>{section.title}</h2>
            )}
            <div className={styles.assessmentContainer}>
              {content.assessmentPrompts.map((prompt, idx) => (
                <div key={idx} className={styles.assessmentPrompt}>
                  <ReflectionCallout
                    question={prompt.question}
                    type={
                      prompt.type === 'reflection'
                        ? 'reflection'
                        : prompt.type === 'application'
                          ? 'application'
                          : 'tradeoff'
                    }
                  >
                    {prompt.options && (
                      <ul>
                        {prompt.options.map((option, optIdx) => (
                          <li key={optIdx}>{option}</li>
                        ))}
                      </ul>
                    )}
                  </ReflectionCallout>
                </div>
              ))}

              {/* Add assessment rubric if available */}
              {(() => {
                const rubric = getAssessmentRubric(content.metadata.slug);
                if (rubric) {
                  return (
                    <div className={styles.formalAssessment}>
                      <h3>Formal Assessment</h3>
                      <p>
                        Ready to test your understanding? Take our formal
                        assessment to measure your proficiency level.
                      </p>
                      <AssessmentRubricComponent
                        rubric={rubric}
                        foundationPageSlug={content.metadata.slug}
                      />
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </section>
        );

      default:
        return (
          <section className={styles.section} id={section.id}>
            {section.title && (
              <h2 className={styles.sectionTitle}>{section.title}</h2>
            )}
            <div className={styles.sectionContent}>{section.content}</div>
          </section>
        );
    }
  };

  return (
    <>
      {jsonLd && (
        <>
          {Array.isArray(jsonLd) ? (
            // Render multiple JSON-LD schemas
            jsonLd.map((schema, index) => (
              <script
                key={index}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
              />
            ))
          ) : (
            // Render single JSON-LD schema
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
          )}
        </>
      )}
      <article className={styles.template}>
        <a href="#main-content" className={styles.skipLink}>
          Skip to main content
        </a>
        <main id="main-content" className={styles.main}>
          <TrackSelector
            currentPageSlug={content.metadata.slug}
            onTrackChange={setSelectedTrack}
          />
          {sortedSections.map((section) => (
            <React.Fragment key={section.id}>
              {renderSection(section)}
            </React.Fragment>
          ))}
        </main>
        {content.metadata.learning.prerequisites.length > 0 && (
          <nav className={styles.prerequisites} aria-label="Prerequisites">
            <h3>Prerequisites</h3>
            <ul>
              {content.metadata.learning.prerequisites.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/blueprints/foundations/${slug}`}
                    onClick={() =>
                      trackCrossReferenceClick(
                        content.metadata.slug,
                        slug,
                        'concept'
                      )
                    }
                  >
                    {slug}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {content.metadata.learning.next_units.length > 0 && (
          <nav className={styles.nextUnits} aria-label="Next steps">
            <h3>Continue Learning</h3>
            <ul>
              {content.metadata.learning.next_units.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/blueprints/foundations/${slug}`}
                    onClick={() =>
                      trackCrossReferenceClick(
                        content.metadata.slug,
                        slug,
                        'concept'
                      )
                    }
                  >
                    {slug}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </article>
      <FeedbackForm
        pageSlug={content.metadata.slug}
        pageTitle={content.metadata.title}
      />
    </>
  );
}
