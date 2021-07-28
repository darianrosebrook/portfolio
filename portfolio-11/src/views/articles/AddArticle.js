import { LitElement, html, css } from "lit";
import "../shared/layout";
import "../../admin/articleform";

class AddArticle extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
    };
  }
  constructor() {
    super();
    this.heading = "Articles";
    this.description = "Add a new article";
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

customElements.define("add-article", AddArticle);
