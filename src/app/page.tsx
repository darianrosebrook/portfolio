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
      <section data-print="true" className="projects">
        <h2>Highlighted Projects</h2>
        <p>
          These are just the favorites of some recent work. Full case studies
          available on request.
        </p>
        <ul className="experience">
          <li>
            <h3 className="dateYear">
              <span>2023</span>
            </h3>
            <h3>
              Iconography Sync <span> at eBay</span>
            </h3>
            <div className="content">
              <p>
                I&apos;ve created a figma plugin for design system teams that
                allows design and development to be closer in sync, allowing for
                a fairly optimized and automated process for syncing our design
                assets to our code assets through GitHub. Designers have control
                over which of their designed assets gets output from the
                tooling, developers have control over what gets checked into the
                codebase, site, and packages.
              </p>
              <p>
                Utilizing bidirectional sync with GitHub based on versioning,
                design and development now have a dual turn key moment for
                releasing new changes in things like iconography, design tokens,
                and illustrations. Designers have the ability to see the status
                of their work, and developers have visibility into what changes
                are made instead of reaching blindly into the google folder to
                grab all icons and hope that nothing breaks again
              </p>
              <p>
                By bridging the gap between design and code here, our design
                system team can now create, publish, and release new iconography
                from Figma to the team&lsquo;s codebase the same day. Much better than
                the 6-8 week turnaround due to meetings, backlogging tickets,
                and working around release schedules.
              </p>
              <p>
                From the push of a button, and the approving pull request of a
                developer, our Figma library, our Web, Android, and iOS
                libraries, and our documentation site are all updated at the
                same time.
              </p>
            </div>
          </li>
          <li>
            <h3 className="dateYear">
              <span>2023</span>
            </h3>
            <h3>
              Designer&lsquo;s Definition of Done<span> at eBay</span>
            </h3>
            <div className="content">
              <p>
                Me and my coworker Catalina Manea interviewed over 40 designers,
                30 developers,and 11 project managers to understand the current
                landscape of design handoff and design/developer collaboration.
                We worked with them to identify strong key points along our
                product process that were critically broken, requiring some form
                of intervention and reeducation to fix.
              </p>
              <p>
                Together, we set out to bring these pain points directly to the
                teams they partner with, like accessibility, content designers,
                development leads, the design system team. We worked with these
                teams to develop a list of key things they require when
                interfacing with them cross collaboratively.
              </p>
              <p>
                Using this list, I and one other developer used this list to
                create a custom &ldquo;<strong>Definitiion of Done</strong>
                &rdquo; interactive Figma widget to be used as a companion that
                helps designers build good habits and file hygeine before
                interfacing with their partners during the product design
                lifecycle.
              </p>
              <p>
                This tool helps build a standard of things we expect from our
                senior level designers, and helps teams build consistent habits
                across the organization.
              </p>
              <p>
                Teams involved in our pilots have had a large reduction in bugs,
                and more efficient design handoff as opposed to teams outside
                the pilot
              </p>
            </div>
          </li>
          <li>
            <h3 className="dateYear">
              <span>2022</span>
            </h3>
            <h3>
              Figma library sync<span> at Nike</span>
            </h3>
            <div className="content">
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
            <h3 className="dateYear">
              <span>2022</span>
            </h3>
            <h3>
              Podium Foundations Library<span> at Nike</span>
            </h3>
            <div className="content">
              <p>
                In late 2021, the Consumer, Marketing, and Enterprise leaders
                got together to figure out how to work towards an even tighter
                collaboration on design across our orgs. The result led to me
                and my lead developer on the enterprise design system to co-lead
                the effort with leads from each org to design a foundational
                library that feeds all three org-focused design systems.
              </p>
              <p>
                To pull redundancy of designing the design tokens, base
                components, and overall codebases, I helped architect and build
                several internal tools that take the existing properties of
                Figma libraries, branching, GitHub, and the Figma plugin system
                and created custom tooling that outputs and links our
                foundational figma library to GitHub for our developers, and
                links the foundational library to other figma libraries.
              </p>
              <p>
                This connection allows us to change underlying tokens in a turn
                key moment between design and development to ensure the updates
                to code and design can happen simultaneously with the correct
                values and little lag time.
              </p>
              <p>
                Through this, I helped facilitate intense design system
                workshops, build incredible tooling, and solve a long standing
                problem in large corporate design systems
              </p>
            </div>
          </li>
          <li>
            <h3 className="dateYear">
              <span>2021</span>
            </h3>
            <h3 className="ProfileItem_title__rsz3J">
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
            </h3>
            <div className="content">
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
            <h3 className="dateYear">
              <span>2020</span>
            </h3>
            <h3>
              Branding and Product design<span> at Common Room</span>
            </h3>
            <div className="content">
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
            <h3 className="dateYear">
              <span>2020</span>
            </h3>
            <h3>
              Sustainability Cloud<span> at Salesforce</span>
            </h3>
            <div className="content">
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
            <h3 className="dateYear">
              <span>2019</span>
            </h3>
            <h3>
              The New Microsoft Edge Browser<span> at Microsoft</span>
            </h3>
            <div className="content">
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
