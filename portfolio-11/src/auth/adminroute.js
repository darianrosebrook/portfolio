import {LitElement,html,css} from 'lit';
import {store} from '../redux/store.js';
import {connect} from 'pwa-helpers'


class Adminroute extends connect(store)(LitElement) {
  static get properties() {
    return {
      path: { type: String },
      component: { type: String },
      authenticated: { type: Object },
    };
  }

  stateChanged(state) {
    this.authenticated = state.authentication;
  }
  constructor() {
    super();
    this.authenticated = false;
  }
  render() {
    return html`
      <lit-route
        path=${this.path}
        component=${this.authenticated.loggedIn &&
        this.authenticated.account.user.admin.role === 1
          ? this.component
          : "sign-in"}
        heading=${this.authenticated.loggedIn ? "Please log in" : ""}
      >
      </lit-route>
    `;
  }
}
customElements.define("admin-route", Adminroute);