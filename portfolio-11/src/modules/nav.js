import {LitElement,html} from 'lit';

class Nav extends LitElement {
  render() {
    return html`
      <div>Seattle, WA</div>
    `
  }
}
customElements.define("nav-bar", Nav);