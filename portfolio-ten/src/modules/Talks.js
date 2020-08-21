import { LitElement, html, css } from 'lit-element';

// Actions
import { talks } from '../constants/index.js';

// Styles
import styles from '../styles/index.js';
// Components
import '../components/YouTubePlayer.js';
import '../components/VideoLink.js';

const host = css`
  section {
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--divider-color);
  }
  h2 {
    font-size: var(--ramp-t7);
  }
  .grid {
    display: grid;
    width: 100%;
    gap: var(--design-unit);
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 'fv fv' 'v2 v3' 'v4 v5';
  }
  video-link {
    border-right: 1px solid var(--divider-color);
  }
  video-link:nth-of-type(1n + 3) {
    border-right: none;
  }
  img {
    width: 100%;
  }
  .featured-video {
    grid-area: fv;
    padding: 0 var(--margin);
    border-right: 1px solid var(--divider-color);
  }
  .v2 {
    grid-area: v2;
  }
  .v3 {
    grid-area: v3;
  }
  .v4 {
    grid-area: v4;
  }
  .v5 {
    grid-area: v5;
  }
  @media (min-width: 1000px) {
    .grid {
      grid-template-columns: repeat(5, 1fr);
      grid-template-areas: 'v2 fv fv fv v4' 'v3 fv fv fv v5';
    }
  }
`;
// Redux
// class ___ extends connect(store)(LitElement) {

class Talks extends LitElement {
  render() {
    return html`
      <section class="video">
        <article class="row">
          <div class="row-head">
            <h2>Recent Talks</h2>
            <p>
              <a href="/talks"
                >See more
                <i class="fa fa-arrow-right icon"
                  ><span>Click to see all talks</span></i
                ></a
              >
            </p>
          </div>
          <div class="module">
            <div class="grid">
              ${Object.keys(talks)
                .slice(0, 5)
                .reverse()
                .map((item, i) => {
                  return i > 0
                    ? html`
                        <video-link
                          class="v${i + 1} grid-item"
                          videoId="${talks[item].videoId}"
                          date="${talks[item].date}"
                          title="${talks[item].title}"
                          description="${talks[item].description}"
                        ></video-link>
                      `
                    : html`<div class="featured-video">
                        <style>
                          .embed-container {
                            position: relative;
                            padding-bottom: 56.25%;
                            height: 0;
                            overflow: hidden;
                            max-width: 100%;
                          }

                          .embed-container iframe,
                          .embed-container object,
                          .embed-container embed {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                          }
                        </style>

                        <div class="embed-container">
                          <iframe
                            title="${talks[item].title}"
                            width="560"
                            height="315"
                            src="https://www.youtube.com/embed/${talks[item]
                              .videoId}"
                            frameborder="0"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                          ></iframe>
                        </div>
                        <h6>${talks[item].date}</h6>
                        <h3>${talks[item].title}</h3>
                        <p><small>${talks[item].description}</small></p>
                        <p>
                          <a href="posturl"
                            >See more
                            <i class="fa fa-arrow-right icon"
                              ><span>Click to see more</span></i
                            ></a
                          >
                        </p>
                      </div>`;
                })}
            </div>
          </div>
        </article>
      </section>
    `;
  }

  static get styles() {
    return [styles, host];
  }
}

customElements.define('video-talks', Talks);
