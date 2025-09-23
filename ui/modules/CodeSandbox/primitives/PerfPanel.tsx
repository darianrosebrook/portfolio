import * as React from 'react';

export type PerfPanelProps = {
  targetWindow?: Window;
  sampleMs?: number;
};

type PerfMetrics = {
  renderCount: number;
  lastRenderTime: number;
  avgRenderTime: number;
  fps: number;
  memoryEstimate?: number;
};

export function PerfPanel({ targetWindow, sampleMs = 5000 }: PerfPanelProps) {
  const [metrics, setMetrics] = React.useState<PerfMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    avgRenderTime: 0,
    fps: 0,
  });
  const [isRunning, setIsRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [statusAnnouncement, setStatusAnnouncement] =
    React.useState<string>('');

  const renderTimes = React.useRef<number[]>([]);
  const frameCount = React.useRef(0);
  const lastFrameTime = React.useRef(performance.now());
  const animationFrameId = React.useRef<number | null>(null);
  const intervalId = React.useRef<NodeJS.Timeout | null>(null);

  const resolveTargetWindow = React.useCallback((): Window => {
    return targetWindow ?? window;
  }, [targetWindow]);

  const updateMetrics = React.useCallback(() => {
    const now = performance.now();
    const deltaTime = now - lastFrameTime.current;

    if (deltaTime > 0) {
      frameCount.current++;
      const currentFps = 1000 / deltaTime;

      setMetrics((prev) => ({
        ...prev,
        fps: Math.round(currentFps * 10) / 10,
        lastRenderTime: Math.round(deltaTime * 100) / 100,
      }));
    }

    lastFrameTime.current = now;
  }, []);

  const measureRender = React.useCallback((renderTime: number) => {
    renderTimes.current.push(renderTime);
    if (renderTimes.current.length > 100) {
      renderTimes.current.shift(); // Keep only last 100 measurements
    }

    const avgTime =
      renderTimes.current.reduce((a, b) => a + b, 0) /
      renderTimes.current.length;

    setMetrics((prev) => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      avgRenderTime: Math.round(avgTime * 100) / 100,
    }));
  }, []);

  const startMonitoring = React.useCallback(() => {
    setIsRunning(true);
    setError(null);
    setStatusAnnouncement('Performance monitoring started');
    renderTimes.current = [];
    frameCount.current = 0;
    lastFrameTime.current = performance.now();

    // FPS monitoring
    const animate = () => {
      updateMetrics();
      animationFrameId.current = requestAnimationFrame(animate);
    };
    animate();

    // Memory monitoring (if available)
    const checkMemory = () => {
      try {
        const win = resolveTargetWindow();
        if ('memory' in win.performance) {
          const memory = (win.performance as any).memory;
          setMetrics((prev) => ({
            ...prev,
            memoryEstimate: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
          }));
        }
      } catch (e) {
        // Memory API not available or blocked
      }
    };

    intervalId.current = setInterval(checkMemory, 1000);
  }, [updateMetrics, resolveTargetWindow]);

  const stopMonitoring = React.useCallback(() => {
    setIsRunning(false);
    setStatusAnnouncement('Performance monitoring stopped');
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (intervalId.current !== null) {
      clearInterval(intervalId.current);
    }
  }, []);

  const resetMetrics = React.useCallback(() => {
    setMetrics({
      renderCount: 0,
      lastRenderTime: 0,
      avgRenderTime: 0,
      fps: 0,
      memoryEstimate: undefined,
    });
    renderTimes.current = [];
    frameCount.current = 0;
  }, []);

  const exportData = React.useCallback(() => {
    const data = {
      timestamp: new Date().toISOString(),
      metrics,
      sampleDuration: sampleMs,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'perf-report.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [metrics, sampleMs]);

  // Auto-stop after sample duration
  React.useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(() => {
        stopMonitoring();
      }, sampleMs);
      return () => clearTimeout(timer);
    }
  }, [isRunning, sampleMs, stopMonitoring]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return (
    <div
      style={{
        border: '1px solid var(--semantic-color-border-subtle)',
        borderRadius: 'var(--semantic-border-radius-md, 8px)',
        padding: 'var(--semantic-spacing-md, 12px)',
      }}
    >
      {/* Screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {statusAnnouncement}
      </div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <strong>Performance</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={isRunning ? stopMonitoring : startMonitoring}
            aria-describedby="monitoring-status"
            style={{
              padding:
                'var(--semantic-spacing-xs, 4px) var(--semantic-spacing-sm, 8px)',
              borderRadius: 'var(--semantic-border-radius-sm, 6px)',
              background: isRunning
                ? 'var(--semantic-color-background-danger)'
                : 'var(--semantic-color-background-accent)',
              color: 'var(--semantic-color-foreground-on-accent)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--semantic-spacing-xs, 4px)',
            }}
          >
            <span aria-hidden="true" style={{ fontSize: '12px' }}>
              {isRunning ? '⏹️' : '▶️'}
            </span>
            {isRunning ? 'Stop' : 'Start'} monitoring
            <span id="monitoring-status" className="sr-only">
              {isRunning
                ? 'Currently monitoring performance'
                : 'Performance monitoring stopped'}
            </span>
          </button>
          <button
            type="button"
            onClick={resetMetrics}
            disabled={isRunning}
            style={{
              padding:
                'var(--semantic-spacing-xs, 4px) var(--semantic-spacing-sm, 8px)',
              borderRadius: 'var(--semantic-border-radius-sm, 6px)',
              background: 'var(--semantic-color-background-secondary)',
              color: 'var(--semantic-color-foreground-primary)',
              border: 'none',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.6 : 1,
            }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={exportData}
            disabled={metrics.renderCount === 0}
            style={{
              padding:
                'var(--semantic-spacing-xs, 4px) var(--semantic-spacing-sm, 8px)',
              borderRadius: 'var(--semantic-border-radius-sm, 6px)',
              background: 'var(--semantic-color-background-secondary)',
              color: 'var(--semantic-color-foreground-primary)',
              border: 'none',
              cursor: metrics.renderCount === 0 ? 'not-allowed' : 'pointer',
              opacity: metrics.renderCount === 0 ? 0.6 : 1,
            }}
          >
            Export
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--text-danger)', marginTop: 8 }}>
          Error: {error}
        </div>
      )}

      <div
        style={{
          marginTop: 12,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 12,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: 'var(--text-accent)',
            }}
          >
            {metrics.renderCount}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Renders
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: 'var(--text-accent)',
            }}
          >
            {metrics.fps}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            FPS
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: 'var(--text-accent)',
            }}
          >
            {metrics.lastRenderTime}ms
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Last render
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: 'var(--text-accent)',
            }}
          >
            {metrics.avgRenderTime}ms
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Avg render
          </div>
        </div>

        {metrics.memoryEstimate !== undefined && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: 'var(--text-accent)',
              }}
            >
              {metrics.memoryEstimate}MB
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Memory
            </div>
          </div>
        )}
      </div>

      {isRunning && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}
        >
          Monitoring for {sampleMs / 1000}s...
        </div>
      )}
    </div>
  );
}
