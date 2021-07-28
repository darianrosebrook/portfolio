import {LitElement,html,css} from 'lit';
import styles from '../styles'
import './icon'
import './tooltip'

const toSentenceCase = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
const validateEmail = email => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};
const validatePassword = password => {
  const re = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:'",.<>/?]{6,}$/;
  return re.test(password);
};

class TextInput extends LitElement {
  render() {
    return html`
      ${this.label ? html`<label for= "${this.id}">
        ${toSentenceCase(this.label)} 
        ${this.tooltip ? html`<tool-tip type=${this.data.type} for='trigger-${this.id}' details=${this.tooltip}><fa-icon tabindex="0" id='trigger-${this.id}' slot="trigger" icon="info-circle"></fa-icon></tool-tip>` : ''}</label>` : ''
      }
      <input ?disabled=${this.disabled} id=${this.id} type="${this.inputType}" placeholder="${this.placeholder}" value="${this.value}" @input=${this._onChange} />
      ${this.data && this.data.message ? html`<p class="${this.data.type} formValidation"><span >${this._validationIcon(this.data.type)} ${this.data.message}</span></p>` : ''}
    `;
  }
  static get properties() {
    return {
      inputType: {type: String},
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
    this.inputType = this._setType(this.inputType);
    this.placeholder = '';
    this.value = '';
    this.id = this.id || 'input-' + Math.random().toString(36).substring(7);
    this.data = this.data || {type: '', message: null};
    this.disabled = this.disabled || false;
  }
  _onChange(e) {
    this.value = e.target.value;
    this.data = {}
    this.dispatchEvent(new CustomEvent('textInputChange', {
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
  _setType(type) {
    switch (type) {
      case 'text':
        this.inputType = 'text';
        break;
      case 'password':
        this.inputType = 'password';
        break;
      case 'number':
        this.inputType = 'number';
        break;
      case 'email':
        this.inputType = 'email';
        break;
      case 'url':
        this.inputType = 'url';
        break;
      case 'tel':
        this.inputType = 'tel';
        break;
      case 'search':
        this.inputType = 'search';
        break;
      case 'date':
        this.inputType = 'date';
        break;
      case 'time':
        this.inputType = 'time';
        break;
      case 'datetime-local':
        this.inputType = 'datetime-local';
        break;
      default:
        this.inputType = 'text';
        break;
    }
  }
}
customElements.define("text-input", TextInput);

