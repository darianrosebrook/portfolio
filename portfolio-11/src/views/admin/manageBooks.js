import { LitElement, html, css } from "lit";
import "../shared/layout";
import { isAuthenticated } from "../../auth";
import { bookService } from "../../redux/services";
import styles from "../../styles";
import "./orders";

import { store } from "../../redux/store.js";
import { connect } from "pwa-helpers";

class ManageBooks extends connect(store)(LitElement) {
  render() {
    return html`
      <shared-layout heading=${this.heading} description=${this.description}>
        <div>
          <h2>Use this to edit books</h2>
          <ul class='grid'>
            ${this.books
              ? this.books.map((item) => {
                  return html`
                  <li>
                    <div>
                      <div class="displaybox" style="background: url(${item.photo}); background-size: cover; background-position: center;" > 

                      </div>
                  <h5>${item.title}</h5>
                  <p>${item.description}</p>
                  <p>$${item.price.toFixed(2)}</p>
                  <p>${item.quantity} left</p>
                  </div>
                  <div>
                    <a href="/edit/book/${item.slug}">Update</a>
                    <button @click="${() => this.destroy(item.slug)}">Delete</button>
                  </div>
                  </li>`;
                })
              : ``}
          </ul>
            
        </div>
      </shared-layout>
    `;
  }
  
  static get properties() {
    return {
      heading: { type: String },
      description: { type: String },
      books: { type: Array },
    };
  }
  constructor() {
    super();
    this.heading = "Manage books";
    this.description = "let's get started.";
  }
  connectedCallback() {
    super.connectedCallback();

    this.loadBooks()
  }
  stateChanged(state) {
    this.user = state.authentication.account.user;
    this.token = state.authentication.account.token;
  }
  loadBooks = () => {
    bookService.getBooks().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        this.books = data;
      }
    });
  };
  destroy = (bookId) => {
    if (confirm("Are you sure you want to delete this book?")) {
    bookService
      .deleteProduct(bookId, this.user.publicDetails.userName, this.token)
      .then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          this.loadBooks();
        }
      });
    }
    return
  };
  static get styles() {
    return [
      styles,
      css`
      div {
        width: 100%;
      }
      div + div {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
      button {
        margin-left: 1rem;
      }
      li {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        transition: all 0.3s ease-in-out;
        margin-left: -1rem;
        margin-right: -1rem;
        border-radius: var(--border-radius);
      }
      li:hover {
        background: var(--hover-background);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        grid-gap: 4rem;
        list-style: none;
      }
      img {
        width: 100%;
      }
      .displaybox {
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: var(--border-radius);
        overflow: hidden;
      }
      @supports not (aspect-ratio: 16 / 9) { 
        .displaybox::before {
          float: left;
          padding-top: 56.25%;
          content: '';
        }
        
        .displaybox::after {  
          display: block;
          content: '';
          clear: both;
        }
      }
      `,
    ];
  }
}

customElements.define("manage-books", ManageBooks);
