import { LitElement, html, css } from "lit";
import "../shared/layout";
import "../../admin/CategoryForm";

class EditCategory extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
    };
  }
  constructor() {
    super();
    this.heading = "Categories";
    this.description = "Edit a new category";
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
        <category-form></category-form>
      </shared-layout>
    `;
  }
}

customElements.define("edit-category", EditCategory);
