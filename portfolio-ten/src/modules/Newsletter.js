import { LitElement, html, css } from 'lit-element';

// Actions

// Styles
import styles from '../styles/index.js';

// Components
import '../components/Icon.js';

const host = css`
  section {
    margin: var(--margin) 0;
  }
  .module {
    display: grid;
    grid-template-columns: 1fr 9fr 10fr;
    gap: var(--margin);
    align-items: center;
  }
  .callout {
    padding: calc(var(--margin) * 2);
    background: var(--cr-blue-10);
    border-radius: var(--design-unit);
  }
  fa-icon {
    align-self: start;
  }
  @media (prefers-color-scheme: dark) {
    .callout {
      background: var(--cr-blue-100);
    }
  }
`;
// Redux
// class ___ extends connect(store)(LitElement) {

class Newsletter extends LitElement {
  render() {
    return html` <section class="container callout newsletter">
      <article class="row">
        <div class="module">
          <fa-icon
            weight="r"
            iconSize="medium"
            icon="newspaper"
            ariaLabel="Newsletter"
          ></fa-icon>
          <div class="content">
            <h4 class="emph">Itching to get better at design strategy?</h4>
            <p>
              Every Thursday, I send out a new article to my newsletter group
              about things that I’m learning with the design strategy. Since I
              come from both a user experience background and a brand identity
              consultancy background, the topics can vary, but that all helps us
              better understand Design as a whole and its impact on business and
              society.
            </p>

            <p>
              Join me each week with a weekly resource-packed newsletter just
              for you. Feel free to say hi at any point too (:
            </p>
          </div>
          <div class="form-group">
            <script src="https://cdn.convertkit.com/assets/CKJS4.js?v=21"></script>
            <div class="ck_form_container ck_inline" data-ck-version="7">
              <div class="ck_form ck_naked">
                <div class="ck_form_fields">
                  <div id="ck_success_msg" style="display:none;">
                    <p>
                      Success! Now check your email to confirm your
                      subscription.
                    </p>
                  </div>

                  <!--  Form starts here  -->
                  <form
                    id="ck_subscribe_form"
                    class="ck_subscribe_form"
                    action="https://app.convertkit.com/landing_pages/317649/subscribe"
                    data-remote="true"
                  >
                    <input type="hidden" value="" id="ck_form_options" />
                    <input
                      type="hidden"
                      name="id"
                      value="317649"
                      id="landing_page_id"
                    />
                    <input
                      type="hidden"
                      name="ck_form_recaptcha"
                      value=""
                      id="ck_form_recaptcha"
                    />
                    <div class="ck_errorArea">
                      <div id="ck_error_msg" style="display:none">
                        <p>
                          There was an error submitting your subscription.
                          Please try again.
                        </p>
                      </div>
                    </div>
                    <div
                      class="ck_control_group ck_captcha2_h_field_group ck-captcha2-h"
                      style="position: absolute !important;left: -999em !important;"
                    >
                      <label for="ck_captcha2_h">Robot Detector </label>
                      <input
                        type="text"
                        name="captcha2_h"
                        class="ck-captcha2-h"
                        id="ck_captcha2_h"
                        placeholder="We use this field to detect spam bots. If you fill this in, you will be marked as a spammer."
                      />
                    </div>

                    <div class="form-controls">
                      <div class="field">
                        <label class="" for="ck_firstNameField"
                          >First Name</label
                        >
                        <input
                          type="text"
                          name="first_name"
                          class="ck_first_name"
                          id="ck_firstNameField"
                          placeholder="First Name"
                        />
                      </div>
                      <div class="field">
                        <label class="ck_label" for="ck_emailField"
                          >Email Address</label
                        >
                        <div class="input-connect">
                          <input
                            type="email"
                            name="email"
                            class="ck_email_address"
                            id="ck_emailField"
                            placeholder="Email Address"
                            required
                          />
                          <button
                            class="subscribe_button ck_subscribe_button btn fields"
                            id="ck_subscribe_button"
                            aria-label="Subscribe button"
                          >
                            <i class="fa fa-paper-plane"
                              ><span>Subscribe</span></i
                            >
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>`;
  }

  static get styles() {
    return [styles, host];
  }
}

customElements.define('newsletter-form', Newsletter);
