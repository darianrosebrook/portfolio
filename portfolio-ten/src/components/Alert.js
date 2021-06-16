import { LitElement, html, css } from 'lit-element';
import './Button.js';
// Actions

// Styles

import styles from '../styles/index.js';

const host = css`
  .container {
    padding: 1rem;
    margin: 4rem 0;
    border-radius: var(--design-unit);
    background-color: var(--warn-background);
    color: var(--warn-foreground);
    display: flex;
    justify-content: space-between;
  }
  .content {
    width: 100%;
  }
  button-component {
    width: fit-content;
    color: var(--warn-foreground);
  }
  .hide {
    display: none;
  }
`;
// Components

// Redux
// class ___ extends connect(store)(LitElement) {

class AlertNotification extends LitElement {
  render() {
    return html` <div class="container ${this.dismissed ? 'hide' : ''}">
      <div class="content">
        <h6>${this.alertTitle}</h6>
        <p>${this.alertDescription}</p>
      </div>
      <button-component
        class="close"
        icon="times"
        iconSize="small"
        weight="r"
        ariaLabel="Close the modal"
        variant="stealth"
        action=""
        @click="${this._handleClick}"
      ></button-component>
    </div>`;
  }
  _handleClick(e) {
    this.dismissed = true;
    console.log(this.dismissed);
  }
  constructor() {
    super();
    this.dismissed = false;
    console.log(this.dismissed);
  }
  static get styles() {
    return [styles, host];
  }
  static get properties() {
    return {
      alertType: { type: String },
      dismissed: { type: Boolean },
      alertTitle: { type: String },
      alertDescription: { type: Object },
    };
  }
}

customElements.define('alert-notification', AlertNotification);
