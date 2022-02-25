import {LitElement,html,css} from 'lit';

class InputTextArea extends LitElement {
  render() {
    return html`
      <div class="input-textarea">
        <textarea
          placeholder="${this.placeholder}"
          .value="${this.value}"
          id=${this.id}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @change=${this._onChange}
          @keyup=${this._handleEnterKey} 
        ></textarea>
      </div>
    `
  }
  static get properties() {
    return {
      id: {type: String},
      placeholder: {type: String},
      value: {type: String},
      label: {type: String},
      tooltip: {type: String},
      data: {type: Object},
      required: {type: Boolean},
      disabled: {type: Boolean},
      readOnly: {type: Boolean},
      submitFromField: {type: Boolean},
    }
  }
  static get styles() {
    return {
      
    }
  }
  constructor() {
    super();
    this.id = '';
    this.placeholder = '';
    this.value = '';
    this.label = '';  
    this.tooltip = '';
    this.data = {};
    this.disabled = false;
    this.required = false;
    this.readOnly = false;
    this.submitFromField = false;
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
  _handleEnterKey(e) {
    if (this.submitFromField && e.keyCode === 13) {
      this.dispatchEvent(new CustomEvent('textInputEnter', {
        bubbles: true,
        composed: true,
        detail: {value: this.value, id: this.id},
      }));
    }
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
customElements.define("input-textarea", InputTextArea);