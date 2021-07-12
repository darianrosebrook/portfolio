import { LitElement, html, css } from "lit-element";
import "../shared/layout";
import "../../admin/articleform";

class EditArticle extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
    };
  }
  constructor() {
    super();
    this.heading = "Articles";
    this.description = "Edit a new article";
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
        <article-form></article-form>
      </shared-layout>
    `;
  }
}

customElements.define("edit-article", EditArticle);
