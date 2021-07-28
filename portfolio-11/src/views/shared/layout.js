import { LitElement, html, css } from "lit";

import { store } from "../../redux/store.js";
import { connect, updateMetadata } from "pwa-helpers";

import '../../blocks/nav'
import '../../components/alert'
import '../../components/button'
import '../../components/inputtext'

class Layout extends connect(store)(LitElement) {
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
  render() {
    return html`
    <nav-bar></nav-bar>
      ${this.showAlert ? html`<alert-toast @buttonPress=${() => this.showAlert = false} .hideAlert=${false} .data=${this.data }></alert-toast>` : ''}
      <lit-button @buttonPress=${this._showToast} > <fa-icon icon="plus" ariaLabel="external link"></fa-icon> </lit-button>
      <text-input inputType="Email" placeholder="Please enter your Email" label="Email" tooltip="This  is the tooltip for email. Let's hope that this wraps" .data=${this.data}></text-input>
      <lit-button @buttonPress=${this._handleClick} context="warning"> <fa-icon icon="exclamation-triangle" ariaLabel="external link"></fa-icon> </lit-button>
      <lit-button @buttonPress=${this._handleClick} context="danger"> <fa-icon icon="times-octagon" ariaLabel="external link"></fa-icon> </lit-button>
      <lit-button @buttonPress=${this._handleClick} context="success"> <fa-icon icon="check-circle" ariaLabel="external link"></fa-icon> </lit-button>
      <slot></slot>
    `;
  }
  _showToast() {
    this.showAlert = !this.showAlert;
  }
  _handleClick = e => {
    e.stopPropagation();
    switch (e.detail.context) {
      case 'warning':
        this.data = {
          type: 'warning',
          message: 'This is a warning message',
          title: 'Alert',
        };
        break;
      case 'danger':
        this.data = {
          type: 'danger',
          message: 'This is a danger message',
          title: 'Alert',
        };
        break;
      case 'success':
        this.data = {
          type: 'success',
          message: 'This is a success message',
          title: 'Alert',
        };
        break;
      default:
        break;
    }
    console.log(this.data);
  }
}

customElements.define("shared-layout", Layout);
