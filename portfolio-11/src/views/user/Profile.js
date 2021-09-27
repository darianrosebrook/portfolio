import { LitElement, html, css } from "lit";
import "../shared/layout";
// import "../../modules/productslist";
// import "../../modules/profiledata";
import { store } from "../../redux/store.js";
import { connect } from "pwa-helpers";

import { userService } from "../../redux/services";

class UserProfile extends connect(store)(LitElement) {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
      user: { type: Object },
      account: { type: Object },
      error: { type: Object },
    };
  }
  constructor() {
    super();
    this.heading = "Edit profile";
    this.description = "Profile";
  }
  stateChanged(state) {
    this.user = state.authentication.account;
  }

  connectedCallback() {
    super.connectedCallback();
    function getPathFromUrl(string) {
      return string.split(/[?#]/)[0];
    }
    let url = window.location.href;
    url = getPathFromUrl(url).replace(/\/$/, "");
    const slug = url.substr(url.lastIndexOf("/") + 1);

    userService
      .read(this.user)
      .then((data) => {
        this.account = data;
      })
      .catch((err) => {
        this.error = err;
      });
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
        ${this.account
          ? html`<profile-data
              .account="${this.account}"
              .user="${this.user}"
            ></profile-data>`
          : ``}
      </shared-layout>
    `;
  }
}

customElements.define("user-profile", UserProfile);
