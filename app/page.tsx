import Image from "next/image";

export default function Home() {
  return (
    <section className="home">
      <div className="hero">
        <Image
          src="/darianrosebrook.jpg"
          alt="Picture of Darian Rosebrook cropped close from the chest and shoulders, wearing a sweater. They are looking off to their right, a slight smile on their face. Curly dark hair about 3 inches long. They seem tired."
          width={540}
          height={675}
        />
      </div>
      <div className="content">
        <h2>Darian Rosebrook</h2>
        <h3>Product Designer</h3>
        <p>
          As a seasoned Product Designer with a strong background in UX
          engineering, I specialize in crafting robust design systems and
          developing custom design tooling for Figma that revolutionizes product
          development workflows. Based in Portland, Oregon, I thrive at the
          intersection of design and development, where I dedicate my efforts to
          streamlining collaboration and optimizing product development cycles.
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
          through highly technical projects, collaborating with project managers
          and development leads to break down complex initiatives into
          manageable arcs of work. By effectively managing and delegating
          resources, I ensure the smooth execution of projects, delivering
          results that exceed expectations.
        </p>
        <p>
          If you&apos;re passionate about design and want to discuss how we can
          collaborate to create innovative solutions, feel free to reach out!
          I&apos;m always eager to connect with like-minded professionals and
          explore new opportunities in UX and Product Design.
        </p>
        <p>
          <a
            href="https://docs.google.com/document/d/1FaoQVYYH0htEI1gyb81V484xOkZbOSV2/edit?usp=sharing&ouid=107993876908625421793&rtpof=true&sd=true"
            target="_blank"
          >
            My resume
          </a>
        </p>
        <p>
          Other places to find me:
          <a
            className="social-link"
            href="https://twitter.com/darianrosebrook"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-brands fa-twitter" aria-label="Twitter logo">
              <span>Twitter</span>
            </i>
          </a>
          <a
            className="social-link"
            href="https://instagram.com/darianrosebrook"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-brands fa-instagram" aria-label="Instagram logo">
              <span>Instagram</span>
            </i>
          </a>
          <a
            href="https://linkedin.com/in/darianrosebrook"
            className="social-link"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-brands fa-linkedin" aria-label="Linkedin Logo">
              <span>Linkedin</span>
            </i>
          </a>
          <a
            href="https://youtube.com/@darian.rosebrook"
            className="social-link"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-brands fa-youtube" aria-label="YouTube Logo">
              <span>YouTube</span>
            </i>
          </a>
          <a
            href="https://read.compassofdesign.com/@darianrosebrook"
            className="social-link"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-brands fa-medium" aria-label="Medium.com Logo">
              <span>Medium.com</span>
            </i>
          </a>
        </p>
      </div>
      <div className="content">
        <p>
          <strong>Strategic skillset</strong>
        </p>
        <p>Design</p>
        <ul>
          <li>
            Simplifying complex technical concepts for non-technical audiences,
            facilitating effective communication and collaboration across teams.
          </li>
          <li>
            Conducting comprehensive design system workshops, empowering teams
            to leverage design systems effectively.
          </li>
          <li>
            Creating and maintaining comprehensive design system documentation,
            ensuring clarity and consistency in usage.
          </li>
          <li>
            Implementing automation pipelines for design system assets,
            streamlining workflows and reducing manual effort.
          </li>
          <li>
            Developing full-featured design systems with high-fidelity component
            libraries for Figma, Web, Android, and iOS, ensuring a consistent
            user experience across platforms.
          </li>
          <li>
            Auditing design components created in various web and mobile
            technologies, ensuring adherence to best practices and design system
            guidelines.
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
            Designing, Developing, and Implementing tooling or pipelines that keep design and development
            closely in sync, fostering collaboration and reducing friction.
          </li>
          <li>
            Establishing processes and workflows that optimize feedback,
            contribution, and adoption across teams, creating a culture of
            continuous improvement.
          </li>
        </ul>
      </div><div className="content">
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
          <li>Mobile Development</li>
          <li>Kotlin</li>
          <li>SwiftUI</li>
          <li>Java</li>
          <li>Objective-C</li>
        </ul>
      </div>
    </section>
  );
}
