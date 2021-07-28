import { LitElement, html, css } from "lit";
import "../shared/layout";
import "../../modules/nav";
import "../../modules/productslist";

class Products extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
    };
  }
  constructor() {
    super();
    this.heading = "Products";
    this.description = "Products for creatives by creatives";
  }
  static get styles() {
    return css`
      div {
        width: 100%;
      }
    `;
  }
  render() {
    return html`
      <shared-layout heading=${this.heading} description=${this.description}>
        <product-list></product-list>
      </shared-layout>
    `;
  }
}

customElements.define("products-page", Products);
