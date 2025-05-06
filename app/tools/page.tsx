import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';
import Status from '@/components/Status';
import styles from './page.module.scss';

/**
 * Design Tools landing page.
 *
 * This page showcases various design tools created, planned, or uniquely positioned to be built for design system maintainers.
 * @returns {JSX.Element}
 */
const DesignToolsPage = () => {
  const faCheckCircle = byPrefixAndName['far']['check-circle'];
  const faTimesCircle = byPrefixAndName['far']['times-circle'];

  const tools = [
    {
      icon: byPrefixAndName['far']['grid-2'],
      title: 'State Machine Visualizer',
      status: <Status status="info">in planning</Status>,
      desc: 'Visualizes data-state, ARIA roles, keyboard interactions, and transitions across variants in a component.',
      note: 'Aids debugging and ensures interaction parity across platforms (web, iOS, Android). Integrates directly with Storybook or Figma prototypes.',
    },
    {
      icon: byPrefixAndName['far']['file-alt'],
      title: 'Component Complexity Analyzer',
      status: <Status status="info">in planning</Status>,
      desc: "Analyzes a component's props, slots, states, interactions, and accessibility to determine architectural complexity.",
      note: 'Useful for roadmap planning, onboarding junior team members, or identifying high-maintenance components.',
    },
    {
      icon: byPrefixAndName['far']['file-edit'],
      title: 'Cross-Platform Implementation Tracker',
      status: <Status status="info">in planning</Status>,
      desc: (
        <span>
          Dashboard to show parity status across Web, iOS, Android (e.g.,{' '}
          <FontAwesomeIcon
            icon={faCheckCircle}
            style={{ color: 'var(--color-success)' }}
          />{' '}
          Web / iOS{' '}
          <FontAwesomeIcon
            icon={faTimesCircle}
            style={{ color: 'var(--color-error)' }}
          />{' '}
          / Android{' '}
          <FontAwesomeIcon
            icon={faCheckCircle}
            style={{ color: 'var(--color-success)' }}
          />
          ).
        </span>
      ),
      note: 'Designed for design systems like Radix-inspired blueprints that need consistent behavior across platforms.',
    },
    {
      icon: byPrefixAndName['far']['file-lines'],
      title: 'Design Token Diff & Changelog Generator',
      status: <Status status="info">in planning</Status>,
      desc: 'Tool that compares current vs. previous token files or component APIs to auto-generate release notes.',
      note: 'Especially valuable when collaborating across teams and documenting versioned changes in token packages.',
    },
    {
      icon: byPrefixAndName['far']['flask'],
      title: 'Design System Health Report',
      status: <Status status="info">in planning</Status>,
      desc: "Audits a Figma library or code repo for token misuse, inconsistent naming, undoc'd components, and accessibility gaps.",
      note: 'Offers quick insight into library hygiene, helping maintainers scale quality without constant manual review.',
    },
    {
      icon: byPrefixAndName['far']['newspaper'],
      title: 'Real-Time Interaction Previewer',
      status: <Status status="info">in planning</Status>,
      desc: 'Storybook addon or web playground that renders scroll/motion interactions with live token references.',
      note: 'Inspired by your Venmo animation work—supports GSAP, Framer Motion, etc. for testing motion tokens.',
    },
    {
      icon: byPrefixAndName['far']['id-card'],
      title: 'Foundation Generator',
      status: <Status status="info">in planning</Status>,
      desc: 'UI that generates spacing scales, type ramps, grids, and motion curves based on base units + constraints.',
      note: 'Useful for onboarding new teams into system foundations, especially with token export and cross-platform presets.',
    },
    {
      icon: byPrefixAndName['far']['sliders-h'],
      title: 'Typography Inspector & Glyph Analyzer',
      status: <Status status="success">Already built (prototype stage)</Status>,
      desc: 'Canvas-based tool that visualizes x-height, cap height, baselines, and Bezier curve anatomy.',
      note: 'Offers deep insight into font anatomy, rarely available in Figma or typical design tools—ideal for documenting typography tokens.',
    },
    {
      icon: byPrefixAndName['far']['file-pen'],
      title: 'Accessible Contrast Evaluator (APCA-Based)',
      status: <Status status="warning">Partially built / in planning</Status>,
      desc: 'Tool to check visual accessibility using APCA, with visualization of contrast curves and perceptual deltas.',
      note: 'Ideal for building compliant color palettes that go beyond WCAG 2.x heuristics, tying into your earlier color contrast work.',
    },
    {
      icon: byPrefixAndName['far']['file-text'],
      title: 'Component Blueprint Generator',
      status: <Status status="info">in planning</Status>,
      desc: (
        <>
          CLI or Figma plugin that scaffolds a new component with:
          <ul>
            <li>Default variants</li>
            <li>
              <code>data-*</code> attributes
            </li>
            <li>Accessibility notes</li>
            <li>Anatomy map</li>
            <li>Usage tips</li>
          </ul>
        </>
      ),
      note: "You've already authored content in this format. This turns documentation scaffolding into a predictable, repeatable pattern.",
    },
    {
      icon: byPrefixAndName['far']['flask'],
      title: 'Design System Onboarding Explorer',
      status: <Status status="info">in planning</Status>,
      desc: (
        <>
          Interactive UI that lets new designers explore:
          <ul>
            <li>Token usage examples</li>
            <li>Platform component parity</li>
            <li>Anatomy maps</li>
            <li>Authoring guidelines</li>
          </ul>
        </>
      ),
      note: 'Combines education and system documentation to shorten onboarding ramp time and encourage self-service.',
    },
    {
      icon: byPrefixAndName['far']['flask'],
      title: 'Slot & Prop Mapping Tool',
      status: <Status status="info">in planning</Status>,
      desc: 'Visual diff of component slots vs props—compares expected design variants with code implementation.',
      note: 'Especially useful for bridging the gap between Figma components and code implementations using Headless UI or Radix.',
    },
    {
      icon: byPrefixAndName['far']['flask'],
      title: 'Usage Heatmap for Design System Tokens',
      status: <Status status="info">in planning</Status>,
      desc: 'A Figma plugin that visually overlays which tokens are most or least used across files.',
      note: 'Helps identify overused tokens (e.g., primary-500 everywhere) or forgotten ones—insightful for curation and deprecation.',
    },
    {
      icon: byPrefixAndName['far']['flask'],
      title: 'Design-to-Code Sync Monitor',
      status: <Status status="info">in planning</Status>,
      desc: 'Watches for divergence between design file specs and component implementation via code metadata.',
      note: "Acts like a Git diff but for design \u2194 code parity, ideal in tokenized or fully spec'd design systems.",
    },
  ];

  return (
    <section className="content">
      <h1 className="heading-01">
        Featured Tools for Design System Maintainers
      </h1>
      <div className={styles['tool-grid']}>
        {tools.map((tool) => (
          <div className={styles['tool-card']} key={tool.title}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <FontAwesomeIcon icon={tool.icon} size="lg" />
              <h3 style={{ margin: 0 }}>{tool.title}</h3>
              {tool.status}
            </div>
            <div style={{ marginBottom: '1rem' }}>{tool.desc}</div>
            <blockquote style={{ opacity: 0.8 }}>{tool.note}</blockquote>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DesignToolsPage;
