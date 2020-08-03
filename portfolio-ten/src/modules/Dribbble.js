import { LitElement, html } from 'lit-element';

// Actions

// Styles
import styles from '../styles/index.js';

// Components

// Redux
// class ___ extends connect(store)(LitElement) {

class Dribbble extends LitElement {
  render() {
    return html`<section class="design-work" id="work">
      <article class="row">
        <h2>Work</h2>
        <div class="grid" id="shots">
          TODO: // move scripts for this out of scripts and into component
        </div>
      </article>
    </section> `;
  }

  static get styles() {
    return styles;
  }
}

customElements.define('dribbble-shots', Dribbble);
