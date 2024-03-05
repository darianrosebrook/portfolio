import Image from "next/image";

export default function Home() {
  return (
    <main>
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
          <p>
            Hey there! I&apos;m <strong> Darian Rosebrook</strong>, a Product
            Designer specializing in design systems, design technology (UX
            engineering), and custom design tooling for Figma. Currently, I am
            based in the Portland, Oregon area, where I spend a lot of time in
            the city. My passion lies at finding the ideal intersection of the
            design process and the development pipeline, where I focus on fixing
            design collaboration and product development cycles.
          </p>
          <p>
            As a designer and developer hybrid, I bridge the gap in the product
            development cycle, enhancing the user experience for both design and
            engineering teams when they interact with our design system.
            I&apos;m often dedicating time to creating custom tooling between
            GitHub and Figma to streamline product development workflows,
            crafting robust design systems that drive innovation, and fostering
            a collaborative environment that encourages velocity to get designs
            into the hands of customers more quickly.
          </p>
          <p>
            I have been leading cross collaborative teams through highly
            technical projects for years now. Working with project managers and
            development leads to break large initiatives into smaller arcs of
            work, managing and delegating resources, and helping deliver through
            highly technical execution across a project.
          </p>
          <p>
            Throughout my career, I&apos;ve had the privilege of working with
            industry giants like eBay, Microsoft, Salesforce, and Nike,
            contributing to groundbreaking products and design systems. I&apos;m
            committed to continuously teaching and mentoring designers in the
            community, sharing my knowledge, and helping others reach their full
            potential.
          </p>
          <p>
            If you&apos;re passionate about design and want to discuss how we
            can collaborate to create innovative solutions, feel free to reach
            out! I&apos;m always eager to connect with like-minded professionals
            and explore new opportunities in UX and Product Design.
          </p>
            <p><a href="https://docs.google.com/document/d/1FaoQVYYH0htEI1gyb81V484xOkZbOSV2/edit?usp=sharing&ouid=107993876908625421793&rtpof=true&sd=true" target="_blank">My resume</a></p>
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
        <div className="content">
          <p>
            <strong>Strategic skillset</strong>
          </p>
          <ul>
            <li>
              Simplifying highly technical concepts for non-technical teams
            </li>
            <li>Running design system workshops</li>
            <li>Comprehensive design system documentation</li>
            <li>
              Planning and implementing automation pipelines for design system
              assets
            </li>
            <li>
              Developing full-featured design systems with high fidelity
              component libraries in Figma, Web, Android, and iOS
            </li>
            <li>
              Auditing design components created in React, Vue, or other web
              technologies, as well as native mobile design systems in Swift,
              Kotlin, or Java.
            </li>
            <li>
              Creating comprehensive guides and documentation on design system
              usage
            </li>
            <li>
              Enhancing the development experience by streamlining component
              library consumption
            </li>
            <li>
              Building custom Figma plugins that accelerate product design
              workflows, design system creation, and maintenance
            </li>
            <li>
              Implementing tooling and pipelines that keeps design and
              development closely in sync
            </li>
            <li>
              Establishing processes and workflows for design and development
              that optimize feedback, contribution, and adoption across teams
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
