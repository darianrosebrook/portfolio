// import { LitElement, html } from 'lit-element';
// import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
// // import 'https://cdnjs.cloudflare.com/ajax/libs/commonmark/0.29.2/commonmark.min.js';
// import * as Prism from 'prismjs';
// import styles from '../styles/index.js';
// class MarkdownElement extends LitElement {
//   render() {
//     return html`
//       <style>
//         ${fetch('../node_modules/prismjs/themes/prism.css').then(res =>
//             res.text()
//           )}
//           :host {
//           display: block;
//         }
//       </style>
//       ${this.stylesheet
//         ? html`<style>
//             ${styles} ${this.stylesheet}ul {
//               list-style-type: disc;
//             }
//             p,
//             ul,
//             h1,
//             h2,
//             h3,
//             h4,
//             h5,
//             h6,
//             ol,
//             hr,
//             iframe,
//             .twitter-tweet,
//             video {
//               text-transform: none;
//               grid-column: 1 / span 5;
//               margin: 0;
//               line-height: 1.2;
//               margin-bottom: 1.2em;
//             }
//
//             .twitter-tweet,
//             iframe {
//               margin: 0 auto;
//             }
//
//             video,
//             img {
//               width: 80%;
//               display: block;
//               margin: 0 auto var(--margin) auto;
//               grid-column: 1 / span 5;
//             }
//
//             p {
//               font-size: 1.4rem;
//             }
//
//             p .figcaption_hack {
//               width: 80%;
//               margin: 0 auto;
//               display: block;
//             }
//
//             @media (min-width: 1000px) {
//               p,
//               ul,
//               ol,
//               .twitter-tweet,
//               iframe,
//               video {
//                 grid-column: 2 / span 3;
//               }
//
//               h1,
//               h2,
//               h3,
//               h4,
//               h5,
//               h6 {
//                 grid-column: 2 / span 3;
//               }
//
//               hr {
//                 grid-column: 3 / span 1;
//               }
//
//               iframe {
//                 margin: 0 auto;
//               }
//
//               p img,
//               video {
//                 width: 100%;
//               }
//             }
//           </style>`
//         : null}
//       ${this.renderedMarkdown}
//     `;
//   }
//
//   static get properties() {
//     return {
//       markdown: String,
//       src: String,
//       scriptTag: Object,
//       renderedMarkdown: String,
//       safe: Boolean,
//       stylesheet: Object,
//     };
//   }
//
//   // render the markdown using the `markdown` attribute
//   // `markdown` is set either by the user or the component
//   set markdown(markdown) {
//     this.renderMarkdown(markdown).then(r => (this.renderedMarkdown = r));
//   }
//
//   // fetch the markdown using the `src` attribute
//   // note: overrides `markdown` attribute
//   set src(src) {
//     this.fetchMarkdown(src).then(r => (this.markdown = r));
//   }
//
//   // set the markdown from the script tag, trimming the whitespace
//   // note: overrides `src` and `markdown` attributes
//   set scriptTag(scriptTag) {
//     if (scriptTag) this.markdown = scriptTag.text.trim();
//   }
//
//   connectedCallback() {
//     super.connectedCallback();
//     // look for a script tag
//     this.scriptTag = this.querySelector('script[type="text/markdown"]');
//   }
//
//   async _didRender() {
//     // after render, highlight text
//     Prism.highlightAllUnder(this.shadowRoot, false);
//   }
//
//   // fetch the markdown and set it locally
//   async fetchMarkdown(src) {
//     if (!src.includes('.md'))
//       return '`src` attribute does not specify a Markdown file.';
//     return await fetch(src)
//       .then(async response => await response.text())
//       .catch(e => 'Failed to read Markdown source.');
//   }
//
//   async renderMarkdown(markdown) {
//     // parse and render Markdown
//     const reader = new commonmark.Parser();
//     const writer = new commonmark.HtmlRenderer({ safe: this.safe });
//     // assuming commmonmark library will properly sanitize code
//     return html` ${unsafeHTML(writer.render(reader.parse(markdown)))}`;
//   }
// }
//
// customElements.define('markdown-element', MarkdownElement);
