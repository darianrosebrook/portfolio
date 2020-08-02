import { LitElement, html } from 'lit-element';

import '../views/home/index.js';

class Routes extends LitElement {
  render() {
    return html`
      <section>
        <lit-route path="/" component="home-page"></lit-route>
      </section>
    `;
  }
}

customElements.define('router-routes', Routes);
