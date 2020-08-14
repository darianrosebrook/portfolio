import { LitElement, html, css } from 'lit-element';

// Actions
import '../components/WorkLink.js';

import { work } from '../constants/index.js';
import { workLogos } from '../../assets/img/logo/index.js';

// Styles
import styles from '../styles/index.js';

const host = css`
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
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
// Components

// Redux
// class ___ extends connect(store)(LitElement) {

class WorkHistory extends LitElement {
  render() {
    return html`<section class=" work-history">
      <article class="row">
        <h2>Work History</h2>
        <div class="grid">
          ${Object.keys(work)
            .reverse()
            .slice(0, 4)
            .map(
              key => html`
                <work-link
                  class="grid-item"
                  .companyName="${work[key].companyName}"
                  .role="${work[key].role}"
                  .dateFrom="${work[key].dateFrom}"
                  .dateTo="${work[key].dateTo}"
                  .logo="${workLogos[key]}"
                  .src="${work[key]}"
                ></work-link>
              `
            )}
        </div>
      </article>
    </section> `;
  }

  static get styles() {
    return [styles, host];
  }
}

customElements.define('work-history', WorkHistory);
