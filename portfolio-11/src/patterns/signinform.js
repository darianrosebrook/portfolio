import {LitElement,html} from 'lit';

class LoginForm extends LitElement {
  render() {
    return html`
      <h1>Where am i</h1>
    `
  }
}
customElements.define("login-form", LoginForm);