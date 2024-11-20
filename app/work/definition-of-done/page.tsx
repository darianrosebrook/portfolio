import Link from "next/link";
import Image from "next/image";
import Styles from "../../articles/[slug]/styles.module.css";


const Page: React.FC = () => {

    const images = {
        "dod-1": {
            src: "/dod/dod-1.png",
            alt: "Definition of Done thumbnail showcasing a widget in Figma with checkboxes",
            width: 1920,
            height: 960,
        },
        "dod-2": {
            src: "/dod/dod-2.png",
            alt: "Definition of Done thumbnail showcasing a widget in Figma with checkboxes",
            width: 1916,
            height: 800,
        },
        "dod-3": {
            src: "/dod/dod-3.png",
            alt: "Definition of Done thumbnail showcasing a widget in Figma with checkboxes",
            width: 1345,
            height: 800,
        },
        "dod-4": {
            src: "/dod/dod-4.png",
            alt: "Definition of Done thumbnail showcasing a widget in Figma with checkboxes",
            width: 1262,
            height: 622,
        },
        "dod-5": {
            src: "/dod/dod-5.png",
            alt: "Definition of Done thumbnail showcasing a widget in Figma with checkboxes",
            width: 1339,
            height: 814,
        },
        "dod-6": {
            src: "/dod/dod-6.png",
            alt: "Definition of Done thumbnail showcasing a widget in Figma with checkboxes",
            width: 1687,
            height: 800,
        },
        "dod-7": {
            src: "/dod/dod-7.png",
            alt: "Definition of Done thumbnail showcasing a widget in Figma with checkboxes",
            width: 1066,
            height: 800,
        },
    };

    return (
        <section className="content">
            <Link href="/work">Previous</Link>
            <h2>Definition of Done Figma Widget</h2>
            <p>Standardizing handoff between design and development requires a handful of common checks and practices for designers to go through to consider their work “Ready” for another person to review and work on. We brought in experts across each discipline to build on these standards in collaboration with teams like Content, Accessibility, Project Management, and more.</p>
            <div className={Styles.hero}>
                <div>
                    <p><strong>Responsibilities:</strong></p>
                    <p>project coordination, user research, design, development, user testing, delivery and presentation </p>
                </div>
                <div>
                    <p><strong>Designers: </strong>Darian Rosebrook, Catalina Manea</p>
                    <p><strong>Research:</strong> Darian Rosebrook, Catalina Manea</p>
                    <p><strong>Developers: </strong>Darian Rosebrook, Cordelia McGee-Tubb</p>
                    <p><strong>Scope of impact:</strong> Whole Product Organization</p>
                </div>
            </div>
            <article className={Styles.articleContent}>
                <Image src={images["dod-1"].src} alt={images["dod-1"].alt} width={images["dod-1"].width} height={images["dod-1"].height} />
                <p>
                    Our goal with this tool was to help designers get from Zero-To-One as quick as we can through onboarding when we have new hires on the team.
                </p>
                <p>
                    Previously I’ve worked on a design system checklist for design systems. This list was expansive, and geared towards a high level of detail outlining what our developers expect of our design system designers. Though this list is massive, it’s not an “End of process” checklist. If you were to check things off after you’ve completed the work, the list would feel like too much.
                </p>
                <Image src={images["dod-2"].src} alt={images["dod-2"].alt} width={images["dod-2"].width} height={images["dod-2"].height} />
                <p>
                    This led us to coming up with a better solution for managing this list, and splitting it up into two goals:
                </p>
                <ul>
                    <li>Create a design checklist for what we expect of our Senior Product designers that can sit as a companion tool</li>
                    <li>A reference list for our design system team (including external contributors) to implement during their work on highly technical design system components</li>
                </ul>
                <h3>High Level Steps</h3>
                <ul>
                    <li>Validate Definition of Done standards with teams involved</li>
                    <li>Gather and provide documented examples of best practices</li>
                    <li>Define the workflow for design checks and balances</li>
                    <li>Evangelism for design standards</li>
                </ul>
                <h3>Product Design Interview Process</h3>
                <Image src={images["dod-3"].src} alt={images["dod-3"].alt} width={images["dod-3"].width} height={images["dod-3"].height} />
                <p>
                    During the first few weeks, we set out to understand more about what our product partners experience when working with the designers in our organization.
                </p>
                <p>
                    We interviewed nearly 60 people across Engineering, Product Management, and our Design Leads. This gave us a current landscape of the current expectations and pain points they run into when they collaborate with the design partners on their team.
                </p>
                <p>
                    We ran workshops with small groups of people, batching together some potential solutions to general design pitfalls at the company.
                </p>
                <p>
                    We also ran workshops with other product partners like Accessibility, UX Research, Internationalization, Content Designers, and the Design System team.
                </p>
                <p>
                    We gathered everyone’s requirements and expectations when working with senior-level designers and refined our approach to our designer’s definition of done.
                </p>
                <h3>Piloting with Design Teams</h3>
                <Image src={images["dod-4"].src} alt={images["dod-4"].alt} width={images["dod-4"].width} height={images["dod-4"].height} />
                <p>
                    Our first pilot was to have designers go through a document that outlined each requirement. This was the lowest, most viable way we could get our checks and balances for designers out the door.
                </p>
                <p>
                    This bought enough time for me and another developer to build out a custom tool for Figma that worked like a plugin. This widget would sit on the main canvas as a companion tool allowing people to check off things that applied to their work as they worked on the file.
                </p>
                <Image src={images["dod-5"].src} alt={images["dod-5"].alt} width={images["dod-5"].width} height={images["dod-5"].height} />
                <p>
                    As we gathered feedback from our team, we made really rapid design changes to directly address feedback.
                </p>
                <Image src={images["dod-6"].src} alt={images["dod-6"].alt} width={images["dod-6"].width} height={images["dod-6"].height} />
                <p>
                    These changes made the design a lot less overwhelming and hooked our Figma widget up to more integrations like analytics and our google feedback forms
                </p>
                <h3>Testing and Refinement</h3>
                <Image src={images["dod-7"].src} alt={images["dod-7"].alt} width={images["dod-7"].width} height={images["dod-7"].height} />
                <p>
                    We were able to take direct feedback from the org which allowed leads to work with us on the progress and time savings it was generating for their teams. This feedback led to micro adjustments to things like content and interactive control.
                </p>
                <h3>Final Product</h3>
                <p>
                    The final product works like a charm, allowing progress to move along at the same pace the designer works through their product problem.
                </p>
                <p>
                    Teams have reported fewer bugs as a result of edge cases being covered by design and communication processes being improved.
                </p>
                <h4>Main Features</h4>
                <ul>
                    <li>Progress tracking percentages that update from edited lists or checked off items</li>
                    <li>Separated lists of expectations per check-in point. These teams curated their lists to be as succinct but effective as possible.</li>
                    <li>Feedback form</li>
                    <li>Collapsible side bar</li>
                    <li>An automatic light/dark mode</li>
                    <li>Summary of completed work once at 100%</li>
                </ul>
                <p>
                    You can check out the interactive widget below:
                </p>
                <video
                    src="https://www.notion.so/signed/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F993bf54c-76d8-4a31-8618-b1d61384a010%2F79348832-0fad-45f9-bdd6-ed1a99f0a63c%2FScreen_Recording_2023-11-07_at_5.32.38_PM.mov?table=block&id=c2096a93-82fd-4319-b9fd-def5dbc00985&spaceId=993bf54c-76d8-4a31-8618-b1d61384a010&name=Screen%20Recording%202023-11-07%20at%205.32.38%20PM.mov&userId=308f76da-a8f2-489d-8ce8-efe9677e5615&cache=v2"
                    controls
                ></video>
            </article>
        </section>
    );
};

export default Page;
