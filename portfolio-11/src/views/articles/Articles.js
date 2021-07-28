import { LitElement, html, css } from "lit";
import "../shared/layout";
import "../../modules/nav";
import "../../modules/articleslist";

class Articles extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
    };
  }
  constructor() {
    super();
    this.heading = "Articles";
    this.description = "Articles written by designers";
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
        <articles-list></articles-list>
      </shared-layout>
    `;
  }
}

customElements.define("articles-page", Articles);
