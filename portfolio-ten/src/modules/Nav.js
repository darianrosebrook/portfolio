import { LitElement, html, css } from 'lit-element';
import moment from 'moment/src/moment';

import '../components/Icon.js';
import '../components/Avatar.js';

import { darianLogo } from '../../assets/img/logo/logo.js';

import styles from '../styles/index.js';

class NavBar extends LitElement {
  render() {
    return html`<header>
      <article class="head-content">
        <p class="darian">${darianLogo}</p>
        <p>
          <fa-icon
            icon="briefcase"
            weight="r"
            ariaLabel="Occupation:"
          ></fa-icon>
          Product Designer
        </p>
        <p>
          <fa-icon icon="globe" weight="r" ariaLabel="Location:"></fa-icon>
          Seattle, Wa
        </p>
        <h4 alt="Darian Rosebrook" class="emph">
          <a href="/">Darian Rosebrook</a>
        </h4>
        <p>
          <fa-icon icon="clock" weight="r" ariaLabel="Age:"></fa-icon> ${this
            .age}yo
        </p>
        <p>
          <fa-icon icon="user" weight="r" ariaLabel="Pronouns:"></fa-icon>
          He/Him
        </p>

        <p class="darian">
          <button class="stealth">
            <avatar-image
              source="/assets/img/darian-rosebrook-avatar.jpg"
              altHeading="Darian Rosebrook's avatar"
            ></avatar-image>
          </button>
        </p>
      </article>
      <nav class="nav">
        <ul>
          <li style=${this._isActive(window, '/')}><a href="/">Home</a></li>
          <li><a href="/work">Design Work</a></li>
          <li><a href="/writing">Writing</a></li>
          <li><a href="/talks">Speaking</a></li>
          <li><a href="/about">About Me</a></li>
          <li><a href="/now">Updates</a></li>
          <li><a href="#contact" class="scrollBtn ">How to Contact</a></li>
        </ul>
      </nav>
    </header> `;
  }

  static get properties() {
    return {
      age: { type: Number },
    };
  }

  constructor() {
    super();
    this.age = moment().diff('1992-07-14', 'years', false);
  }

  static get styles() {
    return [
      styles,
      css`
        header {
          display: flex;
          flex-direction: column;
          padding-top: 2rem;
          border-bottom: 2px solid var(--cr-grey-60);
          margin-bottom: var(--margin);
        }
        .head-content {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-areas: 'a b b c' 'd e f g';
        }
        p.darian {
          margin: auto;
        }
        p:nth-of-type(1) {
          grid-area: a;
        }
        p:nth-of-type(2) {
          grid-area: d;
        }
        p:nth-of-type(3) {
          grid-area: e;
        }
        p:nth-of-type(4) {
          grid-area: f;
        }
        p:nth-of-type(5) {
          grid-area: g;
        }
        p:nth-of-type(6) {
          grid-area: c;
        }
        h4 {
          grid-area: b;
        }
        nav {
          padding: 2rem 0;
        }
        .nav a {
          color: var(--cr-grey-60);
          font-size: var(--ramp-t5);
        }
        @media (min-width: 1000px) {
          header .head-content {
            grid-template-areas: unset;
            grid-template-columns: repeat(7, 1fr);
            flex-direction: row;
            justify-items: center;
            text-align: center;
            align-items: center;
            border-bottom: 1px solid var(--cr-grey-20);
          }
          nav,
          ul {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          p:nth-of-type(1n) {
            grid-area: unset;
          }
          h4 {
            grid-area: unset;
          }
          nav {
            width: 60%;
            margin: 0 auto;
            justify-content: space-between;
          }

          ul {
            justify-content: space-between;
          }
          li {
            width: auto;
          }
        }
      `,
    ];
  }

  _isActive = (history, path) => {
    if (history.location.pathname === path) {
      return 'display: none';
    }
    return '';
  };
}

customElements.define('nav-bar', NavBar);
