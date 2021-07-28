import { LitElement, html, css } from "lit";
import "../shared/layout";
import "../../modules/articleslist";
import { read } from "../../api/apicore";

class ArticleShow extends LitElement {
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
      article: { type: Object },
      error: { type: Boolean },
    };
  }
  constructor() {
    super();
    this.heading = "Article title";
    this.description = "Article description";
    this.error = false;
  }

  connectedCallback() {
    super.connectedCallback();
    function getPathFromUrl(string) {
      return string.split(/[?#]/)[0];
    }
    let url = window.location.href;
    url = getPathFromUrl(url).replace(/\/$/, "");
    const articleSlug = url.substr(url.lastIndexOf("/") + 1);

    read("article", articleSlug)
      .then((data) => {
        this.article = data;
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
    this.heading = this.article.title;
    this.description = this.article.description;
    return html`
      <shared-layout heading=${this.heading} description=${this.description}>
        <p><img laoding="lazy" src="${this.article.photo}" /></p>
        <p>${this.article.body}</p></shared-layout
      >
    `;
  }
}

customElements.define("article-show", ArticleShow);
