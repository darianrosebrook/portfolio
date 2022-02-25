import {LitElement,html,css} from 'lit';
import styles from '../styles'
import './icon'
import './tooltip'

const toSentenceCase = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
class FileInput extends LitElement {
  render() {
    return html`
      ${this.label ? 
        html`<label for= "${this.id}">
          ${toSentenceCase(this.label)} ${this.required ? html`<span title="This field is required" style="color: var(--danger-foreground)">*</span>` : ''}
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
          <label for="${this.id}" id="fileLabel" @drop=${e => this._handleDrop(e)} @dragover=${e => this._handleDragover(e)}>
            ${this.icon ? html`<fa-icon icon="${this.icon}"></fa-icon>` : ''}
          
          ${this.value ? this.value.split( "\\" ).pop() : 'Add a file'}</label>

          <input
            type="file"
            name="${this.id}"
            id="${this.id}"
            accept=${this.accept}
            placeholder="${this.placeholder}"
            ?disabled=${this.disabled}
            ?required=${this.required}
            @change=${e => this._onChange(e)}
          />
        </div>
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
      inputType: {type: String},
      placeholder: {type: String},
      icon: {type: String},
      accept: {type: String},
      value: {type: String},
      label: {type: String},
      id: {type: String},
      tooltip: {type: String},
      data: {type: Object},
      disabled: {type: Boolean},
      required: {type: Boolean},
      submitFromField: {type: Boolean},
    }
  }
  static get styles() {
    return [styles, css`
      :host {
        margin: 1rem 0;
        }
      input[type="file"] {
        display: none;
      }
      #fileLabel {
        display: block;
        outline: none;
        font-weight: var(--normal);
        color: var(--secondary-text);
        padding: 1rem 2rem;
        min-height: 4.4rem;
        color: var(--foreground);
        transition: 0.1s ease-out;
        border: 2px solid;
        border-color: var(--foreground);
        border-radius: var(--design-unit);
        background: transparent;
        cursor: text;
        width: 100%;
        font-size: var(--ramp-t7);
      }
      #fileLabel:hover {
        cursor: pointer;
      }
        `];
  }
  constructor() {
    super();
    this.placeholder = '';
    this.icon = '';
    this.value = '';
    this.required = false;
    this.id = this.id || 'input-' + Math.random().toString(36).substring(7);
    this.data = this.data || {type: '', message: null};
    this.disabled = this.disabled || false;
  }
  _onChange(e) {
    this.value = e.target.value;
    console.log(this.value);
    this.data = {}
    this.dispatchEvent(new CustomEvent('fileInputChange', {
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
  
  _handleDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      console.log(e.dataTransfer.files[0]);
    const dt = e.dataTransfer;
    const files = dt.files[0].name;
    console.log(files);
    this.value = files;
    }

  }
  _handleDragover(e) {
    e.preventDefault();
  }
}
customElements.define("file-input", FileInput);
