import React from 'react';
import Switch from '@/ui/components/Switch';
import { useFieldControl } from './useFieldControl';

export interface SwitchAdapterProps {
  className?: string;
  ariaDescription?: string;
  children: React.ReactNode;
}

export function SwitchAdapter({
  className,
  ariaDescription,
  children,
}: SwitchAdapterProps) {
  const { controlProps, field } = useFieldControl<HTMLInputElement>();
  const descriptionId = ariaDescription
    ? `${controlProps.id}-description`
    : undefined;
  const ariaDescribedBy =
    [controlProps['aria-describedby'] as string | undefined, descriptionId]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <Switch
      id={controlProps.id}
      checked={!!field.value}
      onChange={(e) => field.setValue(e.currentTarget.checked)}
      onBlur={controlProps.onBlur as React.FocusEventHandler<HTMLInputElement>}
      disabled={!!controlProps.disabled}
      required={controlProps.required}
      readOnly={!!controlProps.readOnly}
      ariaLabel={typeof children === 'string' ? children : undefined}
      ariaDescription={ariaDescription}
      name={controlProps.name as string}
      aria-labelledby={controlProps['aria-labelledby'] as string}
      aria-describedby={ariaDescribedBy}
      aria-errormessage={
        controlProps['aria-errormessage'] as string | undefined
      }
      aria-invalid={controlProps['aria-invalid'] as boolean | undefined}
      className={className}
    >
      {children}
    </Switch>
  );
}

export default SwitchAdapter;
