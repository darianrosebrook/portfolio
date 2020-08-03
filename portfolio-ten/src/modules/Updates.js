import { LitElement, html } from 'lit-element';

// Actions

// Styles
import styles from '../styles/index.js';

// Components

// Redux
// class ___ extends connect(store)(LitElement) {

class Updates extends LitElement {
  render() {
    return html`<section class="container updates" id="updates">
      <article class="row">
        <div class="row-head">
          <h2>Updates</h2>
          <p>
            <a href="{{site.baseurl}}/now"
              >See more
              <i class="fa fa-arrow-right icon"
                ><span>Click to see all updates</span></i
              ></a
            >
          </p>
        </div>

        <div class="grid">
          <div class="grid-item">
            <a
              class="block-link"
              href="{{site.baseurl}}/now/#compass-community-site"
            >
              <div class="linked-block">
                <p><i class="far fa-drafting-compass"></i></p>
                <p>
                  <small><strong>12 Nov 2017 - Present</strong></small>
                </p>
                <h4>Building the Compass of Design Community app</h4>
              </div>
            </a>
          </div>
          {% for post in site.categories.updates limit:4 %}
          <div class="grid-item">
            {% if page.url == '/' %}<a
              class="block-link"
              href="{{site.baseurl}}/now/#{{post.specific}}"
            >
              {% endif %}
              <div class="linked-block">
                <p><i class="far fa-{{post.icon}}"></i></p>
                <p>
                  <small
                    ><strong>{{post.date | date_to_string }}</strong></small
                  >
                </p>
                <h4>{{post.title}}</h4>

                {% if page.url contains '/now' %}
                <p>{{post.content}}</p>
                {% endif %}
              </div>
              {% if page.url == '/' %}</a
            >{% endif %}
          </div>
          {% endfor %}
        </div>
      </article>
    </section> `;
  }

  static get styles() {
    return styles;
  }
}

customElements.define('update-list', Updates);
