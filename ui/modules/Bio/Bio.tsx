/**
 * Shared bio copy used by the home and about pages. Wrapping this in a
 * component keeps the positioning thesis in a single place — when the
 * framing shifts, both pages move together.
 */
const Bio = () => {
  return (
    <>
      <p>
        AI-ready design systems need more than components — they need explicit
        structure. I&apos;m a Staff Design Technologist working across design
        systems, UX engineering, workflow automation, and equipping my design
        org with AI-enabled product best practices. My work focuses on the parts
        of design systems that usually remain implicit: how components are
        named, versioned, adopted, measured, documented, synchronized with code,
        and understood by the teams that depend on them.
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
        That work has lived inside teams at Qualtrics, Venmo, Verizon, eBay,
        Nike, Salesforce, and Microsoft — usually focused on asset
        synchronization, multi-brand theming, system adoption, handoff quality,
        design system analytics, or design-to-code collaboration. Concretely:
        same-day icon releases at eBay (down from six-to-eight weeks), token
        sync and global library upgrades at Nike, a design system analytics
        platform connecting Figma + GitLab at Verizon, and AI-enabled design
        tooling and evaluation frameworks at Qualtrics.
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
