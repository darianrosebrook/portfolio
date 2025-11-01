'use client';

import type { TrackId } from '@/types/tracks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { LearningPath } from '../../_components/LearningPath';
import {
  getTrack,
  getTrackLearningPath,
  getTrackProgress,
} from '../../_lib/tracks';
import styles from './track.module.scss';

interface TrackPageProps {
  params: Promise<{ track: string }>;
}

export default function TrackPage({ params }: TrackPageProps) {
  const [trackId, setTrackId] = useState<TrackId | null>(null);

  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      const id = resolvedParams.track as TrackId;
      setTrackId(id);
    })();
  }, [params]);

  // Get completed pages from localStorage (must be called before early returns)
  const completedPages = useMemo(() => {
    if (typeof window === 'undefined') return [];
    try {
      const progress = JSON.parse(
        localStorage.getItem('foundation_progress') || '{}'
      );
      return Object.keys(progress).filter(
        (slug) => progress[slug]?.completed === true
      );
    } catch {
      return [];
    }
  }, []);

  // Show loading state while params are being resolved
  if (!trackId) {
    return <div className={styles.trackPage}>Loading...</div>;
  }

  // Validate track ID
  if (!['designer', 'developer', 'cross-functional'].includes(trackId)) {
    notFound();
  }

  const track = getTrack(trackId);
  const learningPath = getTrackLearningPath(trackId);

  const progress = getTrackProgress(trackId, completedPages);

  return (
    <div className={styles.trackPage}>
      <header className={styles.header}>
        <Link href="/blueprints/foundations/tracks" className={styles.backLink}>
          ← Back to All Tracks
        </Link>
        <div className={styles.trackHeader}>
          <div
            className={styles.trackIndicator}
            style={{ backgroundColor: track.color }}
          />
          <div>
            <h1 className={styles.trackTitle}>{track.name}</h1>
            <p className={styles.trackDescription}>{track.description}</p>
          </div>
        </div>
      </header>

      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <h2>Your Progress</h2>
          <span className={styles.progressPercentage}>
            {progress.percentage}%
          </span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${progress.percentage}%`,
              backgroundColor: track.color,
            }}
          />
        </div>
        <p className={styles.progressText}>
          {progress.completed} of {progress.total} pages completed
        </p>
      </div>

      <section className={styles.learningPathSection}>
        <h2>Learning Path</h2>
        <LearningPath
          track={trackId}
          learningPath={learningPath}
          completedPages={completedPages}
        />
      </section>

      <section className={styles.outcomesSection}>
        <h2>What You'll Learn</h2>
        <div className={styles.outcomesGrid}>
          <div className={styles.outcomeCard}>
            <h3>Focus Areas</h3>
            <ul>
              {track.focusAreas.map((area, idx) => (
                <li key={idx}>{area}</li>
              ))}
            </ul>
          </div>
          <div className={styles.outcomeCard}>
            <h3>Outcomes</h3>
            <ul>
              {track.outcomes.map((outcome, idx) => (
                <li key={idx}>{outcome}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
