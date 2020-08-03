import { LitElement, html } from 'lit-element';

import styles from '../../styles/index.js';

import '../shared/Layout.js';
import '../../modules/Updates.js';
import '../../modules/Hero.js';
import '../../modules/Skills.js';
import '../../modules/ClientList.js';
import '../../modules/WorkHistory.js';
import '../../modules/Newsletter.js';
import '../../modules/Dribbble.js';
import '../../modules/Talks.js';
import '../../modules/BookList.js';
import '../../modules/Podcast.js';
import '../../modules/Contact.js';

class Home extends LitElement {
  render() {
    return html`
      <shared-layout>
        <update-list></update-list>
        <hero-content></hero-content>
        <skills-list></skills-list>
        <client-list></client-list>
        <work-history></work-history>
        <newsletter-form></newsletter-form>
        <dribbble-shots></dribbble-shots>
        <video-talks></video-talks>
        <book-list></book-list>
        <podcast-list></podcast-list>
        <contact-form></contact-form>
      </shared-layout>
    `;
  }

  static get styles() {
    return [styles];
  }
}

customElements.define('home-page', Home);
