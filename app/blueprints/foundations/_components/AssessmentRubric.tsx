'use client';

import type { AssessmentRubric } from '@/types/assessment';
import { useState } from 'react';
import { getAssessmentProgress } from '../_lib/assessment';
import { Assessment } from './Assessment';
import styles from './AssessmentRubric.module.scss';

interface AssessmentRubricComponentProps {
  rubric: AssessmentRubric;
  foundationPageSlug: string;
}

export function AssessmentRubricComponent({
  rubric,
  foundationPageSlug,
}: AssessmentRubricComponentProps) {
  const [showAssessment, setShowAssessment] = useState(false);
  const progress = getAssessmentProgress(foundationPageSlug);
  const hasCompleted =
    progress && Object.keys(progress.completedAssessments).length > 0;

  if (showAssessment) {
    return (
      <Assessment rubric={rubric} onComplete={() => setShowAssessment(false)} />
    );
  }

  return (
    <div className={styles.rubric}>
      <header className={styles.header}>
        <h2 className={styles.title}>{rubric.title}</h2>
        <p className={styles.description}>{rubric.description}</p>
        {hasCompleted && progress && (
          <div className={styles.previousResult}>
            <span className={styles.resultLabel}>Previous Result:</span>
            <span className={styles.resultLevel}>
              {progress.currentProficiency?.toUpperCase() || 'N/A'}
            </span>
          </div>
        )}
      </header>

      <div className={styles.criteria}>
        <h3>Assessment Criteria</h3>
        <div className={styles.criteriaList}>
          {rubric.criteria.map((criterion) => (
            <div key={criterion.id} className={styles.criterion}>
              <div className={styles.criterionHeader}>
                <h4 className={styles.criterionTitle}>{criterion.category}</h4>
                <span className={styles.criterionWeight}>
                  {Math.round(criterion.weight * 100)}%
                </span>
              </div>
              <p className={styles.criterionDescription}>
                {criterion.description}
              </p>
              <div className={styles.proficiencyLevels}>
                <div className={styles.proficiencyLevel}>
                  <strong>Beginner:</strong> {criterion.beginner}
                </div>
                <div className={styles.proficiencyLevel}>
                  <strong>Intermediate:</strong> {criterion.intermediate}
                </div>
                <div className={styles.proficiencyLevel}>
                  <strong>Advanced:</strong> {criterion.advanced}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.thresholds}>
        <h3>Score Thresholds</h3>
        <div className={styles.thresholdList}>
          <div className={styles.threshold}>
            <span className={styles.thresholdLabel}>Beginner</span>
            <span className={styles.thresholdValue}>
              {rubric.thresholds.beginner}%+
            </span>
          </div>
          <div className={styles.threshold}>
            <span className={styles.thresholdLabel}>Intermediate</span>
            <span className={styles.thresholdValue}>
              {rubric.thresholds.intermediate}%+
            </span>
          </div>
          <div className={styles.threshold}>
            <span className={styles.thresholdLabel}>Advanced</span>
            <span className={styles.thresholdValue}>
              {rubric.thresholds.advanced}%+
            </span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          onClick={() => setShowAssessment(true)}
          className={styles.startButton}
        >
          {hasCompleted ? 'Retake Assessment' : 'Start Assessment'}
        </button>
      </div>
    </div>
  );
}
