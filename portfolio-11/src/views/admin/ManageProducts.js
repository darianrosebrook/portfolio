import { LitElement, html, css } from "lit-element";
import "../shared/layout";
import { isAuthenticated } from "../../auth";
import { productService } from "../../redux/services";
import moment from "moment/src/moment";
import styles from "../../styles";
import "./orders";

import { store } from "../../redux/store.js";
import { connect } from "pwa-helpers";

class ManageProducts extends connect(store)(LitElement) {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
      products: { type: Array },
    };
  }
  constructor() {
    super();
    this.heading = "Manage products";
    this.description = "let's get started.";
  }
  connectedCallback() {
    super.connectedCallback();

    this.loadProducts();
  }
  stateChanged(state) {
    this.user = state.authentication.account.user;
    this.token = state.authentication.account.token;
  }
  loadProducts = () => {
    productService.getProducts().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        this.products = data;
      }
    });
  };
  destroy = (productId) => {
    productService
      .deleteProduct(productId, this.user.publicDetails.userName, this.token)
      .then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          this.loadProducts();
        }
      });
  };
  static get styles() {
    return [
      styles,
      css`
        div {
          width: 100%;
        }
      `,
    ];
  }
  render() {
    return html`
      <shared-layout heading=${this.heading} description=${this.description}>
        <div>
          <h2>Use this to edit products</h2>
          <ul>
            ${this.products
              ? this.products.map((item) => {
                  return html`
                  <li>
                  <h5>${item.title}<h5>
                  <p>
                  <a href="/edit/product/${item.slug}">Update</a>
                   <button @click=${() =>
                     this.destroy(
                       item.slug
                     )} style="color: var(--cr-red-60)">Delete</button>
                  </p>
                  </li>`;
                })
              : ``}
          </ul>
        </div>
      </shared-layout>
    `;
  }
}

customElements.define("manage-products", ManageProducts);
