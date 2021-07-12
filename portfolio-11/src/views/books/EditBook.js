import { LitElement, html, css } from "lit-element";
import "../shared/layout";
import "../../admin/bookform";

class EditBook extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
    };
  }
  constructor() {
    super();
    this.heading = "Books";
    this.description = "Edit a new book";
  }
  static get styles() {
    return css`
      div {
        width: 100%;
      }
    `;
  }
  render() {
    return html`
      <shared-layout heading=${this.heading} description=${this.description}>
        <book-form></book-form>
      </shared-layout>
    `;
  }
}

customElements.define("edit-book", EditBook);
