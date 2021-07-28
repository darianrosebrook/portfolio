import { LitElement, html, css } from "lit";
import "../shared/layout";
import styles from "../../styles";

import '../../components/button'
import '../../components/icon'

class Home extends LitElement {
  constructor() {
    super();
  }
  static get styles() {
    return [
      styles,
      css`
        div {
          width: 100%;
        }
      `,
    ];
  }
  render() {
    return html`
      <shared-layout heading=${'Darian'} description=${'blah'}>
        
      </shared-layout>
    `;
  }
  _handleClick = (e) => {
    e.stopPropagation();
    console.log(e.detail);
  }
}

customElements.define("home-page", Home);
