import Link from "next/link";

export default function Page() {
  return (
    <>
      <section >
        <div className="content">

          <h2>Highlighted Projects</h2>
          <p>
            These are just the favorites of some recent work. Full case studies
            available on request.
          </p>
          <Link href="/work/design-process">Design Process</Link>
        </div>
      </section>
      <section data-print="true" className="projects content">
        <ul className="experience"><li>
          <h3 className="dateYear">
            <span>2025</span>
          </h3>
          <h4>
            Design Ecosystem Mapping <span> at Verizon</span>
          </h4>
          <div className="content">
            <div >
              <div>
                <h5>Role</h5>
                <p><strong>Team Lead, UX Engineer</strong></p>
              </div>
            </div>
            <h5>Outcomes</h5>
            <div className="three-up">
              <p>Detailed Key Performance Indicator (KPIs) Metrics for the Design System across the Product Organization</p>
              <p>Custom Data Visualization for Design System Analytics and Adoption across Design and Code</p>
              <p>Data Management portals for creating, updating, and deleting records</p>
            </div>
            <p>
              As the lead UX Engineer on my team, I worked with my team to build a robust tool for data insights, tracking specific Key Performance Indicators across our Design and Engineering orgs through Figma, Gitlab, and other integrations. With my expertise in the Figma and Design System space, I helped implement an API layer to empower other tools our larger team built with the data necessisary to help improve the workflows of our team.
            </p>
            <p>Once the data layer was set up, I created a custom website using React that serves as an admin level portal to manage this data. This custom analytics tool also serves as a central hub for our product design organization&apos;s data. The tool enables rich insights into the relationships between products, team resourcing, design system adoption, and other metrics important to our design leaders.
            </p>
            <p>
              As a result, our team has been able to make more informed decisions about the design system, and the design system has been able to make more informed decisions about the products it serves. This has led to a more cohesive design ecosystem, and a more efficient design process.
            </p>
          </div>
        </li>
          <li>
            <h3 className="dateYear">
              <span>2024</span>
            </h3>
            <h4>
              <Link href={"/work/iconography-sync"}>
                Iconography Sync <span> at eBay</span>
              </Link>
            </h4>
            <div className="content">
              <div >
                <div>
                  <h5>Role</h5>
                  <p><strong>Lead Designer, Developer</strong></p>
                </div>
              </div>
              <h5>Outcomes</h5>
              <div className="three-up">
                <p>95% Time Reductionfrom finished design to code implementation</p>
                <p>100% reduction in naming, mismatching, and availability errors across codebases</p>
                <p>Proof of viability for more asset automation pipelines in our design system</p>
              </div>
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
                from Figma to the team&lsquo;s codebase the same day. Much
                better than the 6-8 week turnaround due to meetings, backlogging
                tickets, and working around release schedules.
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
            <h4>
              <Link href={"/work/definition-of-done"}>
                Designer&lsquo;s Definition of Done<span> at eBay</span>
              </Link>
            </h4>
            <div className="content">
              <div >
                <div>
                  <h5>Role</h5>
                  <p><strong>Co-Designer, Co-Developer</strong></p>
                </div>
              </div>
              <h5>Outcomes</h5>
              <div className="three-up">
                <p>Standardized the process for preparing design work, creating more efficient collaboration between design and development teams.</p>
                <p>A large reduction in bug reports from edge cases being covered during design and improved communication processes.</p>
                <p>Standardized onboarding with new designers getting from &ldquo;Zero-To-One&rdquo; quickly ensuring consistency by adhering to org standards</p>
              </div>
              <p>
                Me and my coworker
                <Link href={"https://www.catalinamanea.com/"} target="_blank"> Catalina Manea </Link>
                interviewed over 40 designers, 30 developers,and 11 project
                managers to understand the current landscape of design handoff
                and design/developer collaboration. We worked with them to
                identify strong key points along our product process that were
                critically broken, requiring some form of intervention and
                reeducation to fix.
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
            <h4>
              Figma library sync<span> at Nike</span>
            </h4>
            <div className="content">
              <div >
                <div>
                  <h5>Role</h5>
                  <p><strong>Lead Designer, Developer</strong></p>
                </div>
              </div>
              <h5>Outcomes</h5>
              <div className="three-up">
                <p>A solid pre-variables workflow for connecting underlying design tokens across multiple libraries.</p>
                <p>Enabled control over the scope and amount of design tokens imported, creating flexibility while still adhering to standards.</p>
                <p>Synchronized updates across multiple libraries, reducing manual management of individual design tokens.</p>
              </div>
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
            <h4>
              Podium Foundations Library<span> at Nike</span>
            </h4>
            <div className="content">
              <div >
                <div>
                  <h5>Role</h5>
                  <p><strong>Workshop Co-lead, Strategist, Co-developer</strong></p>
                </div>
              </div>
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
            <h4>
              <div>
                <a
                  href="http://Nike.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-hover="true"
                >
                  Podium Enterprise Design System<span> at Nike </span>
                </a>
              </div>
            </h4>
            <div className="content">
              <div >
                <div>
                  <h5>Role</h5>
                  <p><strong>Lead Designer </strong></p>
                </div>
              </div>
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

            <h3 className="dateYear">
              <span>2020</span>
            </h3>
            <h4>
              Branding and Product design<span> at Common Room</span>
            </h4>
            <div className="content">
              <div >
                <div>
                  <h5>Role</h5>
                  <p><strong>Lead Designer </strong></p>
                </div>
              </div>
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
            <h4>
              Sustainability Cloud<span> at Salesforce</span>
            </h4>
            <div className="content">
              <div >
                <div>
                  <h5>Role</h5>
                  <p><strong>UX Designer, UX Researcher </strong></p>
                </div>
              </div>
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
            <h4>
              The New Microsoft Edge Browser<span> at Microsoft</span>
            </h4>
            <div className="content">
              <div >
                <div>
                  <h5>Role</h5>
                  <p><strong>UX Designer, UX Researcher </strong></p>
                </div>
              </div>
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
            </div>
          </li>
        </ul>
      </section >
    </>
  );
}
