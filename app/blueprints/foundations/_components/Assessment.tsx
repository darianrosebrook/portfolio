'use client';

import type {
  AssessmentQuestion,
  AssessmentResponse,
  AssessmentRubric,
} from '@/types/assessment';
import { useState } from 'react';
import {
  createAssessmentResult,
  saveAssessmentResult,
} from '../_lib/assessment';
import styles from './Assessment.module.scss';
import { AssessmentResults } from './AssessmentResults';

interface AssessmentProps {
  rubric: AssessmentRubric;
  onComplete?: (result: any) => void;
}

export function Assessment({ rubric, onComplete }: AssessmentProps) {
  const [responses, setResponses] = useState<
    Record<string, AssessmentResponse>
  >({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  const currentQuestion = rubric.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === rubric.questions.length - 1;
  const allQuestionsAnswered = rubric.questions.every(
    (q) => responses[q.id] !== undefined
  );

  const handleAnswerChange = (
    questionId: string,
    answer: string | string[],
    reflection?: string
  ) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
        reflection,
      },
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < rubric.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    const responseArray: AssessmentResponse[] = Object.values(responses);
    const assessmentResult = createAssessmentResult(rubric, responseArray);

    saveAssessmentResult(assessmentResult);
    setResult(assessmentResult);
    setIsSubmitted(true);
    onComplete?.(assessmentResult);
  };

  const renderQuestion = (question: AssessmentQuestion) => {
    const response = responses[question.id];

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className={styles.questionOptions}>
            {question.options?.map((option, index) => (
              <label key={index} className={styles.radioOption}>
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={
                    Array.isArray(response?.answer)
                      ? response.answer.includes(option)
                      : response?.answer === option
                  }
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multiple-select':
        return (
          <div className={styles.questionOptions}>
            {question.options?.map((option, index) => (
              <label key={index} className={styles.checkboxOption}>
                <input
                  type="checkbox"
                  name={question.id}
                  value={option}
                  checked={
                    Array.isArray(response?.answer)
                      ? response.answer.includes(option)
                      : false
                  }
                  onChange={(e) => {
                    const currentAnswers = Array.isArray(response?.answer)
                      ? response.answer
                      : [];
                    const newAnswers = e.target.checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter((a) => a !== option);
                    handleAnswerChange(question.id, newAnswers);
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'reflection':
      case 'application':
        return (
          <textarea
            className={styles.textarea}
            value={response?.reflection || ''}
            onChange={(e) =>
              handleAnswerChange(question.id, '', e.target.value)
            }
            placeholder="Share your thoughts..."
            rows={8}
          />
        );

      default:
        return null;
    }
  };

  if (isSubmitted && result) {
    return <AssessmentResults result={result} rubric={rubric} />;
  }

  return (
    <div className={styles.assessment}>
      <header className={styles.header}>
        <h2 className={styles.title}>{rubric.title}</h2>
        <p className={styles.description}>{rubric.description}</p>
        <div className={styles.progress}>
          <span>
            Question {currentQuestionIndex + 1} of {rubric.questions.length}
          </span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${((currentQuestionIndex + 1) / rubric.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </header>

      <div className={styles.questionSection}>
        <div className={styles.questionHeader}>
          <h3 className={styles.questionTitle}>{currentQuestion.question}</h3>
          {currentQuestion.description && (
            <p className={styles.questionDescription}>
              {currentQuestion.description}
            </p>
          )}
        </div>

        <div className={styles.questionContent}>
          {renderQuestion(currentQuestion)}
        </div>

        {(currentQuestion.type === 'reflection' ||
          currentQuestion.type === 'application') && (
          <div className={styles.rubricHint}>
            <strong>What to consider:</strong>
            <ul>
              <li>
                <strong>Beginner:</strong> {currentQuestion.rubric.beginner}
              </li>
              <li>
                <strong>Intermediate:</strong>{' '}
                {currentQuestion.rubric.intermediate}
              </li>
              <li>
                <strong>Advanced:</strong> {currentQuestion.rubric.advanced}
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className={styles.navigation}>
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={styles.navButton}
        >
          ← Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered}
            className={`${styles.navButton} ${styles.submitButton}`}
          >
            Submit Assessment
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!responses[currentQuestion.id]}
            className={styles.navButton}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
