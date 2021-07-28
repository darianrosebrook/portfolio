import { LitElement, html, css } from "lit";
import "../shared/layout";
import "../../admin/productform";

class AddProduct extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
    };
  }
  constructor() {
    super();
    this.heading = "Products";
    this.description = "Add a new product";
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
        <product-form></product-form>
      </shared-layout>
    `;
  }
}

customElements.define("add-product", AddProduct);
