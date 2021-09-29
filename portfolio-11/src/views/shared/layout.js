import { LitElement, html, css } from "lit";

import { store } from "../../redux/store.js";
import { connect, updateMetadata } from "pwa-helpers";

import { alertActions } from "../../redux/actions";

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
      
      ${this.showAlert ? html`<alert-toast @buttonPress=${this.clearAlert} @alert-close=${this.clearAlert} .hideAlert=${false} .data=${this.data }></alert-toast>` : ''}
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
    this.stylesheet = state.stylesheet;
    if (state.alert.type && state.alert.message) {
      this.data = {type: state.alert.type, message: state.alert.message, title: state.alert.title}
      this.showAlert = true;
    } else {
      this.showAlert = false;
    }
  }
  constructor() {
    super();
    this.heading = "Darian Rosebrook | Sr. Product Designer, Seattle, WA";
    this.description = "Hey there! I'm Darian Rosebrook. I work as a senior product designer in the Seattle area where I'm focused on design systems and better end-to-end user experiences.";
    this.showAlert = false;
    this.data = this.data || {type: '', message: null, title: null};
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
  clearAlert(e) {
    e.preventDefault();
    store.dispatch(
      alertActions.clear()
    );
    this.showAlert = false;
  }
}

customElements.define("shared-layout", Layout);
