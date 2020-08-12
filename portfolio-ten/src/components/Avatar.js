import { LitElement, html, css } from 'lit-element';

// Actions

// Styles

// Components

// Redux
// class ___ extends connect(store)(LitElement) {

class Avatar extends LitElement {
  render() {
    return html` <img
      loading=" lazy"
      src="${this.source}"
      alt="${this.altHeading}"
      class="avatar"
    />`;
  }

  static get properties() {
    return {
      source: { type: String },
      altHeading: { type: String },
    };
  }

  static get styles() {
    return css`
      img {
        border: 1px solid var(--df-dark-neutral-dark);
        width: 3.6rem;
        max-width: 128px;
        border-radius: 100%;
      }
    `;
  }

  constructor() {
    super();
    this.source = '';
    this.altHeading = '';
  }
}

customElements.define('avatar-image', Avatar);
