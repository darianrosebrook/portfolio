import * as React from 'react';

export type FileTabsProps = {
  files: string[];
  active: string;
  onChange: (path: string) => void;
};

export const FileTabs = React.memo(function FileTabs({
  files,
  active,
  onChange,
}: FileTabsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = files.findIndex((f) => f === active);
    if (currentIndex < 0) return;
    let nextIndex = currentIndex;
    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % files.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + files.length) % files.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = files.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const next = files[nextIndex];
    onChange(next);
    const btn = containerRef.current?.querySelector<HTMLButtonElement>(
      `button[data-file="${CSS.escape(next)}"]`
    );
    btn?.focus();
  };

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Files"
      onKeyDown={handleKeyDown}
      style={{
        display: 'flex',
        gap: 8,
        padding: '6px 8px',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {files.map((f) => (
        <button
          key={f}
          role="tab"
          aria-selected={active === f}
          tabIndex={active === f ? 0 : -1}
          data-file={f}
          onClick={() => onChange(f)}
          style={{
            appearance: 'none',
            border: 0,
            background:
              active === f ? 'var(--surface-accent-subtle)' : 'transparent',
            color:
              active === f ? 'var(--text-accent)' : 'var(--text-secondary)',
            padding: '4px 8px',
            borderRadius: 6,
            cursor: 'pointer',
            outlineOffset: 2,
          }}
        >
          {f}
        </button>
      ))}
    </div>
  );
});
