import { LitElement, html, css } from "lit-element";
import "./paymentform";
import { isAuthenticated } from "../../auth";

import { store } from "../../redux/store.js";
import { connect } from "pwa-helpers";

import styles from "../../styles";

class CheckOut extends connect(store)(LitElement) {
  render() {
    return html`
      <h2>Your cart summary</h2>
      <h4>Your cart total</h4>
      <h3>$${this.total.toFixed(2)}</h3>
      ${this.showCheckout()}
    `;
  }
  static get properties() {
    return {
      items: { type: Object },
      currency: { type: String },
      amount: { type: Number },
      paymentMethod: { type: Object },
      total: { type: Number },
      user: { type: Object },
    };
  }
  static get styles() {
    return [styles];
  }
  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();
    this.currency = "USD";
    this.amount = this.value * 100;
    const { user } = isAuthenticated();
    this.user = user;
  }
  stateChanged() {
    this.amount = this.total;
  }
  showCheckout() {
    return isAuthenticated()
      ? html` <strong>
            A receipt for your purchase will be emailed to ${this.user.email}
          </strong>
          <h6 class="subheading">
            Please enter your card details to complete your purchase
          </h6>
          <payment-form
            .paymentMethod=${this.paymentMethod}
            .onSource=${this.onSource}
            action="${window.process.env.API_URL}/charge"
            stripeKey="pk_test_FYOKx8kh5rxcCJ2CwHtOPwFH"
          ></payment-form>`
      : html`<p>
            Please <a href="/sign-in">sign in</a> or
            <a href="/sign-up">sign up</a> to continue your checkout.
          </p>
          <p>An account is needed to access and manage your purchase</p>`;
  }
  onSource({ detail: paymentMethod }) {
    this.paymentMethod = paymentMethod;
  }
}

customElements.define("checkout-module", CheckOut);
