import { LitElement, html, css } from "lit";

import { store } from "../../redux/store.js";
import { connect, updateMetadata } from "pwa-helpers";

import '../../patterns/nav'
import '../../components/alert'

class Layout extends connect(store)(LitElement) {
  render() {
    return html`
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
        ${this.stylesheet ? this.stylesheet : ''}
      </style>
      <nav-bar></nav-bar>
      <slot></slot>
    `;
  }
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
      stylesheet: {
        type: Object,
      },
      showAlert: { type: Boolean },
      data: { type: Object },
    };
  }
  stateChanged(state) {
    console.log(state);
    this.stylesheet = state.stylesheet;
    this.showAlert = state.showAlert;
  }
  constructor() {
    super();
    this.heading = "Darian Rosebrook | Sr. Product Designer, Seattle, WA";
    this.description = "Hey there! I'm Darian Rosebrook. I work as a senior product designer in the Seattle area where I'm focused on design systems and better end-to-end user experiences.";
    this.showAlert = false;
    this.data = this.data || {type: '', message: null};
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
}

customElements.define("shared-layout", Layout);
