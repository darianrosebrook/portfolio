import { LitElement, html, css } from 'lit-element';
import moment from 'moment/src/moment';

// Actions

// Styles
import styles from '../styles/index.js';

const host = css`
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    margin: var(--margin) 0;
    grid-gap: var(--design-unit);
  }
  h2 {
    font-size: var(--ramp-t7);
  }
`;

// Components

// Redux
// class ___ extends connect(store)(LitElement) {

class Dribbble extends LitElement {
  render() {
    return html`<section class="design-work" id="work">
      <article class="row">
        <h2>Work</h2>
        <div class="grid" id="shots">
          ${Object.keys(this.shots)
            .slice(0, 10)
            .map(item => {
              return html`<div class="grid-item">
                <a
                  href="${this.shots[item].html_url}"
                  target="_blank"
                  class="block-link"
                >
                  <p>
                    <img
                      src="${this.shots[item].images.normal}"
                      alt=${this.shots[item].title}
                    />
                  </p>
                  <small class="c1-upper"
                    >${moment(this.shots[item].published_at).format(
                      'DD MMM YYYY'
                    )}</small
                  >
                  <h5>${this.shots[item].title}</h5>
                </a>
              </div>`;
            })}
        </div>
      </article>
    </section> `;
  }

  constructor() {
    super();

    this._loadShots().then(data => {
      if (data.error) {
        this.error = data.error;
      } else {
        this.shots = data;
      }
    });
  }

  static get properties() {
    return { shots: { type: Object } };
  }

  static get styles() {
    return [styles, host];
  }

  _loadShots = () => {
    const accessToken =
      '12cf5726b061b5e521a31389b6aea25a51f977b46537c693ca5fb8231d21fb3f';

    return fetch(
      `https://api.dribbble.com/v2/user/shots?access_token=${accessToken}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    )
      .then(res => {
        return res.json();
      })
      .catch(err => {
        this.error = err;
        return err;
      });
  };
}

customElements.define('dribbble-shots', Dribbble);
