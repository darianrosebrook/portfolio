import { LitElement, html, css } from "lit";
import "../shared/layout";
import "../../admin/bookform";

class AddBook extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
    };
  }
  constructor() {
    super();
    this.heading = "Books";
    this.description = "Add a new book";
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

customElements.define("add-book", AddBook);
