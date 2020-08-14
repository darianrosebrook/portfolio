import { LitElement, html, css } from 'lit-element';

// Actions

// Styles
import styles from '../styles/index.js';

// Components

// Redux
// class ___ extends connect(store)(LitElement) {
const host = css`
  section {
    padding-left: 2rem;
    border-left: 1px solid var(--divider-color);
  }
  .row {
    padding: 1rem 0 1rem 0;
    border-bottom: 1px solid var(--divider-color);
  }
  h2 {
    font-size: var(--ramp-t7);
  }
  h6 {
    margin: var(--margin) 0;
  }
  small {
    padding: var(--design-unit);
    background: var(--neutral-layer-l2);
    width: fit-content;
  }
  ul {
    font-size: var(--ramp-t5);
  }
`;
class Skills extends LitElement {
  render() {
    return html` <section>
      <article class="row">
        <h2>Skills</h2>
        <div class="skills">
          <article class="">
            <h6><small class="c1-upper">Strategy</small></h6>
            <ul class="emph">
              <li>Crafting Spec Documents</li>
              <li>Design Thinking Workshops</li>
              <li>User Experience Audits</li>
              <li>Design Sprints</li>
              <li>Competitive Research</li>
              <li>Design Systems Thinking</li>
              <li>Component Architecture</li>
            </ul>
          </article>
          <article>
            <h6><small class="c1-upper">UX</small></h6>
            <ul class="emph">
              <li>User Experience Storytelling</li>
              <li>User Flows</li>
              <li>Wireframing</li>
              <li>Rapid Prototyping</li>
              <li>Storyboarding</li>
              <li>Interaction design</li>
            </ul>
          </article>
          <article class="">
            <h6><small class="c1-upper">Brand</small></h6>
            <ul class="emph">
              <li>Logo design systems</li>
              <li>Brand standard guides</li>
              <li>Iconography</li>
              <li>Packaging design</li>
            </ul>
          </article>
          <article class="">
            <h6><small class="c1-upper">Tools</small></h6>
            <ul class="emph">
              <li>Adobe Creative Suite</li>
              <li>Figma</li>
              <li>Sketch App</li>
              <li>InVision</li>
              <li>InVision Studio</li>
            </ul>
          </article>
          <article class="">
            <h6><small class="c1-upper">Code</small></h6>
            <ul class="emph">
              <li>HTML</li>
              <li>CSS</li>
              <li>JavaScript</li>
              <li>Web Components</li>
              <li>React</li>
              <li>Lit-Element</li>
              <li>NodeJS and Express</li>
              <li>Ruby on Rails</li>
            </ul>
          </article>
        </div>
      </article>
    </section>`;
  }

  static get styles() {
    return [styles, host];
  }
}

customElements.define('skills-list', Skills);
