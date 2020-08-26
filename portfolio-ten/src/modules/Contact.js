import { LitElement, html, css } from 'lit-element';

// Actions

// Styles
import styles from '../styles/index.js';
// Components
import '../components/VisualCheckbox.js';

const host = css`
  form {
    margin: 0 auto;
  }
  .checkbox-container {
    margin-bottom: 3rem;
  }
  visual-checkbox {
    height: 100%;
  }
  input,
  textarea {
    margin-bottom: 2rem;
  }
  label {
    margin-bottom: 2rem;
  }
  .hidden {
    display: none;
  }
  @media (min-width: 1000px) {
    form {
      width: 50%;
    }
    .checkbox-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: var(--design-unit);
      margin-bottom: 5rem;
    }
  }
`;
// Redux
// class ___ extends connect(store)(LitElement) {

class Contact extends LitElement {
  render() {
    return html`<section id="contact" class="contact">
      <div class="row">
        <h2>Let's Get in Contact</h2>
        <h6>* All Fields Required</h6>
        <form action="https://formspree.io/mnnjazpm" method="POST">
          <div class="checkbox-container">
            <visual-checkbox
              contents="Say hello and have a conversation"
              icon="comments-alt"
              inputName="conversation"
            ></visual-checkbox>
            <visual-checkbox
              contents="Something else: Collaboration, Conference, Run a Workshop, Etc"
              icon="question-circle"
              inputName="conversation"
            ></visual-checkbox>
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

          <input type="text" name="_gotcha" class="hidden" />
          <input
            type="hidden"
            name="_next"
            value="https://darianrosebrook.com/continue"
          />
          <input type="submit" class="button tertiary" value="Submit!" />
          <p class=" project">
            Thank you! <br /><br />I'll review the responses here and respond to
            you as soon as I can. Thanks!
          </p>
        </form>
      </div>
    </section>`;
  }

  static get styles() {
    return [styles, host];
  }
}

customElements.define('contact-form', Contact);
