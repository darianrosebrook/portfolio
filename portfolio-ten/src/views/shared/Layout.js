import { LitElement, html } from 'lit-element';

import styles from '../../styles/index.js';
import '../../modules/Nav.js';
import '../../modules/Footer.js';
import '../../components/Alert.js';

class SharedLayout extends LitElement {
  render() {
    return html`${this.stylesheet
        ? html`<style>
            ${this.stylesheet}
          </style>`
        : null} <nav-bar></nav-bar><slot></slot
      ><footer-content></footer-content>`;
  }

  static get properties() {
    return {
      stylesheet: {
        type: Object,
      },
    };
  }

  static get styles() {
    return [styles];
  }
}

customElements.define('shared-layout', SharedLayout);
