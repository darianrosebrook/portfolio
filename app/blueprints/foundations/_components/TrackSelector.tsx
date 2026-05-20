'use client';

import type { TrackId } from '@/types/tracks';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllTracks, getTrack } from '../_lib/tracks';
import styles from './TrackSelector.module.css';

interface TrackSelectorProps {
  currentPageSlug: string;
  onTrackChange?: (track: TrackId | null) => void;
}

export function TrackSelector({
  currentPageSlug: _currentPageSlug,
  onTrackChange,
}: TrackSelectorProps) {
  const [selectedTrack, setSelectedTrack] = useState<TrackId | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('foundation_selected_track');
    if (saved && ['designer', 'developer', 'cross-functional'].includes(saved)) {
      return saved as TrackId;
    }
    return null;
  });

  // Notify parent once on mount if we hydrated a track from storage
  useEffect(() => {
    if (selectedTrack) onTrackChange?.(selectedTrack);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only callback; we want this to fire once with the hydrated value, not on every onTrackChange identity change
  }, []);

  const handleTrackSelect = (trackId: TrackId | null) => {
    setSelectedTrack(trackId);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      if (trackId) {
        localStorage.setItem('foundation_selected_track', trackId);
      } else {
        localStorage.removeItem('foundation_selected_track');
      }
    }

    onTrackChange?.(trackId);
  };

  const tracks = getAllTracks();

  return (
    <div className={styles.trackSelector}>
      <div className={styles.header}>
        <h3 className={styles.title}>Learning Track</h3>
        <p className={styles.description}>
          Filter content by your role to see the most relevant sections
        </p>
      </div>

      <div className={styles.trackOptions}>
        <button
          onClick={() => handleTrackSelect(null)}
          className={`${styles.trackOption} ${
            selectedTrack === null ? styles.active : ''
          }`}
          aria-pressed={selectedTrack === null}
        >
          <span className={styles.trackLabel}>All</span>
          <span className={styles.trackDesc}>Show all content</span>
        </button>

        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => handleTrackSelect(track.id)}
            className={`${styles.trackOption} ${
              selectedTrack === track.id ? styles.active : ''
            }`}
            style={
              selectedTrack === track.id
                ? { borderColor: track.color }
                : undefined
            }
            aria-pressed={selectedTrack === track.id}
          >
            <span className={styles.trackLabel}>{track.name}</span>
            <span className={styles.trackDesc}>{track.description}</span>
          </button>
        ))}
      </div>

      {selectedTrack && (
        <div className={styles.trackInfo}>
          <Link
            href={`/blueprints/foundations/tracks/${selectedTrack}`}
            className={styles.trackLink}
          >
            View {getTrack(selectedTrack).name} Learning Path →
          </Link>
        </div>
      )}
    </div>
  );
}
