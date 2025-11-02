'use client';

import React, { useState } from 'react';
import styles from './FeedbackForm.module.scss';

export type FeedbackType =
  | 'content'
  | 'format'
  | 'structure'
  | 'navigation'
  | 'other';

export interface FeedbackData {
  type: FeedbackType;
  page: string;
  message: string;
  rating?: number;
  name?: string;
  email?: string;
}

interface FeedbackFormProps {
  pageSlug: string;
  pageTitle: string;
  onSubmitted?: (feedback: FeedbackData) => void;
}

export function FeedbackForm({
  pageSlug,
  pageTitle,
  onSubmitted,
}: FeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FeedbackData>({
    type: 'content',
    page: pageSlug,
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Track feedback submission
      if (typeof window !== 'undefined') {
        const feedbacks = JSON.parse(
          localStorage.getItem('foundation_feedback') || '[]'
        );
        feedbacks.push({
          ...formData,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('foundation_feedback', JSON.stringify(feedbacks));
      }

      // Call optional callback
      onSubmitted?.(formData);

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setFormData({
          type: 'content',
          page: pageSlug,
          message: '',
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={styles.feedbackButton}
        aria-label="Provide feedback on this page"
      >
        <span className={styles.feedbackIcon}>💬</span>
        <span className={styles.feedbackLabel}>Feedback</span>
      </button>
    );
  }

  return (
    <div className={styles.feedbackForm}>
      <div className={styles.feedbackHeader}>
        <h3>Help Improve This Page</h3>
        <button
          onClick={() => setIsOpen(false)}
          className={styles.closeButton}
          aria-label="Close feedback form"
        >
          ×
        </button>
      </div>

      {submitted ? (
        <div className={styles.successMessage}>
          <p>Thank you for your feedback!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="feedback-type">Feedback Type</label>
            <select
              id="feedback-type"
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as FeedbackType,
                })
              }
              required
            >
              <option value="content">Content</option>
              <option value="format">Format</option>
              <option value="structure">Structure</option>
              <option value="navigation">Navigation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="feedback-rating">Helpfulness (1-5)</label>
            <div className={styles.rating}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating })}
                  className={`${styles.ratingButton} ${
                    formData.rating === rating ? styles.active : ''
                  }`}
                  aria-label={`Rate ${rating} out of 5`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="feedback-message">Your Feedback</label>
            <textarea
              id="feedback-message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder={`What would you like to improve about "${pageTitle}"?`}
              required
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="feedback-name">Name (optional)</label>
            <input
              id="feedback-name"
              type="text"
              value={formData.name || ''}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Your name"
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.message.trim()}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
