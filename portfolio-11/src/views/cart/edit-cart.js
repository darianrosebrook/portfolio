import { LitElement, html, css } from "lit";

import { store } from "../../redux/store.js";
import { connect } from "pwa-helpers";

import "../../components/cartitem";
import "./checkout";

import { cartActions } from "../../redux/actions";

class EditCart extends connect(store)(LitElement) {
  render() {
    return html`
      <style>
        .grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: var(--margin);
        }
        cart-item {
          grid-column: span 1;
        }
      </style>

      <h2>
        You have ${this.cart ? Object.keys(this.cart).length : 0} items in your
        cart
      </h2>

      ${this.cart && Object.keys(this.cart).length > 0
        ? html` <div class="grid">${this.showItems(this.items)}</div>

                <checkout-module
                  .total=${this.total}
                  .items=${this.items}
                ></checkout-module>
              </h2>
            </h2>`
        : this.noItemsMessage()}
    `;
  }
  static get properties() {
    return {
      cart: { type: Object },
      total: { type: Number },
    };
  }
  constructor() {
    super();
    this.cart = {};
    this.total = 0;
  }
  stateChanged(state) {
    this.cart = state.cart.items;
    this.total = this.getTotal();
  }
  updated() {
    return true;
  }
  connectedCallback() {
    super.connectedCallback();
  }

  getTotal() {
    if (this.cart) {
      let total = Object.values(this.cart).reduce((currentValue, nextValue) => {
        return currentValue + nextValue.quantity * nextValue.item.price;
      }, 0);
      return parseInt(total, 10);
    }
  }
  showItems(items) {
    return html`${Object.keys(this.cart).map(
      (item) =>
        html`<cart-item
          .handleClick=${this.handleClick.bind(this)}
          .contents=${this.cart[item]}
          .count=${this.cart[item].quantity}
        ></cart-item> `
    )}`;
  }
  handleClick = (productId) => (event) => {
    store.dispatch(cartActions.removeFromCart(productId));
  };
  noItemsMessage() {
    return html`<a href="/products">Find some products to add to your cart</a>`;
  }
}

customElements.define("edit-cart", EditCart);
