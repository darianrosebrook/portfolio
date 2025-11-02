'use client';

import * as React from 'react';
import type { AnatomyPart } from '../_lib/generateAnatomy';
import styles from './AnatomyDiagram.module.scss';

interface AnatomyDiagramProps {
  parts: AnatomyPart[];
  componentName: string;
}

export function AnatomyDiagram({ parts, componentName }: AnatomyDiagramProps) {
  if (!parts || parts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No anatomy data available for this component.</p>
      </div>
    );
  }

  // Group parts by level
  const rootPart = parts.find((p) => p.level === 0);
  const childParts = parts.filter((p) => p.level > 0);

  return (
    <div className={styles.anatomyDiagram}>
      <div className={styles.diagramContainer}>
        {/* Root container */}
        {rootPart && (
          <div className={styles.rootContainer}>
            <div className={styles.partLabel}>{rootPart.name}</div>
            <div className={styles.partBox}>
              {/* Child parts */}
              {childParts.length > 0 && (
                <div className={styles.childrenContainer}>
                  {childParts.map((part, index) => (
                    <div key={index} className={styles.childPart}>
                      <div className={styles.partLabel}>{part.name}</div>
                      <div className={styles.partBox} />
                    </div>
                  ))}
                </div>
              )}
              {childParts.length === 0 && (
                <div className={styles.emptyContent}>
                  <span className={styles.placeholder}>
                    {componentName} content
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fallback if no root found */}
        {!rootPart && (
          <div className={styles.fallback}>
            {parts.map((part, index) => (
              <div key={index} className={styles.partItem}>
                <span className={styles.partName}>{part.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendBox} />
          <span>Component part</span>
        </div>
        <div className={styles.legendNote}>
          <p>
            This diagram shows the structural parts of the {componentName}{' '}
            component. Each part represents a distinct element or region within
            the component.
          </p>
        </div>
      </div>
    </div>
  );
}
