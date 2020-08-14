import { LitElement, html } from 'lit-element';
import moment from 'moment/src/moment';

import styles from '../styles/index.js';

import './Icon.js';

class UpdateLink extends LitElement {
  render() {
    return html` <a class="block-link " href="/now/#${this.anchorTag}">
      <div class="linked-block">
        <p><fa-icon icon="${this.icon}" weight="r"></fa-icon></p>
        <small class="c1-upper">${this.date}</small>
        <h5>${this.title}</h5>
      </div>
    </a>`;
  }

  static get properties() {
    return {
      title: { type: String },
      date: { type: String },
      icon: { type: String },
      anchorTag: { type: String },
    };
  }

  static get styles() {
    return [styles];
  }

  connectedCallback() {
    super.connectedCallback();
    this.date = moment(this.date).format('DD MMM YYYY');
  }
}

customElements.define('update-link', UpdateLink);
