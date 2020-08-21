import { LitElement, html, css } from 'lit-element';

// Actions

// Styles
import styles from '../styles/index.js';

const host = css`
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin: var(--margin) 0;
    grid-gap: var(--margin);
  }
  .module {
    padding: var(--design-unit);
  }
  .module ~ .module {
    padding-left: 2rem;
    border-left: 1px solid var(--divider-color);
  }
  small {
    padding: var(--design-unit);
    background: var(--neutral-layer-l2);
    width: fit-content;
  }
  h2 {
    font-size: var(--ramp-t7);
  }
`;
// Components

// Redux
// class ___ extends connect(store)(LitElement) {

class Podcast extends LitElement {
  render() {
    return html`<section class="podcast">
      <article class="row">
        <div class="row-header">
          <h2>Hosted Podcasts</h2>
        </div>
        <div class="grid ">
          <div class="module">
            <div class=" grid">
              <img
                loading="lazy"
                src="/assets/img/podcast/compassofdesign.jpg"
                class="f-l"
                alt="Compass of Design"
              />
              <div class="module">
                <h6><small class="c1-upper">Design</small></h6>
                <h3 class="emph">Compass of Design Podcast</h3>
                <h5>Host</h5>
                <p class="p1">Darian Rosebrook</p>
              </div>
            </div>
            <article class="row">
              <iframe
                title="The episodes for the Compass of Design podcast"
                src="https://share.transistor.fm/e/bite-sized-design/latest"
                width="100%"
                height="180"
                frameborder="0"
                scrolling="no"
                seamless="true"
                style="width:100%; height:180px;"
              ></iframe>
            </article>
          </div>
          <div class="module">
            <div class=" grid">
              <img
                loading="lazy"
                src="assets/img/podcast/responsibly-irresponsible.png"
                class="f-l"
                alt="Responsibly Irresponsible"
              />
              <div class="module">
                <h6><small class="c1-upper">Life, Adulting</small></h6>
                <h3 class="emph">Responsibly Irresponsible</h3>
                <h5>Co-Host</h5>
                <p class="p1">Evan, Marisa, Darian, and Sara</p>
              </div>
            </div>
            <article class="row">
              <p>Episodes Launching Soon</p>
              <!-- <iframe title="The episodes for the Responsibly Irresponsible podcast" src='https://share.transistor.fm/e/responsiblyirresponsible/latest' width='100%' height='180' frameborder='0' scrolling='no' seamless='true' style='width:100%; height:180px;'></iframe> -->
            </article>
          </div>
        </div>
      </article>
    </section>`;
  }

  static get styles() {
    return [styles, host];
  }
}

customElements.define('podcast-list', Podcast);
