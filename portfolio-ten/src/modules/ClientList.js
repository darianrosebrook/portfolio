import { LitElement, html, css } from 'lit-element';

// Actions

// Styles
import styles from '../styles/index.js';

// Components
import '../components/Icon.js';
import {
  clinicallyMediaLogo,
  compassOfDesignLogo,
  keySparkLogo,
  rockAgileLogo,
  shiplaneLogo,
  minimumLogo,
  travelightLogo,
  glassFrontierLogo,
} from '../../assets/img/logo/index.js';

// Redux
// class ___ extends connect(store)(LitElement) {

class ClientList extends LitElement {
  render() {
    return html`<section class="previous-clients">
      <article class="row">
        <h2>Previous Clients</h2>
        <div class="grid clients">
          <a href="https://clinicallymedia.com/" target="_blank"
            >${clinicallyMediaLogo}</a
          >

          <a href="https://compassofdesign.com" target="_blank"
            >${compassOfDesignLogo}</a
          >

          <a
            href="https://www.linkedin.com/company/keyspark/about/"
            target="_blank"
            >${keySparkLogo}</a
          >

          <a href="https://rockagile.io" target="_blank">${rockAgileLogo}</a>

          <a href="https://github.com/kirillian/shiplane">${shiplaneLogo}</a>

          <a href="https://somagnetic.com/archive/minimum" target="_blank"
            >${minimumLogo}</a
          >

          <a href="https://www.theglassfrontierak.com/" target="_blank"
            >${glassFrontierLogo}</a
          >

          ${travelightLogo}
        </div>
      </article>
    </section> `;
  }

  static get styles() {
    return [
      styles,
      css`
        .grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: var(--margin);
        }
        a {
          grid-column: span 1;
        }
        a svg {
          width: 100%;
        }
      `,
    ];
  }
}

customElements.define('client-list', ClientList);
