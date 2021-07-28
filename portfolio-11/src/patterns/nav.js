import {LitElement,html, css} from 'lit';
import { logout, isAuthenticated } from "../auth";
import { navigate } from "lit-redux-router";
import {store} from '../redux/store';
import {connect} from 'pwa-helpers/connect-mixin.js';
import { userActions } from "../redux/actions";

import styles from '../styles'

class Nav extends connect(store)(LitElement) {
  render() {
    const { user } = isAuthenticated();
    const redirectUser = () => {
      this._goTo("/");
    };
    let accountLocation;
    if (user && user.admin.role === 1) {
      accountLocation = "/admin/account";
    } else {
      accountLocation = "/user/account";
    }
    return html`
      <nav>
        <div>
          <a href="/" style=${this._isActive(window, "/")}> Home </a>
          <a href="/products" style=${this._isActive(window, "/products")}>
            Products
          </a>
          <a href="/articles" style=${this._isActive(window, "/articles")}>
            Articles
          </a>
          <a href="/books" style=${this._isActive(window, "/books")}>
            Books
          </a>

          |
          <search-component></search-component>
        </div>
        <div>
          <a href="/cart"
            >Cart
            ${this.cart && Object.keys(this.cart).length > 0
              ? html`(${Object.keys(this.cart).length})`
              : html``}</a
          >
          ${isAuthenticated()
            ? html` <a
                href=${accountLocation}
                style=${this._isActive(window, accountLocation)}
              >
                Account
              </a>`
            : html`<a
                href="/sign-in"
                style=${this._isActive(window, "/sign-in")}
              >
                Sign in
              </a>`}
          ${!isAuthenticated()
            ? ""
            : html`<button
                @click=${() =>
                  store.dispatch(userActions.logout(() => redirectUser()))}
              >
                Logout
              </button>`}
        </div>
      </nav>
    `
  }
  static get styles() {
    return [styles, css`
      nav {
        margin: 0;
        padding: 0;
        list-style: none;
      }
      ul {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        padding: 0;
        margin: 0;
        list-style: none;
      }
    `]
  }
  static get properties() {
    return {
      cart: { type: Object },
    };
  }
  constructor() {
    super();
    this.cart = {};
  }
  stateChanged(state) {
  }

  _goTo(path) {
    store.dispatch(navigate(path));
  }
  _isActive = (history, path) => {
    if (history.location.pathname === path) {
      return "pointer-events: none; text-decoration: none; font-weight: 600; color: var(--foreground)";
    } else {
      return "";
    }
  };
}
customElements.define("nav-bar", Nav);