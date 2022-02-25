import {LitElement,html,css} from 'lit';
import "../components/icon"
import styles from '../styles'

class OverflowNav extends LitElement {
  render() {
    return html`
      <div class="overflow-nav ${this.open ? 'open' : ''}" >
        <div class="nav-strip">
          <div class="logo">
            Logo
          </div>
          <div class="right-actions">
            <a>Sign in</a>
            <a>Cart <fa-icon icon="cart">${"(count)"}</fa-icon></a>
            <button @click=${e => {this.open = !this.open} }><fa-icon icon="times">close</fa-icon></button>
          </div>
        </div>
        <div class="nav-body">
          <div class="updates">
            <div class="update">
              <h3>
                Community
              </h3>
              <p>Join us in the Compass of Design community and connect with other like-minded designers</p>
              <a>Join the group <fa-icon icon="arrow-right-long"></fa-icon></a>
            </div>
            <div class="update">
              <h3>
                Newsletter
              </h3>
              <p>Join the newsletter and get new resources from the design community every week</p>
              <a>Get the newsletter <fa-icon icon="arrow-right-long"></fa-icon></a>
             </div>
          </div>
          <div class="nav-grid">
            <div class="nav-group">
              <h4>Shop</h4>
              <ul>
                <li><a>Physical products</a></li>
                <li><a>Digital products</a></li>
                <li><a>Branding</a></li>
                <li><a>Design</a></li>
                <li><a>View all</a></li>

              </ul>
            </div>
            <div class="nav-group">
              <h4>Books</h4>
              <ul>
                <li><a>Book reviews</a></li>
                <li><a>Book lists</a></li>
                <li><a>View all</a></li>
              </ul>
            </div>
            <div class="nav-group">
              <h4>Discover</h4>
              <ul>
                <li><a>Articles</a></li>
                <li><a>Podcast</a></li>
                <li><a>Video content</a></li>
                <li><a>Design learning paths</a></li>
                <li><a>Events</a></li>
              </ul>
            </div>
            <div class="nav-group">
              <h4>Connect</h4>
              <ul>
                <li><a>About</a></li>
                <li><a>Advertise with us</a></li>
                <li><a>Meet our team</a></li>
                <li><a>Report a bug</a></li>
                <li><a>Frequently asked questions</a></li>
                <li><a>Contact us</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `
  }
  static get properties() {
    return {
      open: {
        type: Boolean,
      },
    }
  }
  constructor() {
    super();
  }
  static get styles() {
    return [styles, css`
        .overflow-nav{
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 100;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #fff;
        }
        .overflow-nav.open{
          display: block;
        }
        .nav-strip{
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
        }
        .right-actions{
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
        .nav-body {
          display: flex;
          flex-direction: column;
        }
        .updates {
          display: flex;
          gap: .5rem;
        }
        .update {
          max-width: 256px;
        }
        .nav-grid{
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(2, 1fr);
          grid-gap: 0.5rem;
        }
      `]
    }
}
customElements.define("overflow-nav", OverflowNav);