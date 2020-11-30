import { LitElement, html, css } from 'lit-element';

import moment from 'moment/src/moment';
import { work } from '../../constants/index.js';
import { workLogos } from '../../assets/img/logo/WorkLogos.js';
import styles from '../../styles/index.js';
// Components
import '../../modules/Nav.js';
import '../../modules/Footer.js';
import 'prism-markdown-element/prism-markdown-element.js';

// import '../../components/MarkdownViewer.js';
// import '@intcreator/markdown-element';
// Redux
// Actions
const host = css`
  .hero h1,
  .hero p {
    margin: 0;
    margin-bottom: 1rem;
  }

  .hero .module {
    width: 100%;
  }

  .hero p {
    width: 25%;
  }

  .hero h1 {
    font-family: 'Crimson Pro';
    font-weight: 200;
    z-index: 1;
  }

  .hero figure {
    z-index: 0;
    max-width: 1400px;
    margin-bottom: 2rem;
  }

  .hero h2 {
    text-transform: uppercase;
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  @media (min-width: 1000px) {
    .hero figure {
      width: calc(70% - 1rem);
    }
    :host {
      position: relative;
      max-width: 1400px;
      margin: 0 auto;
      grid-gap: var(--design-unit);
      grid-template-columns: 1rem repeat(5, 1fr) 1rem;
    }

`;
// const stylesheet = css``;
class PostShow extends LitElement {
  render() {
    return html` <style>
        prism-markdown-element {
          max-width: 80%;
          margin: 8rem auto 0 auto;
        }</style
      ><nav-bar></nav-bar>
      <div class="hero row">
        <div>
          <div class="row-head">
            <h2>Article</h2>
            <h2>
              <a href="/"
                ><i class="fa fa-arrow-left icon"><span>Main menu,</span></i>
                Head Back</a
              >
            </h2>
          </div>
          <div>
            <div class="module">
              <figure class="f-r cf">
                <img
                  loading="lazy"
                  src="${work[this.src].hero_image}"
                  alt="${work[this.src].title} "
                />
              </figure>

              <p class="p-2">${workLogos[this.src]}</p>
              <h2>${work[this.src].companyName}</h2>
              <h1 class="name">${work[this.src].role}</h1>
              <p class="p-2">${work[this.src].subtitle}</p>
              <h6>
                ${moment(work[this.src].dateFrom).format('MMM YYYY')} &mdash;
                ${work[this.src].dateTo !== 'Present'
                  ? moment(work[this.src].dateTo).format('MMM YYYY')
                  : work[this.src].dateTo}
              </h6>
              <p class="p-2">${work[this.src].description}</p>
              <h2>Skills Used</h2>
              <ul class="title-list">
                ${work[this.src].skills.map(i => html` <li>${i}</li>`)}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <prism-markdown-element
        mdsrc="${work[this.src].src}"
        customtheme="../../styles/prism-ghcolors.css"
        style="font-size: 14px;"
      ></prism-markdown-element>
      <footer-content></footer-content>`;
  }

  constructor() {
    super();
    function getPathFromUrl(string) {
      return string.split(/[?#]/)[0];
    }
    let url = window.location.href;
    url = getPathFromUrl(url).replace(/\/$/, '');
    const slug = url.substr(url.lastIndexOf('/') + 1);
    const _camelize = s => s.replace(/-./g, x => x.toUpperCase()[1]);
    this.src = _camelize(slug);
  }

  static get properties() {
    return {
      stylesheet: {
        type: Object,
      },
      slug: {
        type: String,
      },
    };
  }

  static get styles() {
    return [styles, host];
  }
}

customElements.define('post-show', PostShow);
