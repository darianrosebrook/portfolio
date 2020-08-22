import { LitElement, html } from 'lit-element';
import moment from 'moment/src/moment';

import styles from '../styles/index.js';

import './Icon.js';

class VideoLink extends LitElement {
  render() {
    return html`<a href="{{post.url }}" rel="noreferrer" class="block-link">
      <img
        src="https://i.ytimg.com/vi/${this.videoId}/mqdefault.jpg"
        alt="${this.title}"
        loading="lazy"
      />
      <small class="c1-upper">${this.date}</small>
      <h5>${this.title}</h5>
      <p><small>${this.description}</small></p>
    </a>`;
  }

  static get properties() {
    return {
      title: { type: String },
      date: { type: String },
      icon: { type: String },
      anchorTag: { type: String },
      videoId: { type: String },
      description: { type: String },
    };
  }

  static get styles() {
    return [styles];
  }

  connectedCallback() {
    super.connectedCallback();
    this.date = moment(this.date).format('DD MMM YYYY');
    if (this.description.length > 10) {
      this.description = `${this.description.substring(0, 147)}...`;
    }
  }
}

customElements.define('video-link', VideoLink);
