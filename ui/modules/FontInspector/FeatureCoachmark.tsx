'use client';

import Popover from '@/ui/components/Popover';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './FontInspector.css';

export interface FeatureZone {
  featureName: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  description?: string;
}

interface FeatureCoachmarkProps {
  zones: FeatureZone[];
  canvasRect: DOMRect | null;
  canvasScale: number;
  xOffset: number;
  baseline: number;
}

export function FeatureCoachmark({
  zones,
  canvasRect,
  canvasScale,
  xOffset,
  baseline,
}: FeatureCoachmarkProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [focusedZone, setFocusedZone] = useState<string | null>(null);
  // Track the active zone's DOM element in state so Popover's anchor prop
  // doesn't require dereferencing a ref Map during render.
  const [activeAnchor, setActiveAnchor] = useState<HTMLDivElement | null>(null);
  const zoneRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Stable callback ref. Reads data-zone-feature off the element to slot
  // it into the Map; uses React 19's cleanup-callback-ref form so the same
  // key is deleted on unmount without needing a per-key closure (which is
  // what previously made the rule fire). Runs at mount/unmount time, not
  // during render.
  const setZoneRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const key = el.dataset.zoneFeature;
    if (!key) return;
    zoneRefs.current.set(key, el);
    return () => {
      zoneRefs.current.delete(key);
    };
  }, []);

  // Convert font coordinates to canvas coordinates
  const toCanvasCoords = useCallback(
    (x: number, y: number): { x: number; y: number } => {
      if (!canvasRect) return { x: 0, y: 0 };
      return {
        x: canvasRect.left + xOffset + x * canvasScale,
        y: canvasRect.top + baseline - y * canvasScale, // Invert Y
      };
    },
    [canvasRect, xOffset, baseline, canvasScale]
  );

  // Handle keyboard navigation
  useEffect(() => {
    if (zones.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey && focusedZone) {
        e.preventDefault();
        const currentIndex = zones.findIndex(
          (z) => z.featureName === focusedZone
        );
        const nextIndex = (currentIndex + 1) % zones.length;
        const nextZone = zones[nextIndex];
        zoneRefs.current.get(nextZone.featureName)?.focus();
      } else if (e.key === 'Tab' && e.shiftKey && focusedZone) {
        e.preventDefault();
        const currentIndex = zones.findIndex(
          (z) => z.featureName === focusedZone
        );
        const prevIndex =
          currentIndex === 0 ? zones.length - 1 : currentIndex - 1;
        const prevZone = zones[prevIndex];
        zoneRefs.current.get(prevZone.featureName)?.focus();
      } else if (e.key === 'Escape' && focusedZone) {
        setFocusedZone(null);
        zoneRefs.current.get(focusedZone)?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [zones, focusedZone]);

  if (!canvasRect || zones.length === 0) return null;

  return (
    <>
      {zones.map((zone) => {
        const canvasPos = toCanvasCoords(zone.x, zone.y);
        const isActive =
          hoveredZone === zone.featureName || focusedZone === zone.featureName;

        return (
          <React.Fragment key={zone.featureName}>
            {/* Invisible hover zone */}
            <div
              ref={setZoneRef}
              data-zone-feature={zone.featureName}
              className="featureZone"
              style={{
                position: 'fixed',
                left: `${canvasPos.x}px`,
                top: `${canvasPos.y}px`,
                width: `${Math.max(zone.width * canvasScale, 40)}px`,
                height: `${Math.max(zone.height * canvasScale, 40)}px`,
                cursor: 'pointer',
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                setHoveredZone(zone.featureName);
                setActiveAnchor(e.currentTarget);
              }}
              onMouseLeave={() => setHoveredZone(null)}
              onFocus={(e) => {
                setFocusedZone(zone.featureName);
                setActiveAnchor(e.currentTarget);
              }}
              onBlur={() => setFocusedZone(null)}
              tabIndex={0}
              role="button"
              aria-label={`${zone.label} - Click or hover for details`}
              aria-describedby={`coachmark-${zone.featureName}`}
            />

            {/* Coachmark card */}
            {isActive && (
              <Popover
                anchor={activeAnchor ?? undefined}
                open={isActive}
                onOpenChange={(open) => {
                  if (!open) {
                    setHoveredZone(null);
                    setFocusedZone(null);
                  }
                }}
                placement="auto"
                offset={12}
                triggerStrategy="hover"
                closeOnEscape
              >
                <Popover.Content className="coachmarkCard">
                  <div id={`coachmark-${zone.featureName}`}>
                    <div className="coachmarkHeader">
                      <h5 className="coachmarkTitle">{zone.label}</h5>
                    </div>
                    {zone.description && (
                      <p className="coachmarkDescription">{zone.description}</p>
                    )}
                    <div className="coachmarkHint">
                      Press Tab to navigate between features
                    </div>
                  </div>
                </Popover.Content>
              </Popover>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
