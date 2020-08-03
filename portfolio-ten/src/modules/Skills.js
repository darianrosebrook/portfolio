import { LitElement, html } from 'lit-element';

// Actions

// Styles
import styles from '../styles/index.js';

// Components

// Redux
// class ___ extends connect(store)(LitElement) {

class Skills extends LitElement {
  render() {
    return html` <section class=" skills" style="">
      <article class="row">
        <h2>Skills</h2>
        <div class="">
          <article class="">
            <h6>Strategy</h6>
            <ul class="title-list">
              <li>Crafting Spec Documents</li>
              <li>Design Thinking Workshops</li>
              <li>User Experience Audits</li>
              <li>Design Sprints</li>
              <li>Competitive Research</li>
              <li>Design Systems Thinking</li>
              <li>Component Architecture</li>
            </ul>
          </article>
          <article class="grid-item">
            <h6>UX</h6>
            <ul class="title-list">
              <li>User Experience Storytelling</li>
              <li>User Flows</li>
              <li>Wireframing</li>
              <li>Rapid Prototyping</li>
              <li>Storyboarding</li>
              <li>Interaction design</li>
            </ul>
          </article>
          <article class="">
            <h6>Brand</h6>
            <ul class="title-list">
              <li>Logo design systems</li>
              <li>Brand standard guides</li>
              <li>Iconography</li>
              <li>Packaging design</li>
            </ul>
          </article>
          <article class="">
            <h6>Tools</h6>
            <ul class="title-list">
              <li>Adobe Creative Suite</li>
              <li>Figma</li>
              <li>Sketch App</li>
              <li>InVision</li>
              <li>InVision Studio</li>
            </ul>
          </article>
          <article class="">
            <h6>Code</h6>
            <ul class="title-list">
              <li>HTML</li>
              <li>CSS</li>
              <li>JavaScript</li>
              <li>Web Components</li>
              <li>React</li>
              <li>Polymer</li>
              <li>Ruby on Rails</li>
            </ul>
          </article>
        </div>
      </article>
    </section>`;
  }

  static get styles() {
    return styles;
  }
}

customElements.define('skills-list', Skills);
