import { LitElement, html } from 'lit-element';
import moment from 'moment/src/moment';

// Actions

// Styles
import styles from '../styles/index.js';

// Components
import '../components/Icon.js';

// Redux
// class ___ extends connect(store)(LitElement) {

class Footer extends LitElement {
  render() {
    return html` <footer class="container footer">
      <div class="row">
        <p></p>
        <h4>You can find me here too:</h4>
        <p>
          <a
            href="http://twitter.com/darianrosebrook"
            class="social-link"
            rel="noreferrer"
            target="_blank"
            aria-label="Link to Twitter"
            ><fa-icon
              weight="b"
              icon="twitter"
              ariaLabel="Link to twitter"
            ></fa-icon
          ></a>
          <a
            href="http://linkedin.com/in/darianrosebrook"
            class="social-link"
            rel="noreferrer"
            target="_blank"
            aria-label="Link to LinkedIn"
            ><fa-icon
              weight="b"
              icon="linkedin"
              ariaLabel="Link to linkedin"
            ></fa-icon
          ></a>
          <a
            href="http://dribbble.com/darianrosebrook"
            class="social-link"
            rel="noreferrer"
            target="_blank"
            aria-label="Link to Dribbble"
            ><fa-icon
              weight="b"
              icon="dribbble"
              ariaLabel="Link to Dribbble"
            ></fa-icon
          ></a>
        </p>
        <p>
          <small
            >Copyright &copy; 2015 &mdash; ${moment().year()} Darian Rosebrook
            All Rights Reserved.</small
          >
        </p>
        <p>
          <small
            >This site is built and managed by
            <a href="https://twitter.com/darianrosebrook"
              >Darian Rosebrook</a
            ></small
          >
        </p>
      </div>
    </footer>`;
  }

  static get styles() {
    return styles;
  }
}

customElements.define('footer-content', Footer);
