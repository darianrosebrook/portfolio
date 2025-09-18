import * as React from 'react';

export type LogEntry = {
  id: string;
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  timestamp: number;
  args?: any[];
  stack?: string;
};

export type ConsolePanelProps = {
  logs?: LogEntry[];
  targetWindow?: Window | null;
  autoCapture?: boolean;
  maxLogs?: number;
  showTimestamps?: boolean;
  levelFilter?: LogEntry['level'][];
  onClear?: () => void;
};

const LOG_LEVEL_COLORS = {
  log: 'var(--semantic-color-foreground-primary)',
  info: 'var(--semantic-color-foreground-info)',
  warn: 'var(--semantic-color-foreground-warning)',
  error: 'var(--semantic-color-foreground-danger)',
  debug: 'var(--semantic-color-foreground-secondary)',
} as const;

const LOG_LEVEL_BACKGROUNDS = {
  log: 'transparent',
  info: 'var(--semantic-color-background-info-subtle)',
  warn: 'var(--semantic-color-background-warning-subtle)',
  error: 'var(--semantic-color-background-danger-subtle)',
  debug: 'var(--semantic-color-background-secondary)',
} as const;

function formatLogMessage(entry: LogEntry): string {
  if (entry.args && entry.args.length > 0) {
    try {
      return entry.args
        .map((arg) => {
          if (typeof arg === 'object' && arg !== null) {
            return JSON.stringify(arg, null, 2);
          }
          return String(arg);
        })
        .join(' ');
    } catch {
      return entry.message;
    }
  }
  return entry.message;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}

export function ConsolePanel({
  logs: externalLogs = [],
  targetWindow,
  autoCapture = true,
  maxLogs = 1000,
  showTimestamps = true,
  levelFilter = ['log', 'warn', 'error', 'info', 'debug'],
  onClear,
}: ConsolePanelProps) {
  const [capturedLogs, setCapturedLogs] = React.useState<LogEntry[]>([]);
  const [isCapturing, setIsCapturing] = React.useState(autoCapture);
  const [filter, setFilter] = React.useState<Set<LogEntry['level']>>(
    new Set(levelFilter)
  );
  const logContainerRef = React.useRef<HTMLDivElement>(null);

  const resolveTargetWindow = React.useCallback((): Window => {
    if (targetWindow) return targetWindow;
    try {
      const iframe =
        document.querySelector<HTMLIFrameElement>('.sp-preview-iframe');
      return iframe?.contentWindow ?? window;
    } catch {
      return window;
    }
  }, [targetWindow]);

  const addLogEntry = React.useCallback(
    (
      level: LogEntry['level'],
      message: string,
      args?: any[],
      stack?: string
    ) => {
      const entry: LogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        level,
        message,
        timestamp: Date.now(),
        args,
        stack,
      };

      setCapturedLogs((prev) => {
        const updated = [...prev, entry];
        return updated.length > maxLogs ? updated.slice(-maxLogs) : updated;
      });
    },
    [maxLogs]
  );

  React.useEffect(() => {
    if (!isCapturing) return;

    const win = resolveTargetWindow();
    if (!win || !(win as any).console) return;

    const originalMethods = {
      log: (win as any).console.log,
      warn: (win as any).console.warn,
      error: (win as any).console.error,
      info: (win as any).console.info,
      debug: (win as any).console.debug,
    };

    (win as any).console.log = (...args: any[]) => {
      originalMethods.log.apply((win as any).console, args);
      addLogEntry('log', args.join(' '), args);
    };

    (win as any).console.warn = (...args: any[]) => {
      originalMethods.warn.apply((win as any).console, args);
      addLogEntry('warn', args.join(' '), args);
    };

    (win as any).console.error = (...args: any[]) => {
      originalMethods.error.apply((win as any).console, args);
      const stack = args.find((arg) => arg instanceof Error)?.stack;
      addLogEntry('error', args.join(' '), args, stack);
    };

    (win as any).console.info = (...args: any[]) => {
      originalMethods.info.apply((win as any).console, args);
      addLogEntry('info', args.join(' '), args);
    };

    (win as any).console.debug = (...args: any[]) => {
      originalMethods.debug.apply((win as any).console, args);
      addLogEntry('debug', args.join(' '), args);
    };

    const handleError = (event: ErrorEvent) => {
      addLogEntry('error', event.message, [event.error], event.error?.stack);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addLogEntry('error', `Unhandled Promise Rejection: ${event.reason}`, [
        event.reason,
      ]);
    };

    win.addEventListener('error', handleError);
    win.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      if ((win as any).console) {
        Object.assign((win as any).console, originalMethods);
      }
      win.removeEventListener('error', handleError);
      win.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isCapturing, resolveTargetWindow, addLogEntry]);

  const allLogs = React.useMemo(() => {
    const combined = [...externalLogs, ...capturedLogs];
    return combined
      .filter((log) => filter.has(log.level))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [externalLogs, capturedLogs, filter]);

  React.useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [allLogs]);

  const handleClear = () => {
    setCapturedLogs([]);
    onClear?.();
  };

  const toggleCapture = () => {
    setIsCapturing(!isCapturing);
  };

  const toggleLevelFilter = (level: LogEntry['level']) => {
    setFilter((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  return (
    <div
      style={{
        border: '1px solid var(--semantic-color-border-subtle)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 200,
        background: 'var(--semantic-color-background-primary)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: '1px solid var(--semantic-color-border-subtle)',
          background: 'var(--semantic-color-background-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong>Console</strong>
          <span
            style={{
              fontSize: 12,
              color: 'var(--semantic-color-foreground-secondary)',
            }}
          >
            ({allLogs.length} {allLogs.length === 1 ? 'entry' : 'entries'})
          </span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {(['log', 'info', 'warn', 'error', 'debug'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => toggleLevelFilter(level)}
              style={{
                padding: '2px 6px',
                fontSize: 11,
                borderRadius: 4,
                border: '1px solid var(--semantic-color-border-subtle)',
                background: filter.has(level)
                  ? LOG_LEVEL_BACKGROUNDS[level]
                  : 'transparent',
                color: filter.has(level)
                  ? LOG_LEVEL_COLORS[level]
                  : 'var(--semantic-color-foreground-secondary)',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {level}
            </button>
          ))}

          <button
            type="button"
            onClick={toggleCapture}
            style={{
              padding: '4px 8px',
              fontSize: 12,
              borderRadius: 4,
              border: '1px solid var(--semantic-color-border-subtle)',
              background: isCapturing
                ? 'var(--semantic-color-background-success-subtle)'
                : 'var(--semantic-color-background-secondary)',
              color: isCapturing
                ? 'var(--semantic-color-foreground-success)'
                : 'var(--semantic-color-foreground-secondary)',
              cursor: 'pointer',
            }}
          >
            {isCapturing ? 'Stop' : 'Start'}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={allLogs.length === 0}
            style={{
              padding: '4px 8px',
              fontSize: 12,
              borderRadius: 4,
              border: '1px solid var(--semantic-color-border-subtle)',
              background: 'var(--semantic-color-background-secondary)',
              color: 'var(--semantic-color-foreground-secondary)',
              cursor: allLogs.length === 0 ? 'not-allowed' : 'pointer',
              opacity: allLogs.length === 0 ? 0.5 : 1,
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div
        ref={logContainerRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 4,
          fontFamily: 'var(--semantic-typography-font-family-mono)',
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        {allLogs.length === 0 ? (
          <div
            style={{
              padding: 16,
              textAlign: 'center',
              color: 'var(--semantic-color-foreground-secondary)',
              fontStyle: 'italic',
            }}
          >
            No console output{!isCapturing && ' (capture is stopped)'}
          </div>
        ) : (
          allLogs.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                gap: 8,
                padding: '4px 8px',
                borderRadius: 4,
                marginBottom: 2,
                background: LOG_LEVEL_BACKGROUNDS[entry.level],
                borderLeft: `3px solid ${LOG_LEVEL_COLORS[entry.level]}`,
              }}
            >
              {showTimestamps && (
                <span
                  style={{
                    color: 'var(--semantic-color-foreground-tertiary)',
                    fontSize: 10,
                    minWidth: 80,
                    fontFamily: 'var(--semantic-typography-font-family-mono)',
                  }}
                >
                  {formatTimestamp(entry.timestamp)}
                </span>
              )}
              <span
                style={{
                  color: LOG_LEVEL_COLORS[entry.level],
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: 10,
                  minWidth: 40,
                }}
              >
                {entry.level}
              </span>
              <pre
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: LOG_LEVEL_COLORS[entry.level],
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                }}
              >
                {formatLogMessage(entry)}
                {entry.stack && (
                  <details style={{ marginTop: 4 }}>
                    <summary
                      style={{
                        cursor: 'pointer',
                        color: 'var(--semantic-color-foreground-secondary)',
                      }}
                    >
                      Stack trace
                    </summary>
                    <pre
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: 10,
                        color: 'var(--semantic-color-foreground-tertiary)',
                        background: 'var(--semantic-color-background-tertiary)',
                        padding: 8,
                        borderRadius: 4,
                        overflow: 'auto',
                      }}
                    >
                      {entry.stack}
                    </pre>
                  </details>
                )}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
