import {LitElement,html, css} from 'lit';
import styles from '../styles'

import { navigate } from "lit-redux-router";

import { login, authenticate, isAuthenticated } from "../auth";
import { userActions } from "../redux/actions";
import { store } from "../redux/store.js";
import { connect } from "pwa-helpers";

import '../components/inputtext'
import '../components/button'

class LoginForm extends connect(store)(LitElement) {
  render() {
    return html`
      <form>
        <text-input
          inputType="email"
          label="Email"
          placeholder="Email"
          .value="${this.email}"
          .data=${this.error ? this.data.email : null}
          @textInputChange=${e => this._handleChange(e, "email")}
          @textInputEnter=${e => this._login(e)}
          submitFromField
        ></text-input>
        <text-input
          inputType="password"
          label="Password"
          placeholder="Password"
          .value="${this.password}"
          .data=${this.error ? this.data.password : null}
          @textInputChange=${e => this._handleChange(e, "password")}
          @textInputEnter=${e => this._login(e)}
          submitFromField
        ></text-input>
        <lit-button @buttonPress=${this._login}>Submit</lit-button>

        ${this.showLoading()} 
        ${this.authenticated.loggedIn ? this.redirectUser() : ""}
      </form>
    `
  }
  static get styles() {
    return [styles, css`
      text-input {
        margin-bottom: 1rem;
        width: 100%;
        max-width: 40rem;
      }
    `];
  }
  static get properties() {
    return {
      email: { type: String },
      password: { type: String },
      data: { type: Object },
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
    this.error = false;
    this.loading = false;
    this.redirectToReferrer = false;
    this.authenticated = false;
    this.data = {};
    const { user } = isAuthenticated();
  }
  connectedCallback() {
    super.connectedCallback();

    this.password = "password";
    this.email = 'hello@darianrosebrook.com'
  }
  _handleChange = (event, name) => {
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
    this.error = state.alert.errType ? true : false;
    if (state.alert.errType) {
      this.data[state.alert.errType].message = state.alert.message;
      this.data[state.alert.errType].type = 'danger';
      console.log(this.data);
    }
  }
  _login = (event) => {
    event.preventDefault();
    this.loading = true;

    this.data = {
      email: {
        message: !this.email ? "Email is required" : "",
        type: !this.email ? "danger" : "",
      },
      password: {
        message: !this.password ? "Password is required" : "",
        type: !this.password ? "danger" : "",
      }
    };
    if (!this.email || !this.password) {
      this.loading = false;
      return (this.error = true);
    }
    this.error = false;
    this.loading = true;
    store.dispatch(
      userActions.login({ email: this.email, password: this.password })
    );
    this.loading = false;
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