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
        <h1>👋🏼 Hey there, I&rsquo;m Darian.</h1>
        <p class='p-1'> I'm a senior product designer from the Seattle area where I focus on building design systems and teaching better end to end user experience design.</p>
        <h3>Products</h3>
        <p><a href="/">See more <fa-icon icon='arrow-right'></fa-icon></a></p>
        <h3>Writing</h3>
        <p><a href="/">See more <fa-icon icon='arrow-right'></fa-icon></a></p>
        <h3>Speaking</h3>
        <p><a href="/">See more <fa-icon icon='arrow-right'></fa-icon></a></p>
        <h3>Design Work</h3>
        <p><a href="/">See more <fa-icon icon='arrow-right'></fa-icon></a></p>



      </shared-layout>
    `;
  }
  _handleClick = (e) => {
    e.stopPropagation();
    console.log(e.detail);
  }
}

customElements.define("home-page", Home);
