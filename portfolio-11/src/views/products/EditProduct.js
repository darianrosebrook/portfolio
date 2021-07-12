import { LitElement, html, css } from "lit-element";
import "../shared/layout";
import "./editproductform";

class EditProduct extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
    };
  }
  constructor() {
    super();
    this.heading = "Products";
    this.description = "Edit a new product";
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
        <edit-product-form></edit-product-form>
      </shared-layout>
    `;
  }
}

customElements.define("edit-product", EditProduct);
