import { LitElement, html, css } from "lit";
import "@power-elements/stripe-elements";

import { store } from "../../redux/store.js";
import { connect } from "pwa-helpers";
import { alertActions } from "../../redux/actions";
import { paymentService, orderService } from "../../redux/services";
import { cartActions } from "../../redux/actions";

class PaymentForm extends connect(store)(LitElement) {
  static get properties() {
    return {
      error: {
        type: Object,
      },
      paymentMethod: {
        type: Object,
      },
      stripeKey: {
        type: String,
      },
      clientSecret: {
        type: Object,
      },
      action: {
        type: String,
      },
      items: {
        type: Object,
      },
      user: {
        type: Object,
      },
      loading: {
        type: Boolean,
      },
      address: {
        street1: {
          type: String,
        },
        street2: {
          type: String,
        },
        street3: {
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
        },
        postalCode: {
          type: String,
        },
        country: {
          type: String,
        },
      },
    };
  }
  constructor() {
    super();
    this.items = {};
    this.loading = false;
  }
  connectedCallback() {
    super.connectedCallback();
  }
  stateChanged(state) {
    this.items = state.cart.items;
    this.account = state.authentication.account;
  }
  render() {
    return html`<stripe-elements
        publishable-key="${this.stripeKey}"
        generate="payment-method"
        @input="${this.onChange}"
        @payment-method="${this.onSource}"
        @error="${this.onError}"
        @success
      ></stripe-elements>
      ${this.loading ? html`<p>Your payment is processing...</p>` : ``}
      <button ?disabled="${this.loading}" @click="${this.onClick}">
        Submit
      </button>`;
  }
  onChange({ target: { complete, hasError } }) {
    this.submitDisabled = !(complete && !hasError);
  }

  payWithCard = (stripe, card, clientSecret) => {
    stripe
      .confirmCardPayment(clientSecret, {
        payment_method: card.id,
        setup_future_usage: "off_session",
      })
      .then((result) => {
        if (result.error) {
          // Show error to customer
          this.error = result.error.message;
          // Dispatch the alert flash message
          store.dispatch(alertActions.error(result.error.message));
          this.loading = false;
        } else {
          // The payment succeeded!
          // Create order
          let orderItems = Object.keys(this.items).map((item) => {
            return this.items[item];
          });
          const createOrderData = {
            products: orderItems,
            transaction_id: result.paymentIntent.id,
            amount: result.paymentIntent.amount,
            address: this.address,
          };
          orderService
            .createOrder(
              this.account.user.publicDetails.userName,
              this.account.token,
              createOrderData
            )
            .then((data) => {
              // Reset the form

              this.shadowRoot.querySelector("stripe-elements").reset();
              // Dispatch the alert flash message
              store.dispatch(
                alertActions.success("Your card was successfully charged")
              );
              // Clear the cart
              store.dispatch(cartActions.clearCart());
              this.loading = false;
            });
        }
      });
  };
  onClick() {
    this.loading = true;
    let stripe = Stripe(this.stripeKey);
    // Grab the stripe elements form
    this.shadowRoot
      .querySelector("stripe-elements")
      // create a payment method
      .createPaymentMethod()
      .then((data) => {
        // Create a payment intent that holds the most current total, the items, and the id of the customer
        paymentService
          .paymentIntent(
            this.items,
            this.account.user.stripeId,
            this.account.user.email
          )
          .then((data) =>
            // Then pay using both the payment method and the payment intent
            this.payWithCard(stripe, this.paymentMethod, data.clientSecret)
          )
          .catch((err) => (this.error = err));
      })
      .catch((err) => {
        this.loading = false;
      });
  }

  onError({ target: { error } }) {
    this.error = error;
    store.dispatch(alertActions.error(JSON.stringify(error.message)));
  }
}

customElements.define("payment-form", PaymentForm);
