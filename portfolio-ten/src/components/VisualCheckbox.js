import { LitElement, html, css } from 'lit-element';
// Components
import './Icon.js';

// Actions

// Styles
const host = css`
  .hidden {
    display: none;
  }
  label {
    display: block;
    height: 100%;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--foreground);
    border-radius: var(--design-unit);
    transition: var(--transition);
  }
  input:checked ~ label {
    background: var(--divider-color);
  }
`;
// Redux
// class ___ extends connect(store)(LitElement) {

class VisualCheckbox extends LitElement {
  render() {
    return html`
      <input
        type="checkbox"
        class="hidden"
        id="checkbox-${this.inputName}"
        name="checkbox-${this.inputName}"
      />
      <label class="transition module " for="checkbox-${this.inputName}">
        <fa-icon
          iconSize="jumbo"
          ariaLabel="${this.contents}"
          icon=${this.icon}
        >
        </fa-icon>
        <p>${this.contents}</p>
      </label>
    `;
  }

  static get properties() {
    return {
      inputName: { type: String },
      contents: { type: String },
      icon: { type: String },
    };
  }

  static get styles() {
    return [host];
  }
}

customElements.define('visual-checkbox', VisualCheckbox);
