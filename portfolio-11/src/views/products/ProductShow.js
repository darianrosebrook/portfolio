import { LitElement, html, css } from "lit";
import "../shared/layout";
import "../../modules/productslist";
import { read } from "../../api/apicore";

class ProductShow extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
      product: { type: Object },
      error: { type: Boolean },
    };
  }
  constructor() {
    super();
    this.heading = "Product title";
    this.description = "Product description";
    this.error = false;
  }

  connectedCallback() {
    super.connectedCallback();
    function getPathFromUrl(string) {
      return string.split(/[?#]/)[0];
    }
    let url = window.location.href;
    url = getPathFromUrl(url).replace(/\/$/, "");
    const productSlug = url.substr(url.lastIndexOf("/") + 1);

    read("product", productSlug)
      .then((data) => {
        this.product = data;
      })
      .catch((err) => {
        this.error = err;
      });
  }
  static get styles() {
    return css`
      div {
        width: 100%;
      }
    `;
  }
  render() {
    this.heading = this.product.title;
    this.description = this.product.description;
    return html`
      <shared-layout heading=${this.heading} description=${this.description}>
        <p><img laoding="lazy" src="${this.product.photo}" /></p>
        <p>${this.product.body}</p>
      </shared-layout>
    `;
  }
}

customElements.define("product-show", ProductShow);
