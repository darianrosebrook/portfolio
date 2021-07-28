import {LitElement,html,css} from 'lit';
import '../shared/layout';
import styles from '../../styles'
import '../../patterns/signinform'

class SignIn extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
    };
  }
  static get styles() {
    return styles;
  }
  constructor() {
    super();
    this.heading = "Sign in";
    this.description = "This is the sign in page";
  }
  render() {
    if (window.location.pathname != "/sign-in") {
      this.heading = "Please log in";
      this.description = "You must log in to see this page";
    }
    return html`
      <shared-layout heading=${this.heading} description=${this.description}>
      <h1>${this.heading}</h1>
      <login-form></login-form>
      </shared-layout>
    `;
  }
}
customElements.define("sign-in", SignIn);