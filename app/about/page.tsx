import type { Metadata } from 'next';
import Image from 'next/image';
import Avatar from '@/ui/components/Avatar';
import Button from '@/ui/components/Button';
import Bio from '@/ui/modules/Bio';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About | Darian Rosebrook',
  description:
    'Learn more about Darian Rosebrook, a Staff Design Technologist focused on design systems, custom tooling, and bridging the gap between design and development.',
  openGraph: {
    title: 'About | Darian Rosebrook',
    description:
      'Learn more about Darian Rosebrook, a Staff Design Technologist focused on design systems, custom tooling, and bridging the gap between design and development.',
    url: 'https://darianrosebrook.com/about',
    siteName: 'Darian Rosebrook',
    images: [
      {
        url: 'https://darianrosebrook.com/darianrosebrook.jpg',
        width: 1200,
        height: 630,
        alt: 'Darian Rosebrook',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | Darian Rosebrook',
    description:
      'Learn more about Darian Rosebrook, a Staff Design Technologist focused on design systems, custom tooling, and bridging the gap between design and development.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
    creator: '@darianrosebrook',
  },
  alternates: {
    canonical: 'https://darianrosebrook.com/about',
  },
};

export default function AboutPage() {
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Darian Rosebrook',
    url: 'https://darianrosebrook.com/about',
    image: 'https://darianrosebrook.com/darianrosebrook.jpg',
    jobTitle: 'Staff Design Technologist, Design Systems',
    description:
      'Staff Design Technologist and Design Systems Architect focused on scalable UI component libraries, accessibility, and cross-platform tooling for web, iOS, and Android.',
    worksFor: {
      '@type': 'Organization',
      name: 'Qualtrics',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Seattle',
      addressRegion: 'Washington',
      addressCountry: 'US',
    },
    sameAs: [
      'https://twitter.com/darianrosebrook',
      'https://www.linkedin.com/in/darianrosebrook/',
      'https://www.github.com/darianrosebrook',
      'https://www.instagram.com/darianrosebrook/',
      'https://www.youtube.com/@darian.rosebrook',
      'https://read.compassofdesign.com/@darianrosebrook',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <section className="content">
        <div className={styles.hero}>
          <Image
            src="/darianrosebrook-optimized.webp"
            alt="Picture of Darian Rosebrook cropped close from the chest and shoulders, wearing a sweater. They are looking off to their right, a slight smile on their face. Curly dark hair about 3 inches long. They seem tired."
            width={540}
            height={675}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 540px"
          />
        </div>
        <div className="content">
          <h1 className="light">About</h1>
          <div className="avatarFlag">
            <Avatar
              src="/darian-square.jpg"
              name="Darian Rosebrook"
              size="extra-large"
              priority
            />
            <div className="flag">
              <p>
                <strong>Darian Rosebrook</strong>
              </p>
              <p>
                <span className="icon">
                  <svg
                    height="16"
                    width="11"
                    fill="none"
                    viewBox="0 0 11 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.83721 10.12C8.1018 11.2333 7.36817 12.344 7.05091 13.6184C6.62733 15.3199 6.45793 16.0003 5.38302 16.0003C4.28287 16.0003 4.18609 15.6165 3.74974 13.8861C3.42209 12.5868 2.68835 11.4352 1.95406 10.2828C1.25762 9.18974 0.56069 8.09593 0.209267 6.87456C0.0730014 6.40098 0 5.9006 0 5.38318C0 2.41013 2.41013 0 5.38318 0C8.35622 0 10.7664 2.41013 10.7664 5.38318C10.7664 6.02616 10.6536 6.64281 10.4469 7.21445C10.0722 8.25031 9.45406 9.18608 8.83721 10.12ZM5.38298 8.97221C7.36501 8.97221 8.97177 7.36546 8.97177 5.38343C8.97177 3.4014 7.36501 1.79464 5.38298 1.79464C3.40095 1.79464 1.7942 3.4014 1.7942 5.38343C1.7942 7.36546 3.40095 8.97221 5.38298 8.97221Z"
                      fill="#D9D9D9"
                      fillRule="evenodd"
                    />
                  </svg>
                </span>
                Seattle, Washington
              </p>
            </div>
          </div>
          <p>
            I&apos;m Darian Rosebrook, a Staff Design Technologist with a
            background that bridges branding, UX, and system-level design
            engineering across some of the world&apos;s largest product
            ecosystems. I&apos;ve led work at Microsoft, Salesforce, Nike, eBay,
            Verizon, Venmo, and Qualtrics — usually on the parts of design
            systems that don&apos;t ship as components.
          </p>
          <Bio />
        </div>
        <div className="content">
          <h2>Experience</h2>
          <p>
            Across ten years of design system work, I&apos;ve led
            cross-functional initiatives that span design, engineering, product,
            accessibility, content, and research. The pattern is usually the
            same: identify where the system is losing precision, build the
            tooling or standards that re-encode that precision into the
            team&apos;s daily workflow, and leave the org with a clearer
            operating model than it had before.
          </p>
        </div>
        <div className="content">
          <h2>Strategic Skillset</h2>
          <p>Design</p>
          <ul>
            <li>
              Simplifying complex technical concepts for non-technical
              audiences, facilitating effective communication and collaboration
              across teams.
            </li>
            <li>
              Conducting comprehensive design system workshops, empowering teams
              to leverage design systems effectively.
            </li>
            <li>
              Creating and maintaining comprehensive design system
              documentation, ensuring clarity and consistency in usage.
            </li>
            <li>
              Implementing automation pipelines for design system assets,
              streamlining workflows and reducing manual effort.
            </li>
            <li>
              Developing full-featured design systems with high-fidelity
              component libraries for Figma, Web, Android, and iOS, ensuring a
              consistent user experience across platforms.
            </li>
            <li>
              Auditing design components created in various web and mobile
              technologies, ensuring adherence to best practices and design
              system guidelines.
            </li>
            <li>
              Enhancing the developer experience by optimizing component library
              consumption, promoting adoption and efficiency.
            </li>
            <li>
              Building custom Figma plugins that accelerate product design
              workflows, design system creation, and maintenance, enabling
              designers to work smarter, not harder.
            </li>
            <li>
              Designing, Developing, and Implementing tooling or pipelines that
              keep design and development closely in sync, fostering
              collaboration and reducing friction.
            </li>
            <li>
              Establishing processes and workflows that optimize feedback,
              contribution, and adoption across teams, creating a culture of
              continuous improvement.
            </li>
          </ul>
        </div>
        <div className="content">
          <h2>Technical Skillset</h2>
          <p>Design</p>
          <ul>
            <li>Design Management</li>
            <li>Design Systems</li>
            <li>Design Tokens</li>
            <li>User Research</li>
            <li>UX Design</li>
            <li>UX Engineering</li>
            <li>Figma Component Libraries</li>
          </ul>
          <p>Development</p>
          <ul>
            <li>Figma Plugin Development</li>
            <li>Figma API</li>
            <li>React</li>
            <li>Vue</li>
            <li>Angular</li>
            <li>Svelte</li>
            <li>Web Components</li>
            <li>Backend Development</li>
            <li>API Design</li>
            <li>Mobile Development</li>
            <li>Kotlin</li>
            <li>SwiftUI</li>
            <li>Java</li>
            <li>Objective-C</li>
          </ul>
        </div>
        <div className="content">
          <p>
            <a
              href="https://drive.google.com/file/d/1h2QH7K7153QGbW59CHWWt07Dzhgzst3a/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
            >
              View my resume
            </a>
          </p>
          <div className={styles.actions}>
            <Button href="/work" as="a" variant="primary">
              View my work
            </Button>
            <Button href="/articles" as="a" variant="secondary">
              Read articles
            </Button>
            <Button href="/blueprints" as="a" variant="secondary">
              Explore blueprints
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
