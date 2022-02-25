import {LitElement,html,css} from 'lit';
import styles from '../styles'
import './icon'
import './tooltip'

const toSentenceCase = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

class InputGroup extends LitElement {
  render() {
    return html`
    <fieldset class="input-group" ${this.disabled ? 'disabled' : '' }>
    ${this.label ? 
        html`<label for=${this.inputId}>
          ${toSentenceCase(this.label)} ${this.required ? html`<span title="This field is required" style="color: var(--danger-foreground)">*</span>` : ''}
          ${this.tooltip ?
            html`
              <tool-tip
                alertType=${this.data ? this.data.type : 'info'}
                for='trigger-${this.inputId}'
                details=${this.tooltip}
              >
                <fa-icon
                  tabindex="0"
                  id='trigger-${this.inputId}'
                  slot="trigger"
                  icon="info-circle"
                ></fa-icon>
              </tool-tip>` : ''}
          </label>` : ''
      }
      <slot ></slot>
      ${this.data && this.data.message ?
        html`
          <p class="${this.data.type} formValidation">
          <span>${this._validationIcon(this.data.type)} ${this.data.message}</span>
        </p>`
        : ''}
    </fieldset>
    `
  }
  static get properties() {
    return {
      label: {type: String},
      inputId: {type: String},
      tooltip: {type: String},
      data: {type: Object},
      required: {type: Boolean},
    }
  }
  static get styles() {
    return [styles, css`
      fieldset {
        border: none;
        padding: 0;
        margin: 0;
      }
      `
        
    ]
  }
  constructor() {
    super();
    this.required = false;;
    this.data = this.data || {type: '', message: null};
  }
  _validationIcon(type) {
    switch (type) {
      case 'success':
        return html`<fa-icon icon="check-circle" ariaLabel="external link"></fa-icon>`;
      case 'warning':
        return html`<fa-icon icon="exclamation-triangle" ariaLabel="external link"></fa-icon>`;
      case 'danger':
        return html`<fa-icon icon="times-octagon" ariaLabel="external link"></fa-icon>`;
      default:
        return '';
    }
  }
}
customElements.define("input-group", InputGroup);