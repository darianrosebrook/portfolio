import Link from 'next/link';
// import Styles from './UXPatterns.module.scss';

const interactionPatterns = [
  {
    title: 'Navigation',
    desc: 'Patterns for moving through content, menus, and flows.',
    href: '/blueprints/ux-patterns/navigation',
  },
  {
    title: 'Feedback & Status',
    desc: 'How the system communicates progress, errors, and confirmations.',
    href: '/blueprints/ux-patterns/feedback',
  },
  {
    title: 'Input & Forms',
    desc: 'Best practices for collecting and validating user input.',
    href: '/blueprints/ux-patterns/forms',
  },
  {
    title: 'Dialogs & Overlays',
    desc: 'Modal, popover, and overlay interaction guidance.',
    href: '/blueprints/ux-patterns/dialogs',
  },
  {
    title: 'Selection & Actions',
    desc: 'Patterns for selecting, editing, and performing actions on content.',
    href: '/blueprints/ux-patterns/selection',
  },
];

const InteractionPatterns: React.FC = () => {
  return (
    <>
      <section className="content">
        <h1>Interaction Patterns</h1>
        <p>
          Interaction patterns are reusable solutions to common usability
          challenges. They help ensure consistency, predictability, and
          accessibility across your product. Explore foundational patterns for
          navigation, feedback, input, dialogs, and more.
        </p>
      </section>
      <section className="content">
        <h2>Core Patterns</h2>
        <div>
          {interactionPatterns.map(({ title, desc, href }) => (
            <div key={title} style={{ marginBottom: '2rem' }}>
              <h3>{title}</h3>
              <p>{desc}</p>
              <Link href={href}>Explore {title} →</Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default InteractionPatterns;
