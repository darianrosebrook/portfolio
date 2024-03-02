import Image from "next/image";

export default function Home() {
  return (
    <main>
      <div>
        <Image
          src="/darianrosebrook.jpg"
          alt="Picture of Darian Rosebrook cropped close from the chest and shoulders, wearing a sweater. They are looking off to their right, a slight smile on their face. Curly dark hair about 3 inches long. They seem tired."
          width={540}
          height={675}
        />
      </div>
      <div className="container">
        <h1>Darian Rosebrook</h1>
        <p>Product Designer and Developer</p>
      </div>
      <div>
        <p>
          Hey there! I&apos;m Darian Rosebrook, a Lead Product Designer based in the
          Portland, Oregon area, specializing in design systems, design
          technology (UX engineering), and custom design tooling for Figma. My
          passion lies at the intersection of design operations and design
          systems, where I focus on fixing design collaboration and product
          development cycles by improving design processes and collaboration.
        </p>
        <p>
          As a designer and developer hybrid, I bridge the gap in the product
          development cycle, enhancing the experience for both design and
          engineering teams. I&apos;m dedicated to creating custom tooling between
          GitHub and Figma to streamline workflows, crafting robust design
          systems that drive innovation, and fostering a collaborative
          environment that encourages growth.
        </p>
        <p>My expertise includes:</p>
        <ul>
          <li>
            Planning and implementing automation pipelines for design system
            assets
          </li>
          <li>
            Developing full-featured design systems with high fidelity component
            libraries in Figma, React, Web Components, and Svelte
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
            Implementing tooling that keeps design and development closely in
            sync
          </li>
          <li>
            Establishing processes and workflows that optimize feedback,
            contribution, and adoption across teams
          </li>
        </ul>
        <p>
          Throughout my career, I&apos;ve had the privilege of working with industry
          giants like eBay, Microsoft, Salesforce, and Nike, contributing to
          groundbreaking products and design systems. I&apos;m committed to
          continuously teaching and mentoring designers in the community,
          sharing my knowledge, and helping others reach their full potential.
        </p>
        <p>
          If you&apos;re passionate about design and want to discuss how we can
          collaborate to create innovative solutions, feel free to reach out!
          I&apos;m always eager to connect with like-minded professionals and explore
          new opportunities in UX and Product Design.
        </p>

        <p>
          You can also find me here —
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
    </main>
  );
}
