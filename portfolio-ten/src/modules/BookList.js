import { LitElement, html } from 'lit-element';

// Actions

// Styles
import styles from '../styles/index.js';

// Components

// Redux
// class ___ extends connect(store)(LitElement) {

class BookList extends LitElement {
  render() {
    return html`<section class="books ">
      <article class="row">
        <div class="row-head">
          <h2>Writing</h2>
          <p>
            <a href="{{site.baseurl}}/writing"
              >See more
              <i class="fa fa-arrow-right icon"
                ><span>Click to see all Darian's writing</span></i
              ></a
            >
          </p>
        </div>
        <article class="">
          <div class="module callout">
            <img
              loading="lazy"
              src="/assets/img/books/by-design.png"
              alt="Done By Design, a book that dives into the world of the deliberately decided from a design perspective"
            />
            <div class="book-content">
              <h3>Invisible By Design</h3>
              <p>
                It probably swept right past you, and you never even noticed it.
                That’s the point. Excellent design is invisible.
              </p>
              <p>
                Invisible by Design celebrates the subtle choices that make
                great design pass right under our noses. It’s easy to create
                something great; it’s the sign of a master to make something
                great invisible.
              </p>

              compass-of-design-logo.svg
              <h4>&mdash;Compass of Design</h4>
            </div>
          </div>
          <div class="module grid">
            {% for post in site.categories.books reversed %}
            <div class="grid-item">
              <p><span>{{ forloop.index }}</span></p>
              <img
                loading="lazy"
                src="{{site.baseurl}}{{post.index_image}}"
                alt="{{post.title}}"
              />
              <p><small>Coming in {{post.release}}</small></p>
              <h4>{{post.title}}</h4>
            </div>
            {% endfor %}
            <div class="grid-item">
              <p><span>4</span></p>
              <img
                loading="lazy"
                src="/assets/img/books/tbd.png"
                alt="To Be Determined"
              />
              <p><small>TBD</small></p>
              <h4>TBD</h4>
            </div>
            <div class="grid-item">
              <p><span>5</span></p>
              <img
                loading="lazy"
                src="/assets/img/books/tbd.png"
                alt="To Be Determined"
              />
              <p><small>TBD</small></p>
              <h4>TBD</h4>
            </div>
            <div class="grid-item">
              <p><span>6 </span></p>
              <img
                loading="lazy"
                src="/assets/img/books/tbd.png"
                alt="To Be Determined"
              />
              <p><small>TBD</small></p>
              <h4>TBD</h4>
            </div>
          </div>
        </article>
      </article>
    </section> `;
  }

  static get styles() {
    return styles;
  }
}

customElements.define('book-list', BookList);
