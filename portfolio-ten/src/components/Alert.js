import { LitElement, html, css } from 'lit-element';

// Actions

// Styles

import styles from '../styles/index.js';

const host = css`
  div {
    padding: 1rem;
    margin: 4rem 0;
    border-radius: var(--design-unit);
    background-color: var(--cr-orange-10);
    color: var(--cr-orange-70);
  }
`;
// Components

// Redux
// class ___ extends connect(store)(LitElement) {

class AlertNotification extends LitElement {
  render() {
    return html` <div>
      <p>
        <strong>
          This portfolio iteration is a test.
        </strong>
      </p>
      <p>
        I am using LitElement to recreate the original site as a test of
        <strong>design systems thinking</strong> and
        <strong>using native web components in production</strong>.
      </p>
      <p>
        For my actual portfolio, please check out
        <a
          href="https://darian.is/a-designer"
          style="color: var(--cr-blue-70);"
          target="_blank"
          >darian.is/a-designer</a
        >
      </p>
    </div>`;
  }

  static get styles() {
    return [styles, host];
  }
}

customElements.define('alert-notification', AlertNotification);
