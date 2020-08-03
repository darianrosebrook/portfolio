import { LitElement, html } from 'lit-element';

// Actions

// Styles
import styles from '../styles/index.js';

// Components

// Redux
// class ___ extends connect(store)(LitElement) {

class Contact extends LitElement {
  render() {
    return html`<section id="contact" class="contact">
      <div class="row">
        <h2>Let's Get in Contact</h2>
        <h6>* All Fields Required</h6>
        <form action="https://formspree.io/mnnjazpm" method="POST">
          <input
            type="checkbox"
            class="hidden"
            data-continue="false"
            id="checkbox-hello"
            name="checkbox-hello"
            value=""
          />
          <input
            type="checkbox"
            class="hidden"
            data-continue="false"
            id="checkbox-else"
            name="checkbox-else"
            value=""
          /><br />
          <div class="container label-container">
            <label class="transition module " for="checkbox-hello">
              <img
                loading="lazy"
                src="{{site.baseurl}}/assets/img/icon-smile.svg"
                alt=""
              />
              <br />
              <p>Say hello and have a conversation</p>
            </label>
            <label class="transition module " for="checkbox-else">
              <img
                loading="lazy"
                src="{{site.baseurl}}/assets/img/icon-else.svg"
                alt=""
              />
              <br />
              <p>
                Something else: Collaboration, Conference, Run a Workshop, Etc
              </p>
            </label>
          </div>
          <label for="name">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Your Name..."
            class="transition enter text-center"
            required
          />
          <label for="_replyto">Email</label>
          <input
            type="email"
            name="_replyto"
            id="_replyto"
            placeholder="Your Email..."
            class="transition enter text-center"
            required
          />
          <label for="additional-info">Message</label>
          <textarea
            name="additional-info"
            id="additional-info"
            placeholder="Your Message..."
            class="transition enter text-center "
          ></textarea>
          <h4 class="message enter">
            <span class="hidden project"
              >Tell me more about what you're looking to get out of personal
              coaching?</span
            ><span class="hidden message">How can I help? :D</span>
          </h4>
          <input type="submit" class="button tertiary" value="Submit!" />

          <input type="text" name="_gotcha" class="hidden" />
          <p class=" project">
            Thank you! <br /><br />I'll review the responses here and respond to
            you as soon as I can. Thanks!
          </p>
          <input
            type="hidden"
            name="_next"
            value="https://darianrosebrook.com/continue"
          />
        </form>
      </div>
    </section>`;
  }

  static get styles() {
    return styles;
  }
}

customElements.define('contact-form', Contact);
