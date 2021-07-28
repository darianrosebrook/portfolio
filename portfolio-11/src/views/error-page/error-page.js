import { LitElement, html, css } from "lit";
import "../shared/layout";

class ErrorPage extends LitElement {
  render() {
    return html`
      <shared-layout heading=${'Darian'} description=${'blah'}>
        <h4>404</h4>
        <h1>It looks live you&rsquo;ve found a page that doesn&rsquo;t exist yet.</h1>
        <p>
          If this page keeps appearing while you're trying to perform a certain action, please contact us at <a class="button" mailto:user@domain@@com"="" onmouseover="this.href=this.href.replace('@@','.')" href="mailto:hello@darianrosebrook@@com?subject=%F0%9F%91%8B%F0%9F%8F%BC%20Hey%2C%20let's%20work%20together!&amp;body=Hey!%20I%20saw%20your%20portfolio%20online%20and%20I%20was%20wondering%20%5Bwhat%20the%20average%20size%20of%20a%20black%20hole%20is%20in%20the%20universe%5D">Get in touch</a>
        <p>
          <a href=${'/'}>Back to the homepage</a>
        </p>
      </shared-layout>
    `;
  }
}

customElements.define("error-page", ErrorPage);
