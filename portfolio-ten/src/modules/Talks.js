import { LitElement, html } from 'lit-element';

// Actions

// Styles
import styles from '../styles/index.js';

// Components

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
              {% assign i = 0 %} {% for post in site.categories.talk limit: 5 %}
              {% assign i = i | plus:1 %} {% assign class = '' %} {% if i == 1
              %} {% assign class = 'featured-video' %} {% else %} {% assign
              class = i %} {% endif %}
              <article class="grid-item ">
                <a href="{{post.url }}" rel="noreferrer"
                  ><img src="" alt="" loading="lazy" />
                  <h6>{{post.date | date: "%b %d, %y" }}</h6>
                  <h3>{{post.title}}</h3>
                  <p><small>{{post.description | truncate: 75 }}</small></p> </a
                >{% else %}
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
                    title=""
                    width="560"
                    height="315"
                    src="https://www.youtube.com/embed/post.video_id"
                    frameborder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </div>
                <h6>{{post.date | date: "%b %d, %y" }}</h6>
                <h3>{{post.title}}</h3>
                <p><small>{{post.description | truncate: 200 }}</small></p>
                <p>
                  <a href="posturl"
                    >See more
                    <i class="fa fa-arrow-right icon"
                      ><span>Click to see more</span></i
                    ></a
                  >
                </p>
                {% endif %}
              </article>
              {% endfor %}
            </div>
          </div>
        </article>
      </section>
    `;
  }

  static get styles() {
    return styles;
  }
}

customElements.define('video-talks', Talks);
