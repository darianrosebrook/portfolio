import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';

/**
 * @typedef {Object} GlossaryItem
 * @property {string} id           - Unique identifier for the glossary item
 * @property {string} name         - Name of the glossary item
 * @property {string} letter       - Letter or symbol for the item
 * @property {IconDefinition} [icon] - Optional FontAwesome icon
 * @property {string} description  - Short description of the concept
 */
export type GlossaryItem = {
  id: string;
  name: string;
  letter: string;
  icon?: IconDefinition;
  description: string;
  resources?: {
    href: string;
    label: string;
    description: string;
    external: boolean;
  }[];
};

export const glossaryItems: GlossaryItem[] = [
  {
    id: '01',
    name: 'Accessibility',
    letter: 'A',
    icon: byPrefixAndName['far']['wheelchair-move'],
    description:
      'Designing interfaces so they are perceivable, operable, understandable, and robust for all users, including those who rely on assistive technologies. This involves semantic markup, ARIA roles, keyboard navigation support, sufficient color contrast, and focus management to ensure screen readers, voice control, and alternative input devices can interact with every element.',
    resources: [
      {
        href: '/blueprints/foundations/accessibility/philosophy',
        label: 'Accessibility Philosophy',
        description:
          'Core philosophy and principles for accessibility in our design system.',
        external: false,
      },
      {
        href: '/blueprints/foundations/accessibility/standards',
        label: 'Accessibility Standards',
        description: 'Detailed accessibility standards and requirements.',
        external: false,
      },
      {
        href: '/blueprints/foundations/accessibility/tokens',
        label: 'Accessibility Tokens',
        description: 'Design tokens related to accessibility.',
        external: false,
      },
    ],
  },
  {
    id: '02',
    name: 'Design Tokens',
    letter: 'D',
    icon: byPrefixAndName['far']['cubes-stacked'],
    description:
      'A system of named, platform-agnostic variables that capture fundamental design decisions - such as color, spacing, typography, and motion - in a centralized repository. By serving as the single source of truth for both designers and developers, tokens enable consistent theming, easy brand customization, scalability across multiple platforms, and streamlined maintenance throughout the product lifecycle.',
    resources: [
      {
        href: '/blueprints/foundations/theming',
        label: 'Theming',
        description: 'How design tokens enable theming in our system.',
        external: false,
      },
      {
        href: '/blueprints/foundations/tokens',
        label: 'Token Standards',
        description: 'Standards for defining and using design tokens.',
        external: false,
      },
    ],
  },
  {
    id: '03',
    name: 'Slots',
    letter: 'S',
    icon: byPrefixAndName['far']['square-dashed'],
    description:
      'A pattern for creating highly flexible components by defining placeholder "slots" within a component\'s template where custom content or child components can be injected. Slots preserve the encapsulation of the base component while empowering developers to tailor markup and behavior for diverse use cases without altering the underlying implementation.',
    resources: [
      {
        href: '/blueprints/component-standards',
        label: 'Component Standards',
        description: 'Best practices for component flexibility and slot usage.',
        external: false,
      },
    ],
  },
  {
    id: '04',
    name: 'Governance',
    letter: 'G',
    icon: byPrefixAndName['far']['shield-check'],
    description:
      'The framework of processes, roles, and decision-making guidelines that dictates how a design system is contributed to, reviewed, and evolved. Governance covers version control policies, design review workflows, contribution guidelines, and stakeholder alignment activities, ensuring system consistency, quality control, and community buy-in over time.',
    resources: [
      {
        href: '/blueprints/foundations/governance',
        label: 'Governance',
        description: 'How we govern the design system.',
        external: false,
      },
    ],
  },
  {
    id: '05',
    name: 'Component Props',
    letter: 'C',
    icon: byPrefixAndName['far']['sliders-v'],
    description:
      'The configurable inputs or attributes provided to components that control their visual appearance, content, and behavior. Clear, well-typed props with thorough documentation enable predictable customization, enforce type safety, and establish a reliable contract between component authors and consumers, fostering reusable and maintainable code.',
  },
  {
    id: '06',
    name: 'Spacing',
    letter: 'S',
    icon: byPrefixAndName['far']['distribute-spacing-horizontal'],
    description:
      'A set of standardized measurements - often defined as tokens - for margins, padding, and gaps that govern the whitespace within and between UI elements. Consistent spacing scales maintain visual rhythm, improve readability, and ensure harmonious layouts across different components and screen sizes.',
    resources: [
      {
        href: '/blueprints/foundations/spacing',
        label: 'Spacing & Sizing',
        description: 'Guidelines and tokens for spacing and sizing in layouts.',
        external: false,
      },
    ],
  },
  {
    id: '07',
    name: 'Playbook',
    letter: 'P',
    icon: byPrefixAndName['far']['book'],
    description:
      "A comprehensive guide that documents the design system's patterns, workflows, best practices, and decision rationales. A playbook serves as a centralized reference for onboarding new team members, aligning cross-functional stakeholders on conventions, and capturing tribal knowledge to streamline collaboration and accelerate design-to-development handoff.",
    resources: [
      {
        href: '/blueprints',
        label: 'Design System Blueprints',
        description:
          'Overview and entry point for all design system documentation.',
        external: false,
      },
    ],
  },
  {
    id: '08',
    name: 'Font Ramp',
    letter: 'F',
    icon: byPrefixAndName['far']['text-height'],
    description:
      'A curated scale of typographic sizes mapped to specific UI roles - such as headings, body text, captions, and labels - often implemented as tokens that support fluid or responsive scaling. A font ramp establishes typographic hierarchy, optimizes readability across devices, and enforces consistent text styling throughout the interface.',
    resources: [
      {
        href: '/blueprints/foundations/typography',
        label: 'Typography',
        description: 'Typographic scales, font ramps, and text roles.',
        external: false,
      },
    ],
  },
  {
    id: '09',
    name: 'Typography',
    letter: 'T',
    icon: byPrefixAndName['far']['font-case'],
    description:
      'The rules and assets governing typeface selection, font weights, line heights, letter spacing, and usage guidelines to achieve readability, tone, and brand consistency. Typography also encompasses responsive scaling, variable font techniques, accessibility considerations (contrast and legibility), and cross-platform uniformity.',
    resources: [
      {
        href: '/blueprints/foundations/typography',
        label: 'Typography',
        description: 'Typography guidelines, scales, and best practices.',
        external: false,
      },
    ],
  },
  {
    id: '10',
    name: 'Color Palette',
    letter: 'C',
    icon: byPrefixAndName['far']['droplet'],
    description:
      'A defined collection of brand and functional colors - primary, secondary, neutrals, alerts, and accents - paired with usage guidelines that specify when and how each hue should be applied. A robust palette ensures visual coherence, accessibility compliance (contrast ratios), and adaptability for theming and contextual variations.',
    resources: [
      {
        href: '/blueprints/foundations/color',
        label: 'Color',
        description: 'Color palette, tokens, and usage guidelines.',
        external: false,
      },
    ],
  },
  {
    id: '11',
    name: 'Component Library',
    letter: 'C',
    icon: byPrefixAndName['far']['cubes'],
    description:
      'A centralized repository of reusable UI components, each accompanied by documented APIs, accessibility considerations, usage examples, and visual specifications. A well-maintained component library accelerates development, reduces duplication, and fosters consistency by providing a shared set of building blocks for design and engineering teams.',
    resources: [
      {
        href: '/blueprints/component-standards',
        label: 'Component Standards',
        description: 'Documentation and standards for reusable UI components.',
        external: false,
      },
    ],
  },
  {
    id: '12',
    name: 'Grid System',
    letter: 'G',
    icon: byPrefixAndName['far']['objects-column'],
    description:
      'A layout framework composed of columns, gutters, and margins that defines how content is aligned, spaced, and structured on a page. An adaptable grid system supports responsive breakpoints, establishes a consistent visual rhythm, and simplifies the creation of complex layouts across devices.',
    resources: [
      {
        href: '/blueprints/foundations/grid',
        label: 'Grid Systems',
        description: 'Grid systems, columns, and layout structure.',
        external: false,
      },
    ],
  },
  {
    id: '13',
    name: 'Elevation',
    letter: 'E',
    icon: byPrefixAndName['far']['layer-plus'],
    description:
      'A visual design concept that uses shadows, layering, and z-index values to convey depth, hierarchy, and interactivity. Consistent elevation levels guide user focus, differentiate interactive surfaces from the background, and reinforce spatial relationships between elements in the interface.',
    resources: [
      {
        href: '/blueprints/foundations/elevation',
        label: 'Elevation & Shadows',
        description: 'Elevation tokens, shadows, and depth guidelines.',
        external: false,
      },
    ],
  },
  {
    id: '14',
    name: 'Iconography',
    letter: 'I',
    icon: byPrefixAndName['far']['icons'],
    description:
      'A curated set of symbols and visual metaphors that communicate actions, statuses, and concepts in a compact form. Iconography guidelines cover stylistic consistency (stroke weight, grid alignment), semantic clarity, accessibility (aria-labels and alt text), and source or licensing information to ensure icons are used appropriately and effectively.',
    resources: [
      {
        href: '/blueprints/foundations/icons',
        label: 'Icons',
        description: 'Iconography, usage, and accessibility.',
        external: false,
      },
    ],
  },
  {
    id: '15',
    name: 'Automation',
    letter: 'A',
    icon: byPrefixAndName['far']['conveyor-belt-arm'],
    description:
      'Scripts, CLI tools, and build processes that automate repetitive or error-prone tasks - such as token generation, style audits, accessibility checks, and release workflows - to improve efficiency and reduce manual overhead. Automation can integrate with design tools and CI/CD pipelines to enforce standards and maintain quality at scale.',
    resources: [
      {
        href: '/blueprints/foundations/tooling/automation',
        label: 'Automation & CI/CD',
        description: 'Automation, pipelines, and CI/CD for design systems.',
        external: false,
      },
    ],
  },
  {
    id: '16',
    name: 'Design Principles',
    letter: 'P',
    icon: byPrefixAndName['far']['gavel'],
    description:
      'The foundational philosophies and heuristics - such as clarity, consistency, accessibility, and scalability - that guide design decisions and component behaviors within the system. Clear principles align teams on core values, inform trade-off reasoning, and ensure a cohesive user experience across products.',
    resources: [
      {
        href: '/blueprints',
        label: 'Design System Blueprints',
        description: 'Core philosophies and principles for the design system.',
        external: false,
      },
    ],
  },
  {
    id: '17',
    name: 'Component Variants',
    letter: 'V',
    icon: byPrefixAndName['far']['layer-group-plus'],
    description:
      'Predefined stylistic or behavioral configurations of a base component - such as size, theme, or state - that group related props into named presets. Variants streamline component APIs by providing common use cases out of the box, while still allowing further customization when needed.',
    resources: [
      {
        href: '/blueprints/component-standards/states',
        label: 'Component States & Variants',
        description: 'Defining and documenting component states and variants.',
        external: false,
      },
    ],
  },
  {
    id: '18',
    name: 'Token Aliasing',
    letter: 'A',
    icon: byPrefixAndName['far']['link-horizontal'],
    description:
      'A technique for mapping high-level semantic tokens (e.g., "primary-button-color") to underlying design token values (e.g., palette swatches) to decouple usage intent from implementation. Aliasing facilitates global theme adjustments without modifying component code, enhancing maintainability and flexibility.',
    resources: [
      {
        href: '/blueprints/foundations/meta/theming',
        label: 'Theming Strategies',
        description: 'Token aliasing and theming strategies.',
        external: false,
      },
    ],
  },
  {
    id: '19',
    name: 'Responsive Design',
    letter: 'R',
    icon: byPrefixAndName['far']['mobile-android'],
    description:
      'An approach to UI development that ensures layouts, typography, and interactions adapt fluidly to various screen sizes and devices using fluid grids, flexible images, and media queries. Responsive design prioritizes content accessibility and usability on both mobile and desktop contexts without compromising the visual experience.',
    resources: [
      {
        href: '/blueprints/foundations/layout',
        label: 'Layout & Responsive Design',
        description: 'Responsive layouts, breakpoints, and adaptive design.',
        external: false,
      },
    ],
  },
  {
    id: '20',
    name: 'Tooling',
    letter: 'T',
    icon: byPrefixAndName['far']['hammer-brush'],
    description:
      'The suite of utilities, plugins, and integrations - such as linters, code generators, design-tool plugins, and component playgrounds - that support the creation, maintenance, and consumption of the design system. Effective tooling enhances developer experience, enforces standards, and accelerates design-to-code workflows.',
    resources: [
      {
        href: '/blueprints/foundations/tooling/code',
        label: 'Code Tooling',
        description: 'Code tooling, linters, and developer utilities.',
        external: false,
      },
    ],
  },
  {
    id: '21',
    name: 'Breakpoints',
    letter: 'B',
    icon: byPrefixAndName['far']['columns-3'],
    description:
      'Defined viewport width thresholds where layout, typography, and component behavior adjust to accommodate different device form factors. Breakpoints work in tandem with responsive grids and fluid scaling techniques to create adaptive experiences that maintain usability and visual harmony.',
    resources: [
      {
        href: '/blueprints/foundations/layout',
        label: 'Layout & Breakpoints',
        description: 'Breakpoints and responsive layout strategies.',
        external: false,
      },
    ],
  },
  {
    id: '22',
    name: 'Dark Mode',
    letter: 'D',
    icon: byPrefixAndName['far']['adjust'],
    description:
      'An alternate theming strategy that switches the color palette, contrast levels, and shading to optimize interfaces for low-light environments, reduce eye strain, and conserve battery life on OLED displays. Dark mode guidelines include token definitions, accessibility checks, and smooth transition patterns for toggling between themes.',
    resources: [
      {
        href: '/blueprints/foundations/meta/theming',
        label: 'Theming Strategies',
        description: 'Dark mode, theming, and color strategies.',
        external: false,
      },
    ],
  },
  {
    id: '23',
    name: 'RTL Support',
    letter: 'R',
    icon: byPrefixAndName['far']['exchange'],
    description:
      'The conventions, CSS techniques, and content adjustments required to properly render and interact with right-to-left languages - such as Arabic and Hebrew - including layout mirroring, text direction, and context-aware iconography. RTL support ensures global accessibility and localization readiness.',
    resources: [
      {
        href: '/blueprints/foundations/layout',
        label: 'Layout & Localization',
        description: 'RTL support and layout mirroring strategies.',
        external: false,
      },
    ],
  },
  {
    id: '24',
    name: 'Localization',
    letter: 'L',
    icon: byPrefixAndName['far']['globe'],
    description:
      'The process of adapting UI content, formatting (dates, numbers), and design layouts to meet the linguistic, cultural, and regulatory requirements of different regions. Localization encompasses translation workflows, pluralization rules, region-specific assets, and right-to-left accommodations to deliver a contextually accurate user experience.',
    resources: [
      {
        href: '/blueprints/foundations/layout',
        label: 'Layout & Localization',
        description: 'Localization and internationalization strategies.',
        external: false,
      },
    ],
  },
  {
    id: '25',
    name: 'Motion',
    letter: 'M',
    icon: byPrefixAndName['far']['wand-magic-sparkles'],
    description:
      'Guidelines, tokens, and design patterns for defining animations, transitions, and interactive feedback - such as easing curves, durations, and keyframe definitions - that enhance usability and delight without compromising performance. Motion design balances aesthetic appeal, accessibility (respecting reduced-motion preferences), and user guidance.',
    resources: [
      {
        href: '/blueprints/foundations/motion',
        label: 'Motion & Duration',
        description: 'Motion tokens, animation guidelines, and accessibility.',
        external: false,
      },
    ],
  },
  {
    id: '26',
    name: 'States',
    letter: 'S',
    icon: byPrefixAndName['far']['check-square'],
    description:
      'The visual and interactive representations of component statuses - such as default, hover, active, focus, disabled, and loading - and their associated style treatments and behavioral expectations. Well-defined states improve usability and accessibility by clearly signaling interactivity and providing consistent user feedback.',
    resources: [
      {
        href: '/blueprints/component-standards/states',
        label: 'Component States & Variants',
        description: 'Defining and documenting component states and variants.',
        external: false,
      },
    ],
  },
  {
    id: '27',
    name: 'Testing',
    letter: 'T',
    icon: byPrefixAndName['far']['flask'],
    description:
      'The strategies, frameworks, and tooling - such as unit tests, integration tests, visual regression tests, and accessibility audits - used to validate component functionality, appearance, and performance over time. A comprehensive testing approach catches regressions early, ensures system reliability, and builds confidence in design system updates.',
    resources: [
      {
        href: '/blueprints/foundations/tooling/code',
        label: 'Code Tooling',
        description: 'Testing, code quality, and developer utilities.',
        external: false,
      },
    ],
  },
  {
    id: '28',
    name: 'Performance',
    letter: 'P',
    icon: byPrefixAndName['far']['bolt-lightning'],
    description:
      'Metrics, best practices, and optimization techniques - such as code splitting, lazy loading, tree shaking, and critical CSS extraction - that ensure fast load times, smooth interactions, and efficient resource usage. Performance considerations span from asset optimization to runtime rendering strategies across diverse devices and network conditions.',
    resources: [
      {
        href: '/blueprints/foundations',
        label: 'Foundations',
        description: 'Performance, optimization, and best practices.',
        external: false,
      },
    ],
  },
  {
    id: '29',
    name: 'Documentation',
    letter: 'D',
    icon: byPrefixAndName['far']['file-lines'],
    description:
      'Structured guides, API references, design token catalogs, and interactive examples that provide clarity and instruction for system contributors and consumers. High-quality documentation offers searchability, version tracking, and contextual usage scenarios to streamline onboarding and reduce support overhead.',
    resources: [
      {
        href: '/blueprints',
        label: 'Design System Blueprints',
        description: 'Documentation, guides, and onboarding resources.',
        external: false,
      },
    ],
  },
  {
    id: '30',
    name: 'Versioning',
    letter: 'V',
    icon: byPrefixAndName['far']['stream'],
    description:
      'The scheme for assigning, tracking, and communicating design system releases - often using semantic versioning - to manage backward compatibility, feature deprecation, and upgrade paths for consumers. Clear versioning fosters trust, enables controlled rollouts, and simplifies maintenance of dependent projects.',
    resources: [
      {
        href: '/blueprints',
        label: 'Design System Blueprints',
        description: 'Versioning, release management, and change tracking.',
        external: false,
      },
    ],
  },
  {
    id: '31',
    name: 'Onboarding',
    letter: 'O',
    icon: byPrefixAndName['far']['user-plus'],
    description:
      'A curated set of tutorials, walkthroughs, and interactive guides that help new users and teams quickly understand, integrate, and contribute to the design system. Effective onboarding reduces the time to adoption, clarifies governance processes, and encourages community participation.',
    resources: [
      {
        href: '/blueprints/foundations/onboarding',
        label: 'Onboarding',
        description: 'Onboarding and getting started with the design system.',
        external: false,
      },
    ],
  },
  {
    id: '32',
    name: 'Prototyping',
    letter: 'P',
    icon: byPrefixAndName['far']['object-intersect'],
    description:
      'The practice of building interactive mockups or sandbox environments - using tools like Storybook, Figma, or code playgrounds - to test component behaviors, validate design concepts, and refine user flows before production. Prototyping accelerates feedback loops, uncovers usability issues early, and aligns stakeholders on the intended experience.',
    resources: [
      {
        href: '/blueprints/foundations/prototyping',
        label: 'Prototyping',
        description: 'Prototyping and testing design concepts.',
        external: false,
      },
    ],
  },
  {
    id: '33',
    name: 'Contribution Guidelines',
    letter: 'C',
    icon: byPrefixAndName['far']['user'],
    description:
      "A clear set of rules and conventions for how to propose, review, and merge changes to the design system's code, documentation, and tokens. Good guidelines outline branch naming, commit message format, review criteria, and sign-off requirements to streamline collaboration and maintain quality.",
    resources: [
      {
        href: '/blueprints/foundations/governance',
        label: 'Governance',
        description:
          'Contribution, review, and governance guidelines for the design system.',
        external: false,
      },
    ],
  },
  {
    id: '34',
    name: 'Token Naming Convention',
    letter: 'T',
    icon: byPrefixAndName['far']['tags'],
    description:
      'A standardized schema for naming design tokens—covering categories like color, spacing, typography, and motion—in a way that conveys intent, scope, and hierarchy. Consistent conventions reduce ambiguity, prevent token proliferation, and simplify automated tooling for token extraction and mapping.',
    resources: [
      {
        href: '/blueprints/foundations/meta/token-naming',
        label: 'Token Naming & Hierarchy',
        description: 'Naming conventions and hierarchy for design tokens.',
        external: false,
      },
    ],
  },
  {
    id: '35',
    name: 'Developer Experience (DX)',
    letter: 'D',
    icon: byPrefixAndName['far']['code'],
    description:
      'The overall quality of the tooling, documentation, and workflows that engineers encounter when integrating and extending the design system. High DX means clear code samples, auto-generated docs, IDE support, and smooth release processes that minimize friction and accelerate development.',
    resources: [
      {
        href: '/blueprints/foundations/tooling/code',
        label: 'Code Tooling',
        description: 'Developer tooling, documentation, and workflow support.',
        external: false,
      },
    ],
  },
  {
    id: '36',
    name: 'Design System Audit',
    letter: 'D',
    icon: byPrefixAndName['far']['clipboard'],
    description:
      'A periodic, systematic review of components, tokens, documentation, and usage patterns to identify inconsistencies, outdated assets, or accessibility gaps. Audits combine automated checks (linting, token coverage) with manual evaluations (visual reviews, user interviews) to keep the system healthy and aligned with evolving requirements.',
    resources: [
      {
        href: '/blueprints/foundations/tooling/automation',
        label: 'Automation & CI/CD',
        description: 'Automated checks and audit processes for design systems.',
        external: false,
      },
    ],
  },
  {
    id: '37',
    name: 'Performance Budget',
    letter: 'P',
    icon: byPrefixAndName['far']['money-bill'],
    description:
      'Predefined thresholds for key performance metrics—such as bundle size, render time, and animation smoothness—that guide design and development decisions. Enforcing a budget helps prevent regressions, encourages optimization (lazy loading, code splitting), and ensures the system remains performant on a variety of devices and network conditions.',
    resources: [
      {
        href: '/blueprints/foundations',
        label: 'Foundations',
        description: 'Performance, optimization, and best practices.',
        external: false,
      },
    ],
  },
  {
    id: '38',
    name: 'UI Patterns',
    letter: 'U',
    icon: byPrefixAndName['far']['rectangles-mixed'],
    description:
      'Reusable combinations of components and layout rules that solve common interface challenges—like form validation, data tables, or navigation bars—providing a higher-level blueprint than individual components. Documenting patterns clarifies when and how to assemble components for typical use cases, speeding design and guiding developers.',
    resources: [
      {
        href: '/blueprints/ux-patterns',
        label: 'UX Patterns',
        description: 'Reusable interface patterns and best practices.',
        external: false,
      },
    ],
  },
  {
    id: '39',
    name: 'Changelog',
    letter: 'C',
    icon: byPrefixAndName['far']['file-lines'],
    description:
      "A human-readable record of design system updates—new features, bug fixes, breaking changes, and deprecations—organized by version and release date. A well-maintained changelog fosters transparency, eases upgrades for consumers, and provides historical context for the system's evolution.",
    resources: [
      {
        href: '/blueprints',
        label: 'Design System Blueprints',
        description: 'Changelog and release notes for the design system.',
        external: false,
      },
    ],
  },
  {
    id: '40',
    name: 'Design System Roadmap',
    letter: 'D',
    icon: byPrefixAndName['far']['sign-post'],
    description:
      'A strategic plan that outlines upcoming priorities, milestones, and long-term goals for the design system—such as new component areas, major refactors, or accessibility initiatives. A roadmap aligns stakeholders, communicates expectations, and helps product teams plan their integrations around scheduled work.',
    resources: [
      {
        href: '/blueprints',
        label: 'Design System Blueprints',
        description: 'Roadmap and future plans for the design system.',
        external: false,
      },
    ],
  },
  {
    id: '41',
    name: 'Key Performance Indicators (KPIs)',
    letter: 'K',
    icon: byPrefixAndName['far']['chart-line'],
    description:
      "Quantitative metrics used to measure the design system's impact—like adoption rate, component reuse frequency, issue resolution time, and accessibility compliance. Tracking KPIs informs decisions about where to invest in improvements, demonstrates ROI to leadership, and highlights areas of technical debt or training needs.",
    resources: [
      {
        href: '/blueprints',
        label: 'Design System Blueprints',
        description: 'KPIs and measurement strategies for the design system.',
        external: false,
      },
    ],
  },
  {
    id: '42',
    name: 'Semantic HTML',
    letter: 'S',
    icon: byPrefixAndName['far']['code'],
    description:
      'The practice of using HTML elements according to their meaning (e.g., <button> for actions, <nav> for navigation, <article> for standalone content) to improve accessibility, SEO, and maintainability. Semantic markup gives assistive technologies and search engines reliable structure, and also provides a solid foundation for styling and scripting.',
    resources: [
      {
        href: '/blueprints/foundations/accessibility/standards',
        label: 'Accessibility Standards',
        description: 'Semantic HTML and accessibility best practices.',
        external: false,
      },
    ],
  },
];
