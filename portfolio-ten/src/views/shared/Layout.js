import { LitElement, html } from 'lit-element';

// Components
import '../../modules/Nav.js';
import '../../modules/Footer.js';
// Redux
// Actions

class SharedLayout extends LitElement {
  render() {
    return html` <nav-bar></nav-bar><slot></slot
      ><footer-content></footer-content>`;
  }
}

customElements.define('shared-layout', SharedLayout);
