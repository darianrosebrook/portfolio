import React from 'react';

export function Button({
  label,
  variant,
}: {
  label: string;
  variant?: 'primary' | 'secondary';
}) {
  return <button className="btn btn-custom">{label}</button>;
}
