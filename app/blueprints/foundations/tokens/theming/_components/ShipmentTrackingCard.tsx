'use client';

import React from 'react';
import styles from './DashboardDemo.module.scss';

interface TimelineStep {
  title: string;
  timestamp: string;
  status: 'completed' | 'current' | 'future';
}

const steps: TimelineStep[] = [
  {
    title: 'Order confirmed',
    timestamp: 'Jan 24, 2025 at 2:30 PM',
    status: 'completed',
  },
  {
    title: 'Picked up by courier',
    timestamp: 'Jan 25, 2025 at 9:15 AM',
    status: 'completed',
  },
  {
    title: 'In transit \u2014 Regional hub',
    timestamp: 'Jan 27, 2025 at 11:42 AM',
    status: 'completed',
  },
  {
    title: 'Out for delivery',
    timestamp: 'Today',
    status: 'current',
  },
  {
    title: 'Delivered',
    timestamp: 'Pending',
    status: 'future',
  },
];

export const ShipmentTrackingCard: React.FC = () => {
  return (
    <div className={styles.formCard}>
      <h3>Shipment tracking</h3>

      {/* Package info row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--semantic-color-foreground-accent)',
          }}
        >
          Package #PKG-7294
        </span>
        <span
          style={{
            fontSize: 13,
            color: 'var(--semantic-color-foreground-secondary)',
          }}
        >
          Estimated: Jan 30, 2025
        </span>
      </div>

      {/* Vertical timeline */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          const dotColor =
            step.status === 'completed'
              ? 'var(--semantic-color-background-accent)'
              : step.status === 'current'
                ? 'transparent'
                : 'transparent';

          const dotBorder =
            step.status === 'completed'
              ? '2px solid var(--semantic-color-background-accent)'
              : step.status === 'current'
                ? '2px solid var(--semantic-color-background-accent)'
                : '2px solid var(--semantic-color-border-default)';

          const lineColor =
            step.status === 'completed' && index < steps.length - 1
              ? steps[index + 1].status !== 'future'
                ? 'var(--semantic-color-background-accent)'
                : 'var(--semantic-color-border-default)'
              : 'var(--semantic-color-border-default)';

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'row',
                minHeight: isLast ? 'auto' : 48,
              }}
            >
              {/* Left column: dot + line */}
              <div
                style={{
                  width: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: dotColor,
                    border: dotBorder,
                    flexShrink: 0,
                    marginTop: 2,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {step.status === 'current' && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--semantic-color-background-accent)',
                        animation: 'pulse 2s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>

                {/* Connecting line */}
                {!isLast && (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      background: lineColor,
                      marginTop: 4,
                      marginBottom: 4,
                      borderRadius: 1,
                    }}
                  />
                )}
              </div>

              {/* Right column: text */}
              <div
                style={{
                  flex: 1,
                  paddingLeft: 12,
                  paddingBottom: isLast ? 0 : 12,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    color: 'var(--semantic-color-foreground-primary)',
                    fontWeight: step.status === 'current' ? 600 : 400,
                    lineHeight: '16px',
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--semantic-color-foreground-secondary)',
                    marginTop: 2,
                    lineHeight: '16px',
                  }}
                >
                  {step.timestamp}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
};

export default ShipmentTrackingCard;
