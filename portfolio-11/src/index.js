import { LitElement, html} from "lit";
import { connectRouter } from "lit-redux-router";
import "./routes/Routes";

import { store } from "./redux/store.js";
import { connect } from "pwa-helpers";

connectRouter(store);

export class portfolio extends connect(store)(LitElement) {
  static get properties() {
    return {
      title: { type: String },
      page: { type: String },
    };
  }

  render() {
    return html`<router-routes></router-routes>`;
  }
}
customElements.define("root-portfolio", portfolio);
