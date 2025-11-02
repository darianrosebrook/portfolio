'use client';

import React from 'react';
import type { TrackId } from '@/types/tracks';
import { getTrack } from '../_lib/tracks';
import styles from './TrackBadge.module.scss';

interface TrackBadgeProps {
  track: TrackId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TrackBadge({ track, size = 'md', className }: TrackBadgeProps) {
  const trackDef = getTrack(track);

  return (
    <span
      className={`${styles.badge} ${styles[size]} ${className || ''}`}
      style={{ '--track-color': trackDef.color } as React.CSSProperties}
      title={trackDef.description}
    >
      {trackDef.name}
    </span>
  );
}

interface TrackBadgeListProps {
  tracks: TrackId[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TrackBadgeList({
  tracks,
  size = 'md',
  className,
}: TrackBadgeListProps) {
  return (
    <div className={`${styles.badgeList} ${className || ''}`}>
      {tracks.map((track) => (
        <TrackBadge key={track} track={track} size={size} />
      ))}
    </div>
  );
}
