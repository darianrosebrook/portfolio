import { LitElement, html, css } from "lit-element";


class Routes extends LitElement {
  render() {
    return html`
      <div>
        <lit-route><h1>404 Not found</h1></lit-route>
      </div>
    `;
  }
}

customElements.define("router-routes", Routes);
