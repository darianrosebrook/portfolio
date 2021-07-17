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
        <!-- <lit-button href="https://darianrosebrook.com" >External Link</lit-button>
        <lit-button href="/home" >Local Link</lit-button>
        <lit-button  ><fa-icon icon="arrow-left" ariaLabel="external link"></fa-icon> Button</lit-button>
        <lit-button @buttonPress=${this._handleClick}  >Button <fa-icon icon="arrow-right" ariaLabel="external link"></fa-icon> </lit-button>
        <lit-button  > <fa-icon icon="plus" ariaLabel="external link"></fa-icon> </lit-button>
        <lit-button  > <fa-icon icon="times" ariaLabel="external link"></fa-icon> </lit-button>
        <lit-button  > <fa-icon icon="shopping-cart" ariaLabel="external link"></fa-icon> </lit-button>
        <lit-button disabled href="https://darianrosebrook.com" >External Link</lit-button>
        <lit-button disabled href="/home" >Local Link</lit-button>
        <lit-button disabled  ><fa-icon icon="arrow-left" ariaLabel="external link"></fa-icon> Button</lit-button>
        <lit-button disabled @buttonPress=${this._handleClick}  >Button <fa-icon icon="arrow-right" ariaLabel="external link"></fa-icon> </lit-button>
        <lit-button disabled  > <fa-icon icon="plus" ariaLabel="external link"></fa-icon> </lit-button>
        <lit-button disabled  disabled> <fa-icon icon="times" ariaLabel="external link"></fa-icon> </lit-button>-->
      </shared-layout>
    `;
  }
  _handleClick = (e) => {
    e.stopPropagation();
    console.log(e.detail);
  }
}

customElements.define("home-page", Home);
