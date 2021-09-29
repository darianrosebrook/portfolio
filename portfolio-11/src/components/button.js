import {LitElement,html,css} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import styles from '../styles';
import './icon'

const stylesheet = css`
  :host {
    display: inline-block;
    width: fit-content;
  }
`
const eventType = e => {
  if (e.type === 'click') {
    return true;
  } 
  return false;
};

class Button extends LitElement {
  render() {
    return this.href ?
      html`<a @click=${this._handleButtonPress} @keyup=${this._handleButtonPress}
            href=${this.href} 
            class="button${this.buttonType ? ' ' + this.buttonType : null}${this.disabled ? ' disabled' : null}" 
            target=${ifDefined(this.external ? '_blank' : undefined)}
            norel=${ifDefined(this.external ? true : undefined)}
            noreferrer=${ifDefined(this.external ? true : undefined)}
          >
          <slot></slot>
          ${this.external ? 
            html` <fa-icon icon="external-link-alt" ariaLabel="external link"></fa-icon>` : 
            null
          }
        </a>
      ` :
      html`<button class='button${this.buttonType ? ' ' + this.buttonType : null}${this.disabled ? ' disabled' : null}'  @click=${this._handleButtonPress} @keyup=${this._handleButtonPress}><slot></slot></button>`
  }

  static get properties() {
    return {
      key: {type: String},
      context: {type: String},
      href: {type: String},
      buttonType: {type: String},
      external: {type: Boolean},
      disabled: {type: Boolean}
    }
  }
  constructor() {
    super();
    this.external = false;
  }
  connectedCallback() {
    super.connectedCallback();
    this.external = this._isExternalURL(this.href);
  }
  static get styles() {
    return [styles, stylesheet];
  }
  _isExternalURL(url) {
    const r = new RegExp('^(?:[a-z]+:)?//', 'i');
    return r.test(url);
  }
  _handleButtonPress = e => {
    const event = new CustomEvent('buttonPress', {
      bubbles: true,
      composed: true,
      detail: {context: this.context,key: this.key}
    });
    const buttonPress = eventType(e) ? e : null;
    if (this.disabled) {
      e.preventDefault();
      return;
    } else {
      if (buttonPress) {
        this.dispatchEvent(event);
      } else {
        return;
      }
    }
  }
}
customElements.define("lit-button", Button);