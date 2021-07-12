import { LitElement, html, css } from "lit";

import { store } from "../../redux/store.js";
import { connect, updateMetadata } from "pwa-helpers";

import '../../modules/nav'

class Layout extends connect(store)(LitElement) {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
      stylesheet: {
        type: Object,
      },
    };
  }

  constructor() {
    super();
    this.heading = "butts";
    this.description = "Hey there! I'm Darian Rosebrook. I work as a senior product designer in the Seattle area where I'm focused on design systems and better end-to-end user experiences.";
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
      <nav-bar></nav-bar>
      <slot></slot>
    `;
  }
}

customElements.define("shared-layout", Layout);
