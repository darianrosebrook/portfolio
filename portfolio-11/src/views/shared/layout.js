import { LitElement, html, css } from "lit";

import { store } from "../../redux/store.js";
import { connect, updateMetadata } from "pwa-helpers";

import '../../modules/nav'
import '../../components/alert'
import '../../components/button'

class Layout extends connect(store)(LitElement) {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
      stylesheet: {
        type: Object,
      },
      showAlert: { type: Boolean },
    };
  }
  stateChanged(state) {
    this.heading = state.heading;
    this.description = state.description;
    this.stylesheet = state.stylesheet;
    this.showAlert = state.showAlert;
  }
  constructor() {
    super();
    this.heading = "butts";
    this.description = "Hey there! I'm Darian Rosebrook. I work as a senior product designer in the Seattle area where I'm focused on design systems and better end-to-end user experiences.";
    this.showAlert = false;
  }
  updated(changedProps) {
    if (changedProps.has('heading')) {
      if (this.heading) {
        updateMetadata({
          title: this.heading,
          description: this.description || this.heading,
          // image: this._meta.image || this.baseURI + 'images/shop-icon-128.png'
        });
      }
    }
  }
  render() {
    return html`
      ${this.showAlert ? html`<alert-toast @buttonPress=${() => this.showAlert = false} .hideAlert=${false} .data=${{message: 'Danger', type: 'danger', title: 'Danger'} }></alert-toast>` : ''}
      <lit-button @buttonPress=${this._handleClick} > <fa-icon icon="plus" ariaLabel="external link"></fa-icon> </lit-button>
      <nav-bar></nav-bar>
      <slot></slot>
    `;
  }
  _handleClick = e => {
    e.stopPropagation();
    this.showAlert = true;
  }
}

customElements.define("shared-layout", Layout);
