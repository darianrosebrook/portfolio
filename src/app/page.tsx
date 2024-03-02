import Image from "next/image";

export default function Home() {
  return (
    <main>
      <section>
        <div className="hero">
          <Image
            src="/darianrosebrook.jpg"
            alt="Picture of Darian Rosebrook cropped close from the chest and shoulders, wearing a sweater. They are looking off to their right, a slight smile on their face. Curly dark hair about 3 inches long. They seem tired."
            width={540}
            height={675}
          />
        </div>
        <div>
          <div className="container">
            <h1>Darian Rosebrook</h1>
            <p>Product Designer and Developer</p>
          </div>
          <p>
            Hey there! I&apos;m Darian Rosebrook, a Lead Product Designer based
            in the Portland, Oregon area, specializing in design systems, design
            technology (UX engineering), and custom design tooling for Figma. My
            passion lies at the intersection of design operations and design
            systems, where I focus on fixing design collaboration and product
            development cycles by improving design processes and collaboration.
          </p>
          <p>
            As a designer and developer hybrid, I bridge the gap in the product
            development cycle, enhancing the experience for both design and
            engineering teams. I&apos;m dedicated to creating custom tooling
            between GitHub and Figma to streamline workflows, crafting robust
            design systems that drive innovation, and fostering a collaborative
            environment that encourages growth.
          </p>
          <p>My expertise includes:</p>
          <ul>
            <li>
              Planning and implementing automation pipelines for design system
              assets
            </li>
            <li>
              Developing full-featured design systems with high fidelity
              component libraries in Figma, React, Web Components, and Svelte
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
      </section>
      <section data-print="true" className="projects">
        <h3>Projects</h3>
        <ul className="experience">
          <li>
            <div className="dateYear">
              <span>2023</span>
            </div> 
              <div>Iconography Sync <span> at eBay</span></div>
              <div className="">
                <p>
                  I've created a figma plugin for design system teams that
                  allows design and development to be closer in sync, allowing
                  for a fairly optimized and automated process for syncing our
                  design assets to our code assets through GitHub. Designers
                  have control over which of their designed assets gets output
                  from the tooling, developers have control over what gets
                  checked into the codebase, site, and packages. Utilizing
                  bidirectional sync with GitHub based on versioning, design and
                  development now have a dual turn key moment for releasing new
                  changes in things like iconography, design tokens, and
                  illustrations. Designers have the ability to see the status of
                  their work, and developers have visibility into what changes
                  are made instead of reaching blindly into the google folder to
                  grab all icons and hope that nothing breaks again
                </p>
                <p>
                  By bridging the gap between design and code here, I have saved
                  hours and hours of manual process for our team.
                </p>
              </div> 
          </li>
          <li>
            <div className="dateYear">
              <span>2022</span>
            </div>
            <div>
              Figma library sync<span> at Nike</span>
            </div>
            <div className="">
              <p>
                For our Nike foundations design system library, I created a
                figma plugin that takes the design tokens that are defined in
                one figma library and hoists them into other design system
                libraries managed by the different arms of our organizations.
                These libraries consume the base tokens in both design and code,
                while making sure their output from the organization level
                (enterprise, consumer, and marketing) allow their teams to best
                optimize their design system tokens and component libraries for
                their needs.
              </p>
              <p>
                This work allows for smartly checking for changes, deprecations,
                and updating referenced tokens in the library, a feature that
                figma severely lacked during this phase of their product.
              </p>
              <p>
                This tool augments the work we did for the foundations library,
                and helps keep design and development a lot closer together in
                code.
              </p>
            </div>
          </li>
          <li>
            {" "}
            <div className="dateYear">
              <span>2022</span>
            </div>
            <div>
              Podium Foundations Library<span> at Nike</span>
            </div>
            <div className="">
              <p>
                In late 2021, the Consumer, Marketing, and Enterprise leaders
                got together to figure out how to work towards an even tighter
                collaboration on design across our orgs. The result led to me
                and my lead developer on the enterprise design system to co-lead
                the effort with leads from each org to design a foundational
                library that feeds all three org-focused design systems. To pull
                redundancy of designing the design tokens, base components, and
                overall codebases, I helped architect and build several internal
                tools that take the existing properties of Figma libraries,
                branching, GitHub, and the Figma plugin system and created
                custom tooling that outputs and links our foundational figma
                library to GitHub for our developers, and links the foundational
                library to other figma libraries. This connection allows us to
                change underlying tokens in a turn key moment between design and
                development to ensure the updates to code and design can happen
                simultaneously with the correct values and little lag time.
              </p>
              <p>
                Through this, I helped facilitate intense design system
                workshops, build incredible tooling, and solve a long standing
                problem in large corporate design systems
              </p>
            </div>
          </li>
          <li>
            <div className="dateYear">
              <span>2021</span>
            </div>
            <div className="ProfileItem_title__rsz3J">
              <div>
                <a
                  className="MegaLink_megalink__u_TFB ProfileItem_titleLink__qXU7l"
                  href="http://Nike.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-hover="true"
                >
                  Podium Enterprise Design System<span> at Nike</span>
                </a>
                <span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.5 3C3.22386 3 3 3.22386 3 3.5C3 3.77614 3.22386 4 3.5 4V3ZM8.5 3.5H9C9 3.22386 8.77614 3 8.5 3V3.5ZM8 8.5C8 8.77614 8.22386 9 8.5 9C8.77614 9 9 8.77614 9 8.5H8ZM2.64645 8.64645C2.45118 8.84171 2.45118 9.15829 2.64645 9.35355C2.84171 9.54882 3.15829 9.54882 3.35355 9.35355L2.64645 8.64645ZM3.5 4H8.5V3H3.5V4ZM8 3.5V8.5H9V3.5H8ZM8.14645 3.14645L2.64645 8.64645L3.35355 9.35355L8.85355 3.85355L8.14645 3.14645Z"
                      fill="#eee"
                    ></path>
                  </svg>
                </span>
              </div>
            </div>
            <div className="">
              <p>
                I worked for 18 months designing and building the enterprise
                branch of the Nike design system. Prior to me joining, Nike had
                several micro design systems focused on internal tools built by
                various teams because the current system did not support their
                use case. During the transition to a new internal design
                organization called Technical Product Experience Design(TPxD),
                myself and several other designers brought several changes to
                the way Nike designs for internal experiences.
              </p>
              <p>
                Here I focused on creating a unified style that honors the
                consumer design library, yet crafts components and layouts for
                dense data, analytics, and form inputs. The system was served to
                several hundred teams and has garnered a high adoption rate
                across the org.
              </p>
            </div>
             
          </li>
          <li>
            {" "}
            <div className="dateYear">
              <span>2020</span>
            </div>
            <div>
              Branding and Product design<span> at Common Room</span>
            </div>
            <div className="">
              <p>
                I was one of the first designers contracted with their team. It
                was a pre launch product gaining traction with early investors
                and together with the engineering, design, and product leads,
                put together a product outline for what they were pitching to
                our investors.
              </p>
              <p>
                In this work, I had a lot of roles. I co designed the early
                product interface, while owning more of the systems level
                thinking. I led branding and identity workshops with our team,
                which then expanded into design systems, figma organization
                management, documentation, user experience process templates and
                docs, and building our library of assets to help accelerate our
                product design.
              </p>
            </div>
          </li>
          <li>
            <div className="dateYear">
              <span>2020</span>
            </div>
            <div>
              Sustainability Cloud<span> at Salesforce</span>
            </div>
            <div className="">
              <p>
                I worked on the Salesforce Sustainabilitu Cloud which functions
                as a carbon emissions tracker, analytics, and data reporting
                tool for companies focused on improving the emissions of their
                buildings and supply chain. This tool was enterprise focused and
                heavily relied on the ability to intelligently connect high
                quantities of data with related, relevant, and statistically
                interesting datapoints across a companies current organizational
                landscape.
              </p>
              <p>
                The tooling required improvements in their overarching user
                experience, onboarding and setup flows, and data uploading and
                display interfaces. Together with my development team, we
                explored custom components designed and developed within our
                design system guidelines, integrations with Artificial
                intelligence, analytics, and the reporting features of the
                Salesforce system.
              </p>
              <p>
                The work here helped push the product to launch ready, allowing
                Salesforce to open the tooling up for their broader customer
                list
              </p>
            </div>
          </li>
          <li>
            <div className="dateYear">
              <span>2019</span>
            </div>
            <div>
              The New Microsoft Edge Browser<span> at Microsoft</span>
            </div>
            <div className="">
              <p>
                My work with Edge was a mixture of branding, product design, and
                design process refinement. I had been onboarded to a pre launch
                product team that was focused on designing, iterating, and
                innovating experiences with our browser that set us apart from
                any chromium based browser. Microsoft had asked me to come in
                from my work with applying branding to digital products to help
                with features within edge on both the consumer and development
                personas.
              </p>
              <p>
                I had several features I worked on with groupings of other
                designers on the team. Collections, a quick save tool that
                augments searching and saving web content for better
                organization, categorization, decision making, and storing.
              </p>
              <p>
                After we were getting close to launch, I shifted focus to the
                development side of the platform to help improve the usability,
                accessibility, and features for our devtools developer tool. I
                focused on uniquely propositioned features such as intelligent
                font debugging, layers and z-index inspection from a 3d
                perspective, and creating a micro design system in figma for the
                developer tools.
              </p>
              <p>
                This work helped grow out features that differentiate our
                product so when it launched it could garner interest and gain
                momentum for use as Microsoft transitioned to windows 12
              </p>
            </div>{" "}
          </li>
        </ul>
      </section>
    </main>
  );
}
