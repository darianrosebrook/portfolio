import { LitElement, html, css } from "lit";
import styles from "../../styles";
import reset from "../../styles/reset";

import { store } from "../../redux/store";
import { connect } from "pwa-helpers";

import { adminService } from "../../redux/services";

class Orders extends connect(store)(LitElement) {
  render() {
    return html`<style>
        .grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: var(--margin);
          margin: var(--margin) 0;
        }
        .grid div {
          grid-column: span 2;
        }
      </style>
      <h5>Order history</h5>
      <p>You have ${this.orders.length} orders</p>
      <div class="grid">
        ${this.noOrders(this.orders)}
      </div> `;
  }
  static get properties() {
    return {
      account: { type: Object },
      orders: { type: Array },
      statusValues: { type: Array },
    };
  }
  static get styles() {
    return [reset, styles];
  }
  constructor() {
    super();
    this.orders = [];
    this.statusValues = [];
  }
  connectedCallback() {
    super.connectedCallback();
    this.loadOrders();
    this.loadStatusValues();
  }

  stateChanged(state) {
    this.account = state.authentication.account;
  }

  date = (date) => {
    date = new Date(date);
    var day = date.getDate();
    if (day < 10) {
      day = "0" + day;
    }
    var month = date.getMonth();
    switch (month) {
      case 0:
        month = "January";
        break;
      case 1:
        month = "February";
        break;
      case 2:
        month = "March";
        break;
      case 3:
        month = "April";
        break;
      case 4:
        month = "May";
        break;
      case 5:
        month = "June";
        break;
      case 6:
        month = "July";
        break;
      case 7:
        month = "August";
        break;
      case 8:
        month = "September";
        break;
      case 9:
        month = "October";
        break;
      case 10:
        month = "November";
        break;
      case 11:
        month = "December";
        break;
      default:
        month = "Invalid month";
    }
    var year = date.getFullYear();
    return month + " " + day + ", " + year;
    // date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
  };
  loadStatusValues = () => {
    adminService
      .getStatusValues(
        this.account.user.publicDetails.userName,
        this.account.token
      )
      .then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          this.statusValues = data;
        }
      });
  };
  loadOrders = () => {
    adminService
      .listOrders(this.account.user.publicDetails.userName, this.account.token)
      .then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          this.orders = data;
        }
      });
  };
  showStatus = (order) => {
    return html`
      <select @input=${(e) => this.handleStatusChange(e, order)}>
        <option value="Not processed"> Update Status</option
        >${this.statusValues.map(
          (item) => html`<option value=${item}>${item}</option>`
        )}</select
      >
    `;
  };
  handleStatusChange(e, id) {
    adminService
      .updateOrderStatus(
        this.account.user.publicDetails.userName,
        this.account.token,
        id,
        e.target.value
      )
      .then((data) => {
        if (data.error) {
          console.log("Status update has failed");
        } else {
          this.loadOrders();
        }
      });
  }
  statusColor = (status) => {
    switch (status) {
      case "Not processed":
        return "color: var(--cr-orange-60)";
        break;
      case "Processing":
        return "color: var(--cr-purple-60)";
        break;
      case "Shipped":
        return "color: var(--cr-cyan-60)";
        break;
      case "Delivered":
        return "color: var(--cr-green-60)";
        break;
      case "Cancelled":
        return "color: var(--cr-red-60)";
        break;
      default:
        return;
        break;
    }
    status == "Not processed"
      ? "color: var(--cr-orange-60)"
      : "color: var(--cr-green-60)";
  };
  noOrders = () => {
    return this.orders.length > 0
      ? html`${this.orders.reverse().map((item, index) => {
          return html`<div>
              <p>${this.date(item.createdAt)}</p>
              <h5>${item.user.publicDetails.name}</h5>
              <h6 class="subheading" ">
                <a href="mailto:${
                  item.user.privateDetails.email
                }?subject=Quick%20update%20about%20your%20recent%20order%20" target="_blank">${
            item.user.privateDetails.email
          }</a>
              </h6>
              <p><a href="https://dashboard.stripe.com/test/payments/${
                item.transaction_id
              }" target="_blank">Manage on Stripe</a></p>
              <h6
                style="${this.statusColor(item.status)}"
              >
                ${item.status}
              </h6>
              ${this.showStatus(item._id)}
              <p><strong>$${(item.amount / 100).toFixed(2)}</strong></p>
            </div>`;
        })}`
      : html` <p>No orders could be found</p> `;
  };
}

customElements.define("orders-list", Orders);
