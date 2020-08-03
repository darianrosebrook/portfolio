import { LitElement, html } from 'lit-element';

class FontAwesomeIcon extends LitElement {
  static get properties() {
    return {
      icon: { type: String },
      weight: { type: String },
      ariaLabel: { type: String },
    };
  }

  constructor() {
    super();
    this.icon = 'skull-crossbones';
    this.weight = 'r';
    this.ariaLabel = '';
  }

  render() {
    return html`
      <link
        rel="stylesheet"
        href="https://pro.fontawesome.com/releases/v5.13.0/css/all.css"
        integrity="sha384-IIED/eyOkM6ihtOiQsX2zizxFBphgnv1zbe1bKA+njdFzkr6cDNy16jfIKWu4FNH"
        crossorigin="anonymous"
      />
      <style>
        div {
          display: inline-block;
          margin: 0 var(--design-unit);
        }
        span {
          display: none;
        }
      </style>
      <div>
        <i class="fa${this.weight} fa-${this.icon}"
          ><span>${this.ariaLabel}</span></i
        >
      </div>
    `;
  }
}

customElements.define('fa-icon', FontAwesomeIcon);
