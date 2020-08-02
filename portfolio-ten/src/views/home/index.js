import { LitElement, html } from 'lit-element';

import styles from '../../styles/index.js';

class Home extends LitElement {
  render() {
    return html`
      <section>
        <p>Connected</p>
      </section>
    `;
  }

  static get styles() {
    return [styles];
  }
}

customElements.define('home-page', Home);
