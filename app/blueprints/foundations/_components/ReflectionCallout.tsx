'use client';

import { useReducedMotion } from '@/context/ReducedMotionContext';
import React from 'react';
import styles from './ReflectionCallout.module.scss';

interface ReflectionCalloutProps {
  question: string;
  type?: 'reflection' | 'application' | 'tradeoff';
  children?: React.ReactNode;
}

export function ReflectionCallout({
  question,
  type = 'reflection',
  children,
}: ReflectionCalloutProps) {
  const { prefersReducedMotion } = useReducedMotion();

  return (
    <div
      className={styles.callout}
      data-type={type}
      role="complementary"
      aria-label="Critical reflection prompt"
    >
      <div className={styles.icon}>
        {type === 'tradeoff' ? '⚖️' : type === 'application' ? '💡' : '🤔'}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>
          {type === 'tradeoff'
            ? 'Consider the Trade-offs'
            : type === 'application'
              ? 'Apply This Concept'
              : 'Reflect'}
        </h3>
        <p className={styles.question}>{question}</p>
        {children && <div className={styles.details}>{children}</div>}
      </div>
    </div>
  );
}
