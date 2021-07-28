import {LitElement,html, css} from 'lit';
import styles from '../styles'

import { navigate } from "lit-redux-router";

import { login, authenticate, isAuthenticated } from "../auth";
import { userActions } from "../redux/actions";
import { store } from "../redux/store.js";
import { connect } from "pwa-helpers";

class LoginForm extends connect(store)(LitElement) {
  render() {
    return html`
      <form>
        <div class="input-group">
          <label for="email"
            >Email ${!this.email && this.loading ? "(required)" : ""}</label
          >
          <input
            @input=${this._handleChange("email")}
            type="email"
            name="email"
            placeholder="Email"
            value=${this.email}
            style=${!this.email && this.loading
              ? "border-color: var(--cr-red-60);"
              : ""}
            required
          />
        </div>
        <div class="input-group">
          <label
            for="password"
            style=${!this.password && this.loading
              ? "border-color: var(--cr-red-60);"
              : ""}
            >Password
            ${!this.password && this.loading ? "(required)" : ""}</label
          >
          <input
            @input=${this._handleChange("password")}
            type="password"
            name="password"
            placeholder="Password"
            value=${this.password}
            style=${!this.password && this.loading
              ? "border-color: var(--cr-red-60);"
              : ""}
            required
          />
        </div>
        <button @click=${this._login} type="submit">
          Submit
        </button>
        <p>
          ${this.showLoading()} ${this.showError()}
          ${this.authenticated.loggedIn ? this.redirectUser() : ""}
        </p>
      </form>
    `
  }
  static get styles() {
    return styles;
  }
  static get properties() {
    return {
      email: { type: String },
      password: { type: String },
      error: { type: String },
      loading: { type: Boolean },
      redirectToReferrer: { type: Boolean },
      authenticated: { type: Object },
      alert: { type: Object },
    };
  }
  constructor() {
    super();
    this.email = "";
    this.password = "";
    this.error = "";
    this.loading = false;
    this.redirectToReferrer = false;
    this.authenticated = false;
    const { user } = isAuthenticated();
  }
  connectedCallback() {
    super.connectedCallback();

    this.password = "password";
    this.email = 'hello@darianrosebrook.com'
  }
  _handleChange = (name) => (event) => {
    this.error = false;
    this.loading = false;
    switch (name) {
      case "email":
        this.email = event.target.value;
        break;
      case "password":
        this.password = event.target.value;
        break;
      default:
        break;
    }
  };
  stateChanged(state) {
    this.authenticated = state.authentication;
    this.error = state.alert.message;
  }
  _login = (event) => {
    event.preventDefault();
    this.loading = true;
    if (!this.email || !this.password) {
      return (this.error = "Please fill out this form completely");
    }
    this.error = false;
    this.loading = true;
    store.dispatch(
      userActions.login({ email: this.email, password: this.password })
    );
    this.loading = false;
  };
  showError = () => {
    return html`
      <div
        className="alert alert-danger"
        style="color: var(--cr-red-60); display: ${this.error ? "" : "none"}"
      >
        ${this.error}
      </div>
    `;
  };

  showLoading = () => {
    if (this.loading) {
      if (this.error) {
        return;
      }
      return html`
        <div
          className="alert alert-info"
          style="color: var(--df-dark-neutral-dark); display: ${this.loading
            ? ""
            : "none"}"
        >
          Loading... please wait
        </div>
      `;
    }
  };

  goTo(path) {
    store.dispatch(navigate(path));
  }
  redirectUser = () => {
    let path = window.location.pathname;
    let accountLocation;
    if (
      this.authenticated.account.user &&
      this.authenticated.account.user.admin.role === 1
    ) {
      accountLocation = "/admin/account";
    } else {
      accountLocation = "/user/account";
    }
    if (this.authenticated) {
      if (path == "/sign-in") {
        this.goTo(accountLocation);
      } else {
        this.goTo(path);
      }
    }
  };
}
customElements.define("login-form", LoginForm);