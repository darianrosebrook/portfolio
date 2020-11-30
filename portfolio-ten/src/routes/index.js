import { LitElement, html, css } from 'lit-element';
import '../views/home/index.js';
import '../views/work/index.js';
import '../views/shared/PostShow.js';
import styles from '../styles/index.js';

class Routes extends LitElement {
  render() {
    return html`
      <section>
        <lit-route path="/" component="home-page"></lit-route>
        <lit-route
          path="posts/work-studies/:slug"
          component="post-show"
        ></lit-route>
        <lit-route path="/work" component="work-page"></lit-route>
      </section>
    `;
  }

  static get styles() {
    return [
      styles,
      css`
        lit-route {
          display: block;
          width: 100%;
        }
      `,
    ];
  }
}

customElements.define('router-routes', Routes);
