import { LitElement, html } from 'lit-element';
import '@intcreator/markdown-element';

class UpdateItem extends LitElement {
  render() {
    return html` <markdown-element src="${this.src}"></markdown-element> `;
  }

  static get properties() {
    return {
      src: String,
    };
  }
}

customElements.define('update-item', UpdateItem);
