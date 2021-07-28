import { LitElement, html, css } from "lit";
import "../shared/layout";
import { read } from "../../api/apicore";

class BookShow extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
      book: { type: Object },
      error: { type: Boolean },
    };
  }
  constructor() {
    super();
    this.heading = "Book title";
    this.description = "Book description";
    this.error = false;
  }

  connectedCallback() {
    super.connectedCallback();
    function getPathFromUrl(string) {
      return string.split(/[?#]/)[0];
    }
    let url = window.location.href;
    url = getPathFromUrl(url).replace(/\/$/, "");
    const bookSlug = url.substr(url.lastIndexOf("/") + 1);

    read("book", bookSlug)
      .then((data) => {
        this.book = data;
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
    this.heading = this.book.title;
    this.description = this.book.description;
    return html`
      <shared-layout heading=${this.heading} description=${this.description}>
        <p><img laoding="lazy" src="${this.book.photo}" /></p>
        <p>${this.book.body}</p></shared-layout
      >
    `;
  }
}

customElements.define("book-show", BookShow);
