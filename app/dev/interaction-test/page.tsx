/**
 * Interaction Test Page for FontInspector SVG
 *
 * Tests:
 * - Pointer dragging for axis adjustment
 * - Keyboard shortcuts
 * - Hover interactions
 * - Click interactions
 * - Coordinate transformations
 */

'use client';

import {
  InspectorProvider,
  useInspector,
} from '@/ui/modules/FontInspector/FontInspector';
import { SymbolCanvasSVG } from '@/ui/modules/FontInspector/SymbolCanvasSVG';
import { useCallback, useEffect, useState } from 'react';
import styles from './page.module.scss';

export const dynamic = 'force-dynamic';

function InteractionTestContent() {
  const { axisValues, showDetails } = useInspector();
  const [interactionLog, setInteractionLog] = useState<string[]>([]);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [dragState, setDragState] = useState<{
    active: boolean;
    start: { x: number; y: number } | null;
    current: { x: number; y: number } | null;
  }>({ active: false, start: null, current: null });

  const addLog = useCallback((message: string) => {
    setInteractionLog((prev) => [
      ...prev.slice(-19), // Keep last 20 entries
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  }, []);

  // Monitor keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target === document.body || e.target instanceof SVGElement) {
        switch (e.key) {
          case 'd':
          case 'D':
            if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
              addLog(`Keyboard: Toggled details (now: ${!showDetails})`);
            }
            break;
          case '`':
          case '~':
            if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
              addLog('Keyboard: Toggled debug overlay');
            }
            break;
          case '?':
            if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
              addLog('Keyboard: Showed help');
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDetails, addLog]);

  // Monitor axis value changes (drag interactions)
  useEffect(() => {
    addLog(
      `Axis values changed: Weight=${axisValues.wght.toFixed(2)}, Opsz=${axisValues.opsz.toFixed(2)}`
    );
  }, [axisValues]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Interaction Test Suite</h1>
        <p>Test pointer events, keyboard shortcuts, and SVG interactions</p>
      </header>

      <div className={styles.testGrid}>
        {/* Main Canvas */}
        <div className={styles.canvasSection}>
          <h2>SVG Canvas</h2>
          <div className={styles.canvasWrapper}>
            <SymbolCanvasSVG />
          </div>
          <div className={styles.canvasInfo}>
            <p>
              <strong>Try:</strong>
            </p>
            <ul>
              <li>Drag horizontally to adjust weight axis</li>
              <li>
                Press <kbd>d</kbd> to toggle details
              </li>
              <li>
                Press <kbd>`</kbd> to toggle debug overlay
              </li>
              <li>
                Press <kbd>?</kbd> for help
              </li>
              <li>Hover over glyph to see cursor position</li>
            </ul>
          </div>
        </div>

        {/* Interaction Log */}
        <div className={styles.logSection}>
          <h2>Interaction Log</h2>
          <div className={styles.logContainer}>
            {interactionLog.length === 0 ? (
              <p className={styles.emptyLog}>No interactions yet...</p>
            ) : (
              <ul className={styles.logList}>
                {interactionLog.map((entry, idx) => (
                  <li key={idx}>{entry}</li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={() => setInteractionLog([])}
            className={styles.clearButton}
          >
            Clear Log
          </button>
        </div>

        {/* State Display */}
        <div className={styles.stateSection}>
          <h2>Current State</h2>
          <div className={styles.stateGrid}>
            <div className={styles.stateItem}>
              <span className={styles.stateLabel}>Details Visible:</span>
              <span className={showDetails ? styles.active : styles.inactive}>
                {showDetails ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.stateItem}>
              <span className={styles.stateLabel}>Weight:</span>
              <span>{axisValues.wght.toFixed(2)}</span>
            </div>
            <div className={styles.stateItem}>
              <span className={styles.stateLabel}>Optical Size:</span>
              <span>{axisValues.opsz.toFixed(2)}</span>
            </div>
            <div className={styles.stateItem}>
              <span className={styles.stateLabel}>Hover Position:</span>
              <span>
                {hoverPos
                  ? `${hoverPos.x.toFixed(0)}, ${hoverPos.y.toFixed(0)}`
                  : 'None'}
              </span>
            </div>
            <div className={styles.stateItem}>
              <span className={styles.stateLabel}>Drag State:</span>
              <span
                className={dragState.active ? styles.active : styles.inactive}
              >
                {dragState.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {dragState.active && dragState.start && dragState.current && (
              <div className={styles.stateItem}>
                <span className={styles.stateLabel}>Drag Delta:</span>
                <span>
                  X: {(dragState.current.x - dragState.start.x).toFixed(0)}, Y:{' '}
                  {(dragState.current.y - dragState.start.y).toFixed(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className={styles.shortcutsSection}>
          <h2>Keyboard Shortcuts</h2>
          <dl className={styles.shortcutsList}>
            <dt>
              <kbd>d</kbd>
            </dt>
            <dd>Toggle details view (anchors, handles, metrics)</dd>

            <dt>
              <kbd>`</kbd> or <kbd>~</kbd>
            </dt>
            <dd>Toggle debug overlay</dd>

            <dt>
              <kbd>?</kbd>
            </dt>
            <dd>Show help (console)</dd>

            <dt>
              <kbd>Ctrl/Cmd</kbd> + <kbd>+</kbd>
            </dt>
            <dd>Zoom in (placeholder)</dd>

            <dt>
              <kbd>Ctrl/Cmd</kbd> + <kbd>-</kbd>
            </dt>
            <dd>Zoom out (placeholder)</dd>

            <dt>
              <kbd>Ctrl/Cmd</kbd> + <kbd>Arrow Keys</kbd>
            </dt>
            <dd>Pan (placeholder)</dd>
          </dl>
        </div>

        {/* Pointer Event Test Area */}
        <div className={styles.pointerSection}>
          <h2>Pointer Event Test</h2>
          <div
            className={styles.pointerArea}
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setHoverPos({ x, y });
              if (dragState.active) {
                setDragState((prev) => ({
                  ...prev,
                  current: { x, y },
                }));
              }
            }}
            onPointerDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setDragState({
                active: true,
                start: { x, y },
                current: { x, y },
              });
              addLog(`Pointer down at (${x.toFixed(0)}, ${y.toFixed(0)})`);
            }}
            onPointerUp={() => {
              if (dragState.active) {
                addLog('Pointer up');
                setDragState({ active: false, start: null, current: null });
              }
            }}
            onPointerLeave={() => {
              setHoverPos(null);
              if (dragState.active) {
                setDragState({ active: false, start: null, current: null });
              }
            }}
          >
            <p>Move and drag in this area</p>
            {hoverPos && (
              <div
                className={styles.pointerIndicator}
                style={{
                  left: `${hoverPos.x}px`,
                  top: `${hoverPos.y}px`,
                }}
              />
            )}
            {dragState.active && dragState.start && dragState.current && (
              <svg
                className={styles.dragLine}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  overflow: 'visible',
                }}
              >
                <line
                  x1={dragState.start.x}
                  y1={dragState.start.y}
                  x2={dragState.current.x}
                  y2={dragState.current.y}
                  stroke="var(--semantic-color-foreground-accent)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InteractionTestPage() {
  return (
    <InspectorProvider>
      <InteractionTestContent />
    </InspectorProvider>
  );
}
