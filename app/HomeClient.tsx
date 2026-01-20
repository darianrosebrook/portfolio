'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/context/ReducedMotionContext';
import { AnimatedText } from '@/ui/components/AnimatedText';
import { AnimatedSection } from '@/ui/components/AnimatedSection';
import Avatar from '@/ui/components/Avatar';
import Button from '@/ui/components/Button';
import Status from '@/ui/components/Status';
import LogoMaruqee from '@/ui/modules/LogoMarquee';
import Image from 'next/image';
import BlueprintsWrapper from './BlueprintsWrapper';
import styles from './page.module.scss';
import { EASING_PRESETS, EDITORIAL_STAGGER } from '@/utils/animation';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomeClientProps {
  ldJson: Record<string, unknown>;
}

export default function HomeClient({ ldJson }: HomeClientProps) {
  const { prefersReducedMotion } = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const profileImageRef = useRef<HTMLDivElement>(null);
  const secondLineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Animate hero section elements
      if (heroRef.current) {
        const statusBadge = heroRef.current.querySelector('.gooey');
        if (statusBadge) {
          gsap.fromTo(
            statusBadge,
            { opacity: 0, y: -20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: EASING_PRESETS.smooth,
              delay: 0.2,
            }
          );
        }
      }

      // Animate second line of hero heading (blur-in without word wrapping)
      if (secondLineRef.current) {
        gsap.fromTo(
          secondLineRef.current,
          { opacity: 0, y: 20, filter: 'blur(4px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: EASING_PRESETS.editorial,
            delay: 0.5,
          }
        );
      }

      // Animate profile image with scale reveal
      if (profileImageRef.current) {
        gsap.fromTo(
          profileImageRef.current,
          { opacity: 0, scale: 1.02 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: EASING_PRESETS.smooth,
            scrollTrigger: {
              trigger: profileImageRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <section className={styles.hero}>
        <div ref={heroImageRef} className={styles.heroImage}>
          <BlueprintsWrapper />
          <div className={styles.cover}></div>
        </div>
        <div ref={heroRef} className={styles.headingHero}>
          <div
            className="gooey"
            style={{ opacity: prefersReducedMotion ? 1 : 0 }}
          >
            <Status status="error">Not looking for work</Status>
          </div>
          <h1 className="gooey">
            <span>
              <AnimatedText
                text="Staff Design Technologist"
                as="span"
                variant="blur-in"
                delay={0.4}
                className={styles.firstLine}
              />
            </span>
            <br />
            <span
              ref={secondLineRef}
              className={styles.secondLine}
              style={{ opacity: prefersReducedMotion ? 1 : 0 }}
            >
              Connecting Design → Code with Design Systems & Custom Plugins
            </span>
          </h1>
        </div>
      </section>
      <section className={styles.quip}>
        <LogoMaruqee />
      </section>
      <section className="home">
        <AnimatedSection
          as="div"
          className="hero content"
          variant="fade-up"
          triggerOnScroll={true}
        >
          <div
            ref={profileImageRef}
            style={{ opacity: prefersReducedMotion ? 1 : 0 }}
          >
            <Image
              src="/darianrosebrook-optimized.webp"
              alt="Picture of Darian Rosebrook cropped close from the chest and shoulders, wearing a sweater. They are looking off to their right, a slight smile on their face. Curly dark hair about 3 inches long. They seem tired."
              width={540}
              height={675}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 540px"
            />
          </div>
        </AnimatedSection>
        <AnimatedSection
          as="div"
          className="content"
          variant="stagger-children"
          triggerOnScroll={true}
        >
          <h2 className="light">Darian Rosebrook</h2>
          <h3 className="light secondary">Staff Design Technologist</h3>
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
            As a seasoned Product Designer with a strong background in UX
            engineering, I specialize in crafting robust design systems and
            developing custom design tooling for Figma that revolutionizes
            product development workflows. Based in Seattle, Washington, I
            thrive at the intersection of design and development, where I
            dedicate my efforts to streamlining collaboration and optimizing
            product development cycles.
          </p>

          <p>
            With a unique blend of design and development expertise, I excel at
            bridging the gap between design and engineering teams, enhancing the
            user experience for both when interacting with design systems. By
            creating custom tooling that integrates Figma with GitHub, I enable
            seamless workflows that drive innovation and foster a collaborative
            environment, ultimately accelerating the delivery of exceptional
            designs to customers.
          </p>

          <p>
            Throughout my career, I have successfully led cross-functional teams
            through highly technical projects, collaborating with project
            managers and development leads to break down complex initiatives
            into manageable arcs of work. By effectively managing and delegating
            resources, I ensure the smooth execution of projects, delivering
            results that exceed expectations.
          </p>
          <p>
            If you&apos;re passionate about design and want to discuss how we
            can collaborate to create innovative solutions, feel free to reach
            out! I&apos;m always eager to connect with like-minded professionals
            and explore new opportunities in UX and Product Design.
          </p>
          <p>
            <a
              href="https://drive.google.com/file/d/1h2QH7K7153QGbW59CHWWt07Dzhgzst3a/view?usp=sharingue"
              target="_blank"
              rel="noopener noreferrer"
            >
              My resume
            </a>
          </p>
        </AnimatedSection>
        <AnimatedSection
          as="div"
          className="content"
          variant="fade-up"
          triggerOnScroll={true}
        >
          <p>
            <strong>Strategic skillset</strong>
          </p>
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
        </AnimatedSection>
        <AnimatedSection
          as="div"
          className="content"
          variant="fade-up"
          triggerOnScroll={true}
        >
          <p>
            <strong>Technical skillset</strong>
          </p>
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
            <li>Rust</li>
            <li>Python</li>
            <li>Node.js</li>
            <li>Mobile Development</li>
            <li>Kotlin</li>
            <li>SwiftUI</li>
            <li>Java</li>
          </ul>
        </AnimatedSection>
      </section>
      <AnimatedSection
        as="section"
        className={styles.marquee}
        variant="fade-up"
        triggerOnScroll={true}
      >
        <div className="content">
          <h3>Where I&#8217;ve been</h3>
          <p className="body-01">
            Over the last ten years, I have spent my career building up skills
            at creating, maintaining, and scaling design systems across
            different sized initiatives.
          </p>
          <p className="body-01">
            For large and small brands alike, throughout my career, I have
            successfully led cross-functional teams through highly technical
            projects, collaborating with project managers and development leads
            to break down complex initiatives into manageable arcs of work. By
            effectively managing and delegating resources, I ensure the smooth
            execution of projects, delivering results that exceed expectations.
          </p>
          <p className="body-01">
            I am passionate about making things that make it easier for people
            to make things, and love a challenge when it comes to interesting
            problems to solve for.
          </p>
          <p className="body-01">
            You can see some of the places where I have worked to make their
            brand excel through my work with design systems{' '}
          </p>
          <p>
            p.s. A lot of this site is still a work in progress, as is the folly
            of all portfolio sites. haha
          </p>
          <Button href="/work" as="a" variant="secondary">
            View my work &#8594;
          </Button>
        </div>
      </AnimatedSection>
    </>
  );
}
