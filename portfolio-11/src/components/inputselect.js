import {LitElement,html,css} from 'lit';
import styles from '../styles'
import './icon'
import './tooltip'

const toSentenceCase = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

class SelectInput extends LitElement {
  render() {
    return html`
      
      ${this.label ? 
        html`<label for= "${this.id}">
          ${toSentenceCase(this.label)} 
          ${this.tooltip ?
            html`
              <tool-tip
                alertType=${this.data ? this.data.type : 'info'}
                for='trigger-${this.id}'
                details=${this.tooltip}
              >
                <fa-icon
                  tabindex="0"
                  id='trigger-${this.id}'
                  slot="trigger"
                  icon="info-circle"
                ></fa-icon>
              </tool-tip>` : ''}
          </label>` : ''
      }
      <select
        ?disabled=${this.disabled}
        id=${this.id}
        type=${this.inputType || 'text'}
        placeholder="${this.placeholder}"
        value="${this.value}"
        @input=${this._onChange}
        @keyup=${this._handleEnterKey} 
      >
        <option value="">
          ${this.placeholder}
        </option>
        ${this.options.map((option) => html`
          <option
            value="${option.value}"
            ?selected=${option.value === this.value}
          >
            ${option.label}
          </option>
        `)}
      </select>

      ${this.data && this.data.message ?
        html`
          <p class="${this.data.type} formValidation">
          <span>${this._validationIcon(this.data.type)} ${this.data.message}</span>
        </p>`
        : ''}
    `;
  }
  static get properties() {
    return {
      options: {type: Array},
      placeholder: {type: String},
      value: {type: String},
      label: {type: String},
      id: {type: String},
      data: {type: Object},
      tooltip: {type: String},
      disabled: {type: Boolean},
    }
  }
  static get styles() {
    return [styles, css`
      :host {
        margin: 1rem 0;
        }
        `];
  }
  constructor() {
    super();
    this.value = '';
    this.placeholder = '&emdash;Please select an option&emdash;'
    this.id = this.id || 'input-' + Math.random().toString(36).substring(7);
    this.data = this.data || {type: '', message: null};
    this.disabled = this.disabled || false;
  }
  _onChange(e) {
    this.value = e.target.value;
    this.data = {}
    this.dispatchEvent(new CustomEvent('selectInputChange', {
      bubbles: true,
      composed: true,
      detail: {value: this.value, id: this.id},
    }));
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
customElements.define("select-input", SelectInput);
