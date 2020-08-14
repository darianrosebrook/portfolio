import { LitElement, html, css } from 'lit-element';

import '../components/UpdateLink.js';

// Actions

// Styles
import styles from '../styles/index.js';
// Components

// Resources
import { updates } from '../constants/index.js';

const host = css`
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    margin: var(--margin) 0;
    grid-gap: var(--design-unit);
  }
  h2 {
    font-size: var(--ramp-t7);
  }
  .row {
    padding: 1rem 0 1rem 0;
    border-bottom: 1px solid var(--divider-color);
  }
`;
// Redux
// class ___ extends connect(store)(LitElement) {

class Updates extends LitElement {
  render() {
    return html`<section class="row">
      <h2>Updates</h2>
      <div class="grid" id="updates">
        ${Object.keys(updates)
          .reverse()
          .slice(0, 5)
          .map(
            key => html` <update-link
              class="grid-item"
              .title=${updates[key].title}
              .date=${updates[key].date}
              .icon=${updates[key].icon}
              .anchorTag=${updates[key]}
            ></update-link>`
          )}
      </div>
    </section> `;
  }

  static get properties() {
    return {
      markdown: { type: Object },
    };
  }

  static get styles() {
    return [styles, host];
  }

  connectedCallback() {
    super.connectedCallback();
  }
}

customElements.define('update-list', Updates);
