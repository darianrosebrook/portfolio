import { LitElement, html, css } from "lit-element";
import "../shared/layout";
import { isAuthenticated } from "../../auth";
import { orderService } from "../../redux/services";
import moment from "moment/src/moment";
import styles from "../../styles";

import "./orders";

class AdminDashboard extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
    };
  }
  constructor() {
    super();
    this.heading = "Manage the Compass of Design";
    this.description = "let's get started.";
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
  render() {
    const {
      user: { _id, publicDetails, admin, email },
    } = isAuthenticated();

    const adminLinks = () => {
      return html`
        <div>
          <h3>Create</h3>
          <ul>
            <li><a href="/create/category">Category</a></li>
            <li><a href="/create/product">Product</a></li>
            <li><a href="/create/article">Article</a></li>
            <li><a href="/create/book">Book</a></li>
          </ul>
          <h3>Manage</h3>
          <ul>
            <li><a href="/admin/categories">Categories</a></li>
            <li><a href="/admin/products">Products</a></li>
            <li><a href="/admin/articles">Articles</a></li>
            <li><a href="/admin/books">Books</a></li>
          </ul>
        </div>
      `;
    };
    const adminInfo = () => {
      return html`<div>
        <h3>Admin information</h3>
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

    this.description = `Hey ${publicDetails.name}, ` + this.description;
    return html`
      <shared-layout heading=${this.heading} description=${this.description}>
        <p>It's ${moment(Date(Date.now)).format("MMMM Do, YYYY")}</p>
        ${adminLinks()} ${adminInfo()}
        <orders-list></orders-list>
      </shared-layout>
    `;
  }
}

customElements.define("admin-dashboard", AdminDashboard);
