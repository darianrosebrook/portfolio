import { LitElement, html, css } from "lit";
import "../shared/layout";
import { isAuthenticated } from "../../auth";
import { categoryService } from "../../redux/services";
import styles from "../../styles";
import "./orders";

import { store } from "../../redux/store.js";
import { connect } from "pwa-helpers";

class ManageCategories extends connect(store)(LitElement) {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
      categories: { type: Array },
    };
  }
  constructor() {
    super();
    this.heading = "Manage categories";
    this.description = "let's get started.";
  }
  connectedCallback() {
    super.connectedCallback();

    this.loadCategories();
  }
  stateChanged(state) {
    this.user = state.authentication.account.user;
    this.token = state.authentication.account.token;
  }
  loadCategories = () => {
    categoryService.getCategories().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        this.categories = data;
      }
    });
  };
  destroy = (categoryId) => {
    categoryService
      .deleteCategory(categoryId, this.user.publicDetails.userName, this.token)
      .then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          this.loadCategories();
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
        div + div {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        button {
          margin-left: 1rem;
        }
        li {
          display: flex;
          padding: 1rem;
          transition: all 0.3s ease-in-out;
          margin-left: -1rem;
          margin-right: -1rem;
          border-radius: var(--border-radius);
        }
        li:hover {
          background: var(--hover-background);
        }
      `,
    ];
  }
  render() {
    return html`
      <shared-layout heading=${this.heading} description=${this.description}>
        <div>
          <h2>Use this to edit categories</h2>
          <ul>
            ${this.categories
              ? this.categories.map((item) => {
                  console.log(item);
                  return html`
                  <li>
                    <div>                  
                  <h5>${item.category}</h5>
                  <!-- a paragraph with item.categoryType where the first letter is uppercase -->
                  <p>${item.categoryType.charAt(0).toUpperCase() +
                    item.categoryType.slice(1)}</p>
                  </div>
                  <div>
                    <a href="/edit/category/${item.slug}">Update</a>
                    <button @click=${() =>
                      this.destroy(
                        item.category
                      )} style="color: var(--cr-red-60)">Delete</button>
                  </div>
                  </li>`;
                })
              : ``}
          </ul>
        </div>
      </shared-layout>
    `;
  }
}

customElements.define("manage-categories", ManageCategories);
