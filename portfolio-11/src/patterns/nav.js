import {LitElement,html, css} from 'lit';
import { logout, isAuthenticated } from "../auth";
import { navigate } from "lit-redux-router";
import {store} from '../redux/store';
import {connect} from 'pwa-helpers/connect-mixin.js';
import { userActions } from "../redux/actions";

import '../patterns/overflowNav'
import '../components/button'
import '../components/icon'

import styles from '../styles'

class Nav extends connect(store)(LitElement) {
  render() {
    const { user } = isAuthenticated();
    const redirectUser = () => {
      this._goTo("/");
    };
    let accountLocation;
    if (user && user.admin.role === 1) {
      accountLocation = "/admin/account";
    } else {
      accountLocation = "/user/account";
    }
    return html`
      <nav>
        <div>
          <h1 class="title-5"><a class=" nav-title-link" href="/">Darian Rosebrook</a></h1>
        </div>
        <!-- <div>
          <ul>
            <li><a href="/" style=${this._isActive(window, "/")}> Home </a></li>
          <li><a href="/products" style=${this._isActive(window, "/products")}>Products</a></li>
          <li><a href="/articles" style=${this._isActive(window, "/articles")}>Articles</a></li>
          <li><a href="/books" style=${this._isActive(window, "/books")}>Books</a></li>
          <li><a href="/cart">Cart ${this.cart && Object.keys(this.cart).length > 0
              ? html`(${Object.keys(this.cart).length})`
              : html``}</a></li>
          </ul>
        </div> -->
      </nav>
      <overflow-nav .open=${this.isOverflowNavOpen}></overflow-nav>
      <!--${isAuthenticated()
            ? html` <li><a
                href=${accountLocation}
                .style=${this._isActive(window, accountLocation)}
              >
                Account
              </a></li>`
            : html`<li><a
                href="/sign-in"
                .style=${this._isActive(window, "/sign-in")}
              >
                Sign in
              </a></li>`}
          ${!isAuthenticated()
            ? ""
            : html`<li><button
                @click=${() =>
                  store.dispatch(userActions.logout(() => redirectUser()))}
              >
                Logout
              </button></li>`}-->
    `
  }
  static get styles() {
    return [styles, css`
      nav {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      ul {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 0;
        margin: 0;
        list-style: none;
      }
      li {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 0;
      }
      li + li {
        margin-left: 1rem;
      }
      a.nav-title-link {
        color: var(--foreground);
      }
    `]
  }
  static get properties() {
    return {
      cart: { type: Object },
      isOverflowNavOpen: { type: Boolean }
    };
  }
  constructor() {
    super();
    this.cart = {};
  }
  stateChanged(state) {
    // this.cart = state.cart.items;
  }
  _handleClick(e, context) { 
  e.preventDefault();
   switch (context) {
      case "overflowNav":
        this.isOverflowNavOpen = !this.isOverflowNavOpen;
        console.log(this.isOverflowNavOpen);
        break;
      default:
        break;
   }        
  }
  _goTo(path) {
    store.dispatch(navigate(path));
  }
  _isActive = (history, path) => {
    if (history.location.pathname === path) {
      return "pointer-events: none; text-decoration: none; font-weight: 600; color: var(--foreground)";
    } else {
      return "";
    }
  };
}
customElements.define("nav-bar", Nav);