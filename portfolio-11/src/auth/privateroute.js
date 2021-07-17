import {LitElement,html,css} from 'lit';
import {store} from '../redux/store.js';
import {connect} from 'pwa-helpers'

class PrivateRoute extends connect(store)(LitElement) {
  static get properties() {
    return {
      path: {type: String},
      component: {type: String},
      authenticated: {type: Boolean},
    }
  }
  stateChanged(state) {
    this.authenticated = state.authentication;
    this.user = state.auth.user;
  }
  constructor() {
    super();
    this.authenticated = false;
  }
  render() {
    return html`
    <lit-route 
      path=${this.path}
      component=${this.authenticated.loggedIn ? this.component : 'sign-in'} 
      heading=${this.authenticated ? 'Please' : ''}></lit-route>
    `
  }
}
customElements.define("private-route", PrivateRoute);