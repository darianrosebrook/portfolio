import React from 'react';
import { SwitchField } from '@/ui/components/Switch';
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
    <SwitchField
      id={controlProps.id}
      label={children}
      description={ariaDescription}
      checked={!!field.value}
      onChange={(e) => field.setValue(e.currentTarget.checked)}
      disabled={!!controlProps.disabled}
      className={className}
    />
  );
}

export default SwitchAdapter;
