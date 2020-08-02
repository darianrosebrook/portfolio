import { LitElement, html } from 'lit-element';

import './routes/index.js';
import { connectRouter } from 'lit-redux-router';
import { connect } from 'pwa-helpers';
import { store } from './redux/store/index.js';

import styles from './styles/index.js';

connectRouter(store);

export class Portfolio extends connect(store)(LitElement) {
  static get properties() {
    return {
      title: { type: String },
      page: { type: String },
    };
  }

  static get styles() {
    return [styles];
  }

  render() {
    return html` <router-routes></router-routes> `;
  }
}

customElements.define('root-portfolio', Portfolio);
