import { LitElement, html, css } from 'lit-element';

import '../../components/Icon.js';

import '../../components/Avatar.js';
import styles from '../../styles/index.js';

const host = css`
  .container {
    display: flex;
    width: 100%;
    flex-direction: column;
    justify-content: space-between;
  }
  @media (min-width: 1000px) {
    .container {
      width: 45%;
      margin: 5em auto;
      text-align: center;
      color: orange !important;
    }
    ul {
      width: 100%;
      margin-top: 2em;
    }
    li + li {
      margin: 2em 0 0 0;
      width: 100%;
      background-color: var(cr-grey-10);
    }
  }
`;
class Links extends LitElement {
  render() {
    return html` <div class="container">
      <avatar-image
        source="/assets/img/darian-rosebrook-avatar.jpg"
        altHeading="Darian Rosebrook's avatar"
      ></avatar-image>
      <ul>
        <li>
          <a href="/" rel="nofollow"> <fa-icon icon="house"></fa-icon> Home </a>
        </li>
        <li>
          <a href="https://darian.is/a-designer" rel="nofollow">
            <fa-icon icon="briefcase"></fa-icon> Design portfolio
          </a>
        </li>
        <li>
          <a href="https://dribbble.com/darianrosebrook" rel="nofollow">
            <fa-icon icon="dribbble" weight="b"></fa-icon> Dribbble
          </a>
        </li>
        <li>
          <a href="https://twitter.com/darianrosebrook" rel="nofollow">
            <fa-icon icon="twitter" weight="b"></fa-icon> Twitter
          </a>
        </li>
        <li>
          <a href="https://instagram.com/darianrosebrook" rel="nofollow">
            <fa-icon icon="instagram" weight="b"></fa-icon> Instagram
          </a>
        </li>
        <li>
          <a href="https://medium.com/darianrosebrook" rel="nofollow">
            <fa-icon icon="medium" weight="b"></fa-icon> Medium
          </a>
        </li>
        <li>
          <a href="https://youtube.com/compassofdesign" rel="nofollow">
            <fa-icon icon="youtube" weight="b"></fa-icon> YouTube
          </a>
        </li>
      </ul>
    </div>`;
  }

  static get styles() {
    return [styles, host];
  }
}

customElements.define('links-page', Links);
