import Link from 'next/link';
import type { ComponentItem } from '../_lib/componentsData';

export interface ComponentDocPageProps {
  item: ComponentItem;
  related: ComponentItem[];
}

export default function ComponentDocPage({
  item,
  related,
}: ComponentDocPageProps) {
  const {
    component,
    category,
    description,
    a11y,
    status,
    layer,
    alternativeNames,
  } = item;
  const complexityLabel = String(layer).replace(/s$/, '');

  return (
    <section className="content">
      <header>
        <h1>{component}</h1>
        {category ? <p className="caption">Category: {category}</p> : null}
        <p className="caption">Complexity: {capitalize(complexityLabel)}</p>
        {status ? <p className="caption">Status: {status}</p> : null}
        {description ? <p style={{ opacity: 0.85 }}>{description}</p> : null}
        {alternativeNames?.length ? (
          <div style={{ marginTop: '1rem' }}>
            <strong>Also known as:</strong>
            <ul>
              {alternativeNames.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>

      {a11y?.pitfalls?.length ? (
        <section style={{ marginTop: '1.5rem' }}>
          <h2>Accessibility</h2>
          <h3>Pitfalls</h3>
          <ul>
            {a11y.pitfalls.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section style={{ marginTop: '2rem' }}>
        <h2>API and Usage</h2>
        <p>
          This component has been scaffolded in{' '}
          <code>ui/components/{component}</code>. Fill in props, a11y notes, and
          examples in its README and token files.
        </p>
      </section>

      {related?.length ? (
        <section style={{ marginTop: '2rem' }}>
          <h2>Related</h2>
          <ul>
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/blueprints/component-standards/${r.slug}`}>
                  {r.component}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p style={{ marginTop: '2rem' }}>
        <Link href="/blueprints/component-standards">
          ← Back to Component Standards
        </Link>
      </p>
    </section>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
