import { LitElement, html, css } from 'lit-element';
import moment from 'moment/src/moment';

import styles from '../styles/index.js';

import './Icon.js';

const host = css`
  .block-link {
    background-color: var(--divider-color);
  }
  .linked-block {
    padding: var(--margin);
  }
  fa-icon {
    transition: all ease 0.3s;
  }
  .linked-block:hover fa-icon {
    margin-left: var(--margin);
  }
  h5 {
    font-family: 'Crimson Pro';
  }
  .logo svg {
    width: var(--icon-small, 24px);
    height: auto;
  }
`;

class WorkLink extends LitElement {
  render() {
    return html` <a
      class="block-link"
      href="/now/#${this.anchorTag}"
      style="
    height: 100%;"
    >
      <div class="linked-block">
        <p class="logo">${this.logo}</p>
        <p
          style="
    padding-bottom: 8rem;"
        >
          ${this.companyName}
          <fa-icon icon="chevron-right" weight="r"></fa-icon>
        </p>
        <small class="c1-upper">${this.dateFrom} &mdash; ${this.dateTo}</small>
        <h5>${this.role}</h5>
      </div>
    </a>`;
  }

  static get properties() {
    return {
      companyName: { type: String },
      role: { type: String },
      dateFrom: { type: String },
      dateTo: { type: String },
      logo: { type: Object },
      anchorTag: { type: String },
    };
  }

  static get styles() {
    return [styles, host];
  }

  connectedCallback() {
    super.connectedCallback();
    this.dateFrom = moment(this.dateFrom).format('MMM YYYY');
    if (this.dateTo !== 'Present') {
      this.dateTo = moment(this.dateTo).format('MMM YYYY');
    }
  }
}

customElements.define('work-link', WorkLink);
