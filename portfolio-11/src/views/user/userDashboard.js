import { LitElement, html, css } from "lit-element";
import "../shared/layout";
import { isAuthenticated } from "../../auth";
import { orderService } from "../../redux/services";
import moment from "moment/src/moment";
import styles from "../../styles";

class Dashboard extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
      history: { type: Array },
    };
  }
  constructor() {
    super();
    this.heading = "Dashboard";
    this.description = "Welcome to the Compass of Design";
  }
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
  connectedCallback() {
    super.connectedCallback();

    const { user, token } = isAuthenticated();
    orderService
      .getPurchaseHistory(user.publicDetails.userName, token)
      .then((data) => {
        this.history = data;
      })
      .catch((err) => {
        console.log(err);
      });
  }
  render() {
    const {
      user: { _id, publicDetails, admin, email },
    } = isAuthenticated();

    const userLinks = () => {
      return html`
        <div>
          <h3>Account</h3>
          <ul>
            <li><a href="/cart"> Cart</a></li>
            <li><a href="/account">Account</a></li>
          </ul>
        </div>
      `;
    };
    const userInfo = () => {
      return html`<div>
        <h3>User information</h3>
        <ul>
          <li>${publicDetails.name}</li>
          <li>${email}</li>
          <li>
            ${admin.role === 1
              ? "Admin joined on " +
                moment(publicDetails.date).format("MMMM Do, YYYY")
              : "Joined on " +
                moment(publicDetails.date).format("MMMM Do, YYYY")}
          </li>
        </ul>
      </div>`;
    };
    const purchaseHistory = () => {
      return html` <div>
        <h3>Purchase history</h3>
        <ul>
          ${this.history.map((h, i) => {
            return html`
              ${h.products.map((p, i) => {
                return html`
                  <li className="list-group-item">
                    <div>
                      <hr />
                      <div key=${i}>
                        <h6>Product name: ${p.item.title}</h6>
                        <h6>
                          Product price: $${parseInt(p.item.price).toFixed(2)}
                        </h6>
                        <h6>
                          Purchased date:${" "} ${moment(p.createdAt).fromNow()}
                        </h6>
                      </div>
                    </div>
                  </li>
                `;
              })}
            `;
          })}
        </ul>
      </div>`;
    };
    const accountProfile = () => {
      return html` <div>
        <h3>Account Profile</h3>
        <ul>
          <li><a href="/u/${publicDetails.userName}">Your Profile</a></li>
        </ul>
      </div>`;
    };

    this.description = `Hey ${publicDetails.name}, ` + this.description;
    return html`
      <shared-layout heading=${this.heading} description=${this.description}>
        ${userLinks()} ${userInfo()} ${purchaseHistory()} ${accountProfile()}
      </shared-layout>
    `;
  }
}

customElements.define("user-dashboard", Dashboard);
