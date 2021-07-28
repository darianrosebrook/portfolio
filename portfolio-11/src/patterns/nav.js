import {LitElement,html, css} from 'lit';
import styles from '../styles'

class Nav extends LitElement {
  render() {
    return html`
      <nav>
        <ul>
          <li><a href='/'> Darian Rosebrook</a></li>
          <li>@darianrosebrook</li>
          <li>
            <a href="/sign-in">Sign in</a>
          </li>
        </ul>
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
}
customElements.define("nav-bar", Nav);