import styles from '../page.module.scss';

export const metadata = {
  title: 'Field | Component Standards',
  description:
    'Field composer orchestrates labels, help text, errors, and validation across controls.',
  keywords: [
    'Field',
    'Composer',
    'Forms',
    'A11y',
    'Validation',
    'Design System',
  ],
  complexity: 'composer',
};

export default function Page() {
  return (
    <section className="content">
      <h1>Field</h1>
      <p className="caption">Complexity: Composer</p>
      <p style={{ opacity: 0.85 }}>
        Headless orchestration for labels, help text, errors, and validation
        across form controls. Provides stable ids and a11y associations with
        token-driven visuals.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <h2>API and Usage</h2>
        <p>
          Use <code>FieldProvider</code> to establish identity and validation,
          and wrap your control inside
          <code> Field</code>. Bind controls via adapters: TextInput, Textarea,
          Select, Checkbox, Switch, RadioGroup.
        </p>
      </div>
    </section>
  );
}
