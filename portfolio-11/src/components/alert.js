import {LitElement,html,css} from 'lit';
import './button'
import './icon'
import styles from '../styles'

class Alert extends LitElement {
  render() {
    return html`
      <div class="fadein alert elevation-3 ${this.data.type}${this.hideAlert ? ' hidden' : ''}" role="alert" aria-live="assertive">
        <!-- <p class="p-1">${this.data.title}</p> -->
        <p>${this.data.message}</p>
        ${this.dismissable ? html`<lit-button @buttonPress=${this._closeAlert} buttonType="stealth" class="alert-close"><fa-icon icon='times' ></fa-icon></lit-button>` : ''}
      </div>
    `;
  }
  static get properties() {
    return {
      data: {type: Object},
      hideAlert: {type: Boolean},
    }
  }
  constructor() {
    super();
    this.hideAlert = true;
    this.dismissable = false;
  }
  connectedCallback() {
    super.connectedCallback();
    this.dismissable = this.data.type === 'danger';
    if (!this.dismissable) {
      setTimeout(() => {
        this._closeAlert();
      }, 3000);
    }

  }
  static get styles() {
    return [styles, css`
    :host {
      display: inline-block;
      width: auto;
      position: absolute;
      top: 1rem;
      transform: translateX(-50%);
      left: 50%;
    }
    p {
      line-height: 1;
      margin: 0;
    }
    .hidden {
      display: none;
      margin-top: -100px;
      opacity: 0;
    }
    .alert {
      position: relative;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 2rem;
      transition: var(--transition);
      position: relative;
      margin: 0 auto;
      max-width: 100%;
      background-color: var(--background);
      border: 1px solid var(--border);
      border-radius: 4px;
    }
    .success {
      background-color: var(--success-background);
      border: 1px solid var(--success-foreground);
      color: var(--success-foreground);
    }
    .info {
      background-color: var(--cr-neutral-10);
      border: 1px solid var(--cr-neutral-60);
    }
    .warning {
      background-color: var(--warning-background);
      border: 1px solid var(--warning-foreground);
      color: var(--warning-foreground);
    }
    .danger {
      background-color: var(--danger-background);
      border: 1px solid var(--danger-foreground);
      color: var(--danger-foreground);
    }
    .danger p {

      margin: 0 5rem 0 0;
    }
    .alert-close {
      position: absolute;
      top: 50%;
      right: 1rem;
      transform: translateY(-50%);

    }
    .alert-link {
      font-weight: bold;
    }
  `];
  }
  _closeAlert() {
    // fire a custom event to close the alert
    this.dispatchEvent(new CustomEvent('alert-close', {
      bubbles: true,
      composed: true,
    }));
    this.hideAlert = true;
  }

    
}
customElements.define("alert-toast", Alert);