import {LitElement,html} from 'lit';

class Nav extends LitElement {
  render() {
    return html`
      <nav>
        <ul>
          <li>Darian Rosebrook</li>
          <li>@darianrosebrook</li>
          <li>
            <a href="/sign-in">Sign in</a>
          </li>
        </ul>
      </nav>
    `
  }
}
customElements.define("nav-bar", Nav);