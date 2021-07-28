import { LitElement, html, css } from "lit";
import "../shared/layout";
import "../../modules/nav";
import "../../modules/bookslist";

class Books extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
    };
  }
  constructor() {
    super();
    this.heading = "Books";
    this.description = "Welcome to the compass of design";
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
        <books-list></books-list>
      </shared-layout>
    `;
  }
}

customElements.define("books-page", Books);
