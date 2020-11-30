import { LitElement, html } from 'lit-element';
import moment from 'moment/src/moment';

import styles from '../styles/index.js';
import './Icon.js';
import './Avatar.js';

class UpdateLink extends LitElement {
  render() {
    return html` <style>
        avatar-image {
          display: none;
        }
        .linked-block {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          grid-gap: var(--gap);
          align-items: center;
          width: 100%;
        }
        small {
          margin: 0;
          grid-column: 2 / span 2;
        }
        h5 {
          grid-column: 4 / span 7;
          margin: 0;
        }
        @media (min-width: 1000px) {
          avatar-image {
            display: block;
          }
          .linked-block {
            display: block;
          }
        }</style
      ><a class="block-link " href="/now/#${this.anchorTag}">
        <div class="linked-block">
          <avatar-image
            class="f-r"
            source="/assets/img/darian-rosebrook-avatar.jpg"
            altHeading="Darian Rosebrook's avatar"
          ></avatar-image>
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
