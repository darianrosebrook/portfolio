import { LitElement, html, css } from 'lit-element';

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

const stylesheet = css`
  :host {
    display: grid !important;
    margin: 0 auto;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: var(--design-unit);
    align-items: start;

    grid-template-areas: 'nv nv nv nv nv' 'he he he he he' 'ud ud ud ud ud' 'sk sk pc pc pc' 'sk sk wh wh wh' 'dw dw dw dw dw' 'nl nl nl nl nl' 'vd vd vd vd vd' 'pd pd pd pd pd' 'bk bk bk bk bk' 'ct ct ct ct ct' 'ft ft ft ft ft';
  }
  nav-bar {
    grid-area: nv;
    grid-column: 1 / span 5;
  }
::slotted(  update-list ){
    grid-area: ud;
    grid-column: 1 / span 5;
  }
  ::slotted(hero-content ){
    position: relative;
    grid-column: 1 / span 5;
    grid-area: he;
  }
  ::slotted(skills-list ){
    grid-column: span 2;
    grid-area: sk;
  }
  ::slotted(client-list) {
    grid-column: 3 / span 3;
    grid-area: pc;
  }
  ::slotted(work-history) {
    grid-column: 3 / span 3;
    grid-area: wh;
  }
  ::slotted(newsletter-form) {
    grid-area: nl;
    grid-column: 1 / span 5;
  }
  ::slotted(dribbble-shots) {
    grid-area: dw;
    grid-column: 1 / span 5;
  }
  ::slotted(video-talks) {
    grid-area: vd;
    grid-column: 1 / span 5;
  }
  ::slotted(book-list) {
    grid-area: bk;
    grid-column: 1 / span 5;
  }
  ::slotted(podcast-list) {
    grid-area: pd;
    grid-column: 1 / span 5;
  }
  ::slotted(contact-form) {
    grid-area: ct;
    grid-column: 1 / span 5;
  }
  footer-content {
    grid-area: ft;
    grid-column: 1 / span 5;
  }
  @media (min-width: 1000px) {
    :host {

      position: relative;
      max-width: 1400px;
      margin: 0 auto;
      left: 50%;
      transform: translateX(-50%);
      grid-gap: var(--design-unit);
      grid-template-columns: 1rem repeat(5, 1fr) 1rem;
      grid-template-areas: '. nv nv nv nv nv .' '. ud ud ud ud ud .' '. he he he he sk .' '. he he he he sk .' '. wh wh wh wh pc .' '. dw dw dw dw dw .' 'nl nl nl nl nl nl nl' '. vd vd vd vd vd .' '. pd pd pd pd pd .' 'bk bk bk bk bk bk .' '. ct ct ct ct ct .' '. ft ft ft ft ft .';
    }
    nav-bar {
      grid-area: nv;
    }
    ::slotted(update-list) {
      grid-area: ud;
    }
    ::slotted(hero-content) {
      position: relative;

        grid-column: 2/6
      grid-area: he;
    }
    ::slotted(skills-list) {
      grid-column: span 2;
      grid-area: sk;
    }
    ::slotted(client-list) {
      grid-column: 3 / span 3;
      grid-area: pc;
    }
    ::slotted(work-history) {
      grid-column: 3 / span 3;
      grid-area: wh;
    }
  ::slotted(  newsletter-form) {
      grid-area: nl;
        grid-column: 2 / span 5;
    }
    ::slotted(dribbble-shots) {
      grid-area: dw;
        grid-column: 2 / span 5;
    }
    ::slotted(video-talks) {
      grid-area: vd;
        grid-column: 2 / span 5;
    }
  ::slotted(  book-list) {
      grid-area: bk;
        grid-column: 2 / span 5;
    }
    ::slotted(podcast-list) {
      grid-area: pd;
        grid-column: 2 / span 5;
    }
    ::slotted(contact-form) {
      grid-area: ct;
        grid-column: 2 / span 5;
    }
    footer-content {
      grid-area: ft;
        grid-column: 2 / span 5;
    }
  }
`;

class Home extends LitElement {
  render() {
    return html`
      <shared-layout .stylesheet=${stylesheet}>
        <update-list></update-list>
        <hero-content></hero-content>
        <skills-list></skills-list>
        <client-list></client-list>
        <work-history></work-history>
        <newsletter-form></newsletter-form>
        <dribbble-shots></dribbble-shots>
        <video-talks></video-talks>
        <podcast-list></podcast-list>
        <!-- <book-list></book-list> -->
        <contact-form></contact-form>
      </shared-layout>
    `;
  }

  static get styles() {
    return [styles];
  }
}

customElements.define('home-page', Home);
