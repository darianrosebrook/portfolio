/**
 * Four-pillar capability frame for the home page. The reviewer's "Where I'm
 * most useful" / "How I create leverage" section — the page-level argument
 * that turns the bio's claims into evaluable criteria.
 */
const LeveragePillars = () => {
  return (
    <>
      <h3>How I create leverage</h3>
      <p>
        I&apos;m usually brought into problems where a design system has
        outgrown static documentation. The library exists, but adoption is
        uneven. The code and Figma surfaces disagree. Teams duplicate work.
        Contribution paths are unclear. Leaders lack visibility into whether the
        system is improving or simply expanding.
      </p>
      <p>
        My role is to make those systems legible and operable. I map the
        workflow, identify the failure points, design the human-facing
        experience, build or shape the tooling, and help the team adopt a
        clearer operating model.
      </p>
      <dl>
        <dt>System diagnosis</dt>
        <dd>
          I find where design, code, process, and ownership are drifting apart.
        </dd>
        <dt>Toolmaking</dt>
        <dd>
          I build custom tools when existing platforms cannot represent the
          organization&apos;s real workflow.
        </dd>
        <dt>Governance and standards</dt>
        <dd>
          I turn implicit expectations into usable conventions, contribution
          paths, and quality bars.
        </dd>
        <dt>Team enablement</dt>
        <dd>
          I help designers, engineers, PMs, and leaders share a more precise
          model of how the system works.
        </dd>
      </dl>
    </>
  );
};

export default LeveragePillars;
