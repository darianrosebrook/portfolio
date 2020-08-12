import { LitElement, html, css } from 'lit-element';

import styles from '../styles/index.js';

import './Icon.js';

class Button extends LitElement {
  render() {
    return !this.action
      ? html`<button class="${this.variant}">
          ${this._showIcon(this.icon, this.weight, this.ariaLabel)}${this
            .buttonText}
        </button>`
      : html`<a
          href="${this.action}"
          rel="noreferrer"
          target="_blank"
          class=" button ${this.variant}"
          >${this._showIcon(
            this.icon,
            this.weight,
            this.iconSize,
            this.ariaLabel
          )}${this.buttonText}</a
        >`;
  }

  static get properties() {
    return {
      buttonText: { type: String },
      icon: { type: String },
      iconSize: { type: String },
      weight: { type: String },
      ariaLabel: { type: String },
      variant: { type: String },
      action: { type: String },
      indicator: { type: String },
    };
  }

  static get styles() {
    return [
      styles,
      css`
        :host {
          display: inline-block;
        }
        a:hover fa-icon,
        button:hover fa-icon {
          color: var(--background) !important;
        }
        fa-icon {
          color: var(--foreground) !important;
        }
      `,
    ];
  }

  _showIcon = (icon, weight, size, label) => {
    return !this.icon
      ? ``
      : html`
          <fa-icon
            .icon=${icon}
            .weight=${weight}
            .ariaLabel=${label}
            .iconSize=${size}
          ></fa-icon>
        `;
  };
}

customElements.define('button-component', Button);
