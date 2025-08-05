import Link from 'next/link';
import Image from 'next/image';
import Styles from '../../articles/[slug]/styles.module.css';

const Page: React.FC = () => {
  const images = {
    'icon-tool.jpg': {
      alt: 'Icon Sync',
      src: '/icon-tool/icon-tool.jpg',
      width: 800,
      height: 400,
    },
    'icon-tool-01.png': {
      alt: 'Icon Sync',
      src: '/icon-tool/icon-tool-01.png',
      width: 800,
      height: 400,
    },
    'icon-tool-02.png': {
      alt: 'Icon Sync',
      src: '/icon-tool/icon-tool-02.png',
      width: 800,
      height: 400,
    },
    'icon-tool-03.png': {
      alt: 'Icon Sync',
      src: '/icon-tool/icon-tool-03.png',
      width: 800,
      height: 400,
    },
    'icon-tool-04.png': {
      alt: 'Icon Sync',
      src: '/icon-tool/icon-tool-04.png',
      width: 800,
      height: 400,
    },
    'icon-tool-05.png': {
      alt: 'Icon Sync',
      src: '/icon-tool/icon-tool-05.png',
      width: 800,
      height: 400,
    },
    'icon-tool-06.png': {
      alt: 'Icon Sync',
      src: '/icon-tool/icon-tool-06.png',
      width: 800,
      height: 400,
    },
    'icon-tool-07.png': {
      alt: 'Icon Sync',
      src: '/icon-tool/icon-tool-07.png',
      width: 800,
      height: 400,
    },
    'icon-tool-08.png': {
      alt: 'Icon Sync',
      src: '/icon-tool/icon-tool-08.png',
      width: 800,
      height: 400,
    },
  };
  return (
    <section className="content">
      <Link href="/work">Previous</Link>
      <h2>Iconography Sync</h2>
      <div className={Styles.hero}>
        <div>
          <p>
            I&rsquo;ve created a figma plugin for design system teams that
            allows design and development to be closer in sync, allowing for a
            fairly optimized and automated process for syncing our design assets
            to our code assets through GitHub. Designers have control over which
            of their designed assets gets output from the tooling, developers
            have control over what gets checked into the codebase, site, and
            packages.
          </p>
        </div>
        <div>
          <p>
            <strong>Responsibilities:</strong>
          </p>
          <p>
            project coordination, user research, design, development, user
            testing, delivery and presentation{' '}
          </p>
          <p>
            <strong>Designers: </strong>Darian Rosebrook{' '}
          </p>
          <p>
            <strong>Research:</strong> Darian Rosebrook{' '}
          </p>
          <p>
            <strong>Developers: </strong>Darian Rosebrook, Caleb Nance
          </p>
          <p>
            <strong>Scope of impact:</strong> Design System Maintainers
          </p>
        </div>
      </div>
      <article className={Styles.articleContent}>
        <Image
          src="/icon-tool/icon-tool.jpg"
          alt="Icon Sync"
          width={800}
          height={400}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 800px"
        />
        <p>
          Utilizing bidirectional sync with GitHub based on versioning, design
          and development now have a dual turn key moment for releasing new
          changes in things like iconography, design tokens, and illustrations.
          Designers have the ability to see the status of their work, and
          developers have visibility into what changes are made instead of
          reaching blindly into the google folder to grab all icons and hope
          that nothing breaks again
        </p>
        <p>
          By bridging the gap between design and code here, our design system
          team can now create, publish, and release new iconography from Figma
          to the team&apos;s codebase the same day. Much better than the 6-8
          week turnaround due to meetings, backlogging tickets, and working
          around release schedules.
        </p>
        <p>
          From the push of a button, and the approving pull request of a
          developer, our Figma library, our Web, Android, and iOS libraries, and
          our documentation site are all updated at the same time.
        </p>
        <h3>Main Goals</h3>
        <Image
          src={images['icon-tool-01.png'].src}
          alt={images['icon-tool-01.png'].alt}
          width={images['icon-tool-01.png'].width}
          height={images['icon-tool-01.png'].height}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 600px"
        />
        <aside>
          <Image
            src={images['icon-tool-02.png'].src}
            alt={images['icon-tool-02.png'].alt}
            width={images['icon-tool-02.png'].width}
            height={images['icon-tool-02.png'].height}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
          />
          <div>
            <h3>Addressing the issue</h3>
            <h4>
              <>Visual discrepancies</>
            </h4>
            <p>
              Because of our manual process for updating icons, iconography was
              often different across platforms due to legacy icons not being
              removed, being incorrectly imported, or altogether
            </p>
            <h4>
              <>Naming differences</>
            </h4>
            <p>
              Icons were notoriously named different things across different
              platforms, leading to references to the wrong icons, or icons
              under the wrong reference
            </p>
            <h4>
              <>Legacy versions</>
            </h4>
            <p>
              If iconography was transferred by hand, finding old versions, or
              managing updates could easily be overlooked when making changes to
              the platform libraries
            </p>
          </div>
        </aside>
        <aside>
          <div>
            <h4>Addressing the workflow</h4>
            <p>
              I met with each of the platform teams and design system team to
              understand the process of going from Figma to code.
            </p>
            <h4>Redundant processes</h4>
            <p>
              These icons were being optimized individually before being added
              to the folder, only to be re-optimized and added into each project
              by the consuming platform teams
            </p>
          </div>
          <Image
            src={images['icon-tool-03.png'].src}
            alt={images['icon-tool-03.png'].alt}
            width={images['icon-tool-03.png'].width}
            height={images['icon-tool-03.png'].height}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
          />
        </aside>
        <Image
          src={images['icon-tool-04.png'].src}
          alt={images['icon-tool-04.png'].alt}
          width={images['icon-tool-04.png'].width}
          height={images['icon-tool-04.png'].height}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 600px"
        />

        <h3>Simplifying our process by removing redundancy</h3>
        <p>
          By taking stock of all the steps along the way of having design to
          platform code, we found the crucial points where these designs still
          require someone to initiate or approve the process
        </p>
        <p>
          Me and one of my team members interviewed all leads of each platform
          (Web, Android, and iOS) to get the exact optimizations and
          implementation details they use when getting these icons into the
          project.
        </p>
        <p>
          This showed that each project was doing nearly the exact same things:
        </p>
        <ul>
          <li>
            Creating tickets (3rd ticket for the same icon after design has
            started)
          </li>
          <li>
            Optimization and Code translation: Taking the output svg and
            converting it or optimizing it after it had already been converted
            and optimized by design
          </li>
          <li>
            Awaiting approval from an engineer to implement an icon change. 3rd
            change of hands during this process.
          </li>
          <li>
            Icons also were not being checked for existing icons or name clashes
            before adding
          </li>
        </ul>

        <h3>Transitioning to automation</h3>
        <aside>
          <Image
            src={images['icon-tool-05.png'].src}
            alt={images['icon-tool-05.png'].alt}
            width={images['icon-tool-05.png'].width}
            height={images['icon-tool-05.png'].height}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 600px"
          />
          <div>
            <h4>
              <>Automating the flow</>
            </h4>
            <p>
              Once the key moments were defined, we were able to take the
              laborious time-heavy moments of exporting, optimizing, and
              importing iconography and hand that off to a custom tool built to
              handle eBay&apos;s current needs
            </p>
            <h4>
              <>Introducing versioning</>
            </h4>
            <p>
              By intelligently connecting Figma to GitHub we&apos;re in a much
              better space to understand and track the changes across icons
              while still being native to the user&apos;s experience
            </p>
          </div>
        </aside>
        <aside>
          <Image
            src={images['icon-tool-06.png'].src}
            alt={images['icon-tool-06.png'].alt}
            width={images['icon-tool-06.png'].width}
            height={images['icon-tool-06.png'].height}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 600px"
          />
          <div>
            <p>
              Working together with Design Technology I had been given the green
              light for the development direction and for the design direction
              by our Icon designer.
            </p>
          </div>
        </aside>

        <h3>Results</h3>
        <aside>
          <div>
            <p>
              I would further work with our designer on more specific details
              like how to address optimization details across iconography
            </p>
            <p>
              These optimization steps could be brought into the same process
              behind the scenes of the designer&apos;s output, meaning the
              designer just had to verify the design still looked correct and
              then forward on the icon.
            </p>
          </div>
          <Image
            src={images['icon-tool-07.png'].src}
            alt={images['icon-tool-07.png'].alt}
            width={images['icon-tool-07.png'].width}
            height={images['icon-tool-07.png'].height}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 600px"
          />
        </aside>

        <p>
          The overall process when finally hooked up would enable our icon
          design process to reduce almost 30 steps across the whole process down
          to 6
        </p>
        <h6>4 for design:</h6>
        <ul>
          <li>Create the Figma component holding the icon</li>
          <li>Update the Figma documentation</li>
          <li>Select the icon in the plugin</li>
          <li>Publish changes</li>
        </ul>
        <h6>2 for developers:</h6>
        <ul>
          <li>
            Accept the created pull request from the plugin for the library
          </li>
          <li>Pull the changes down to their local machine</li>
        </ul>
        <h5>
          <>
            The changes used to take a whole quarter to become fully available
            to developers. Now, it takes as much time as this 1 minute video
            here
          </>
        </h5>
        <video
          src="https://somagnetic.notion.site/signed/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F993bf54c-76d8-4a31-8618-b1d61384a010%2F610a59cb-3678-4205-ba5d-72c256e6c573%2FIcon_Sync.mov?table=block&id=3e3e6ba6-2e8e-46d8-90a2-4d03b21b80e6&spaceId=993bf54c-76d8-4a31-8618-b1d61384a010&name=Icon%20Sync.mov&cache=v2"
          controls
        ></video>
      </article>
    </section>
  );
};

export default Page;
