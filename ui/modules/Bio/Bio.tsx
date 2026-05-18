/**
 * Shared bio copy used by the home and about pages. Wrapping this in a
 * component keeps the positioning thesis in a single place — when the
 * framing shifts, both pages move together.
 */
const Bio = () => {
  return (
    <>
      <p>
        I&apos;m a Staff Design Technologist working across design systems, UX
        engineering, workflow automation, and AI-enabled product practice. My
        work focuses on the parts of design systems that usually remain
        implicit: how components are named, versioned, adopted, measured,
        documented, synchronized with code, and understood by the teams that
        depend on them.
      </p>
      <p>
        I build tools and operating models that reduce the distance between
        design decisions and production reality. That has included Figma
        plugins, GitHub-connected asset pipelines, design system analytics,
        token synchronization workflows, contribution models, onboarding
        systems, and standards that help designers and engineers collaborate
        without relying on tribal knowledge.
      </p>
      <p>
        I&apos;m most useful in environments where the system is large enough
        that taste alone no longer scales. I help teams turn ambiguity into
        structure: clear artifacts, measurable workflows, shared language, and
        tooling that lets the organization see where the system is healthy,
        where it is drifting, and what needs to change.
      </p>
    </>
  );
};

export default Bio;
