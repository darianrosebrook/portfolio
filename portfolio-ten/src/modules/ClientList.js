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

const host = css`
  .grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: var(--margin);
    margin: var(--margin) 0;
    align-items: center;
  }
  a {
    grid-column: span 4;
  }
  svg {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    height: auto;
    fill: var(--foreground);
  }
  section {
    padding-left: 2rem;
    border-left: 1px solid var(--divider-color);
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

class ClientList extends LitElement {
  render() {
    return html`<section class="previous-clients">
      <article class="row">
        <h2>Previous Clients</h2>
        <div class="grid ">
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

          <a href="#" style="pointer-events: none;">${travelightLogo}</a>
        </div>
      </article>
    </section> `;
  }

  static get styles() {
    return [styles, host];
  }
}

customElements.define('client-list', ClientList);
