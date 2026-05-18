import * as React from 'react';
import type {
  AnatomyPart,
  AnatomyPartType,
} from '../_lib/generateAnatomy';
import styles from './AnatomyTable.module.css';

interface AnatomyTableProps {
  parts: AnatomyPart[];
  componentName: string;
}

interface TypeLabel {
  label: string;
  tone: 'slot' | 'prop' | 'part' | 'root';
}

function typeToLabel(type: AnatomyPartType | undefined): TypeLabel {
  if (!type) return { label: 'Part', tone: 'part' };
  switch (type.kind) {
    case 'root':
      return { label: 'Root', tone: 'root' };
    case 'slot':
      return {
        label: type.required ? 'Slot (required)' : 'Slot',
        tone: 'slot',
      };
    case 'prop':
      return { label: type.propType, tone: 'prop' };
    case 'part':
    default:
      return { label: 'Part', tone: 'part' };
  }
}

export function AnatomyTable({ parts, componentName }: AnatomyTableProps) {
  return (
    <div
      className={styles.tableWrapper}
      role="region"
      aria-label={`${componentName} anatomy`}
    >
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className={styles.colProperty}>
              <span aria-hidden="true">❖</span> Property
            </th>
            <th scope="col" className={styles.colDescription}>
              <span aria-hidden="true">¶</span> Description
            </th>
            <th scope="col" className={styles.colType}>
              <span aria-hidden="true">δ</span> Type
            </th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => {
            const { label, tone } = typeToLabel(part.type);
            return (
              <tr key={part.name}>
                <th scope="row" className={styles.partName}>
                  <span aria-hidden="true" className={styles.glyph}>
                    {part.level === 0 ? '◆' : '◇'}
                  </span>
                  {part.name}
                </th>
                <td className={styles.partDescription}>
                  {part.description ?? '—'}
                </td>
                <td className={styles.partType}>
                  <span
                    className={`${styles.typePill} ${styles[`tone-${tone}`]}`}
                  >
                    {label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
