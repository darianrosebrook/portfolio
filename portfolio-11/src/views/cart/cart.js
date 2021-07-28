import { LitElement, html, css } from "lit";

import "../shared/layout";
import "./edit-cart";

class Cart extends LitElement {
  render() {
    return html`
      <shared-layout heading=${this.heading} description=${this.description}>
        <edit-cart></edit-cart>
      </shared-layout>
    `;
  }
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
    };
  }
  constructor() {
    super();
    this.heading = "Cart";
    this.description = "Complete your checkout";
  }
}

customElements.define("cart-page", Cart);
