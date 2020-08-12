import { LitElement, html } from 'lit-element';

class FontAwesomeIcon extends LitElement {
  static get properties() {
    return {
      icon: { type: String },
      weight: { type: String },
      ariaLabel: { type: String },
      iconSize: { type: String },
    };
  }

  constructor() {
    super();
    this.icon = 'skull-crossbones';
    this.weight = 'r';
    this.ariaLabel = '';
    this.size = '';
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
        i {
          display: inline-block;
          margin: 0 var(--design-unit);
          font-size: ${this._iconSize()};
        }
        span {
          display: none;
        }
      </style>
      <i class="fa${this.weight} fa-${this.icon}" aria-label="${this.ariaLabel}"
        ><span>${this.ariaLabel}</span></i
      >
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.icon === null || this.icon === undefined || this.icon === '') {
      this.icon = 'skull-crossbones';
    }
  }

  _iconSize = () => {
    let size = '';
    switch (this.iconSize) {
      case 'mini':
        size = '16px';
        break;
      case 'small':
        size = '20px';
        break;
      case 'medium':
        size = '36px';
        break;
      case 'large':
        size = '48px';
        break;
      case 'jumbo':
        size = '64px';
        break;
      default:
        size = '16px';
        break;
    }
    return size;
  };
}

customElements.define('fa-icon', FontAwesomeIcon);
