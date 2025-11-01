'use client';

import type {
  AssessmentResult,
  AssessmentRubric,
  ProficiencyLevel,
} from '@/types/assessment';
import styles from './AssessmentResults.module.scss';

interface AssessmentResultsProps {
  result: AssessmentResult;
  rubric: AssessmentRubric;
}

export function AssessmentResults({ result, rubric }: AssessmentResultsProps) {
  const getProficiencyColor = (level: ProficiencyLevel): string => {
    switch (level) {
      case 'beginner':
        return 'var(--semantic-color-background-info-subtle)';
      case 'intermediate':
        return 'var(--semantic-color-background-warning-subtle)';
      case 'advanced':
        return 'var(--semantic-color-background-success-subtle)';
    }
  };

  const getProficiencyTextColor = (level: ProficiencyLevel): string => {
    switch (level) {
      case 'beginner':
        return 'var(--semantic-color-foreground-info)';
      case 'intermediate':
        return 'var(--semantic-color-foreground-warning)';
      case 'advanced':
        return 'var(--semantic-color-foreground-success)';
    }
  };

  return (
    <div className={styles.results}>
      <header className={styles.header}>
        <h2 className={styles.title}>Assessment Complete</h2>
        <div
          className={styles.proficiencyBadge}
          style={{
            backgroundColor: getProficiencyColor(result.proficiencyLevel),
            color: getProficiencyTextColor(result.proficiencyLevel),
          }}
        >
          {result.proficiencyLevel.toUpperCase()}
        </div>
      </header>

      <div className={styles.scoreSection}>
        <div className={styles.overallScore}>
          <span className={styles.scoreLabel}>Overall Score</span>
          <span className={styles.scoreValue}>{result.scores.overall}%</span>
        </div>

        <div className={styles.categoryScores}>
          <h3>Category Breakdown</h3>
          {Object.entries(result.scores.byCategory).map(([category, score]) => {
            const criteria = rubric.criteria.find(
              (c) => c.category === category
            );
            return (
              <div key={category} className={styles.categoryScore}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryName}>
                    {criteria?.description || category}
                  </span>
                  <span className={styles.categoryValue}>{score}%</span>
                </div>
                <div className={styles.categoryBar}>
                  <div
                    className={styles.categoryBarFill}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.feedbackSection}>
        <div className={styles.strengths}>
          <h3>✅ Strengths</h3>
          <ul>
            {result.feedback.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>

        {result.feedback.improvements.length > 0 && (
          <div className={styles.improvements}>
            <h3>📈 Areas for Improvement</h3>
            <ul>
              {result.feedback.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.nextSteps}>
          <h3>🎯 Next Steps</h3>
          <ul>
            {result.feedback.nextSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          onClick={() => window.location.reload()}
          className={styles.retakeButton}
        >
          Retake Assessment
        </button>
      </div>
    </div>
  );
}
