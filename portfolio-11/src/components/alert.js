import {LitElement,html,css} from 'lit';
import './button'
import './icon'
import styles from '../styles'

class Alert extends LitElement {
  render() {
    return html`
      <div class="alert elevation-3 ${this.data.type}${this.hideAlert ? ' hidden' : ''}" role="alert" aria-live="assertive">
        <h6>${this.data.title}</h6>
        <p>${this.data.message}</p>
        ${this.dismissable ? html`<lit-button @buttonPress=${this._handleButtonPress} buttonType="stealth" class="alert-close"><fa-icon icon='times' ></fa-icon></lit-button>` : ''}
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
    this.data = {
      title: 'Alert',
      message: 'This is a message',
      type: 'info',
    };
    this.hideAlert = true;
    this.dismissable = false;
  }
  connectedCallback() {
    super.connectedCallback();
    this.dismissable = this.data.type === 'danger';
    if (!this.dismissable) {
      setTimeout(() => {
        this._closeAlert();
      }, 5000);
    }

  }
  static get styles() {
    return [styles, css`
      .hidden {
        display: none;
        margin-top: -100px;
        opacity: 0;
      }
      .alert {
        transition: var(--transition);
        opacity: 1;
        position: relative;
        margin: 0 auto;
        max-width: 80%;
        padding: 10px;
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
      .alert-close {
        position: absolute;
        top: 8px;
        right: 8px;
      }
      .alert-link {
        font-weight: bold;
      }
    `];
  }
  _handleButtonPress = e =>  {
    this._closeAlert();
    return;
  }
  _closeAlert() {
    this.hideAlert = true;
  }

    
}
customElements.define("alert-toast", Alert);