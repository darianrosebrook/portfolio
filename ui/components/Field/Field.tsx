import React from 'react';
import { useFieldCtx } from './FieldProvider';
import './Field.css';
import { Label } from './Label';
import { HelpText } from './HelpText';
import { ErrorText } from './ErrorText';
import Spinner from '@/ui/components/Spinner';

export function Field({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const f = useFieldCtx();
  const cls = ['root', f.status === 'invalid' && 'invalid', className]
    .filter(Boolean)
    .join(' ');
  return (
    <div
      data-ds-component="Field"
      className={cls}
      role="group"
      aria-labelledby={f.labelId}
      data-status={f.status}
    >
      <div className="header">
        <Label />
      </div>
      <div className="control">
        {children}
        {f.status === 'validating' ? (
          <span aria-live="polite" className="validatingIndicator">
            <Spinner size="sm" ariaHidden />
          </span>
        ) : null}
      </div>
      <div className="meta">
        <ErrorText />
        <HelpText />
      </div>
    </div>
  );
}

// Slot components for explicit composition
Field.Label = Label;
Field.Label.displayName = 'Field.Label';

Field.Error = ErrorText;
Field.Error.displayName = 'Field.Error';

Field.Help = HelpText;
Field.Help.displayName = 'Field.Help';

export default Field;
