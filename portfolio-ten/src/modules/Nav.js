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
          <small>
            <fa-icon
              icon="briefcase"
              weight="r"
              ariaLabel="Occupation:"
            ></fa-icon>
            Product Designer</small
          >
        </p>
        <p>
          <small>
            <fa-icon icon="globe" weight="r" ariaLabel="Location:"></fa-icon>
            Seattle, Wa
          </small>
        </p>
        <h4 alt="Darian Rosebrook" class="sitename">
          <a href="/">Darian Rosebrook</a>
        </h4>
        <p>
          <small>
            <fa-icon icon="clock" weight="r" ariaLabel="Age:"></fa-icon> ${this
              .age}yo</small
          >
        </p>
        <p>
          <small>
            <fa-icon icon="user" weight="r" ariaLabel="Pronouns:"></fa-icon>
            He/Him</small
          >
        </p>

        <p class="darian">
          <button>
            <avatar-image
              source="/assets/img/darian-rosebrook-avatar.jpg"
              altHeading="Darian Rosebrook's avatar"
            ></avatar-image>
          </button>
        </p>
      </article>
      <nav class="nav">
        <ul>
          <li><a href="/">Home</a></li>
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
        }
        .head-content,
        nav,
        ul {
          width: 100%;
          display: flex;
          flex-direction: row;
          align-items: center;
        }
      `,
    ];
  }
}

customElements.define('nav-bar', NavBar);
