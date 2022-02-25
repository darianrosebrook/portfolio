import { LitElement, html, css } from 'lit';
import { createPopper } from '@popperjs/core';
import styles from '../styles';

const POPOVER_OFFSET_skidding = 0,
  POPOVER_OFFSET_distance = 18;

class Popover {
  constructor(anchor, popover, placement) {
    this.anchor = anchor;
    this.popover = popover;
    this.options = {
      placement,
      visibleClass: 'data-show',
    };
    this.popover.classList.remove(this.options.visibleClass);
  }

  show() {
    if (this.popper) {
      this.popper.destroy();
    }

    this.popper = createPopper(this.anchor, this.popover, {
      tooltip: this.anchor,
      placement: this.options.placement,
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [POPOVER_OFFSET_skidding, POPOVER_OFFSET_distance],
          },
        },
        {
          name: 'preventOverflow',
          options: {
            rootBoundary: 'document',
            padding: 16,
          },
        },
      ],
    });
  }

  triggerUpdate() {
    this.popper.update();
  }

  hide() {
    this.popover.classList.remove(this.options.visibleClass);
  }
}

class Tooltip extends LitElement {
  static get properties() {
    return {
      alertType: { type: String },
      details: { type: String },
      link: { type: String },
      placement: { type: String },
      for: { type: String },
      dismissable: { type: Boolean },
    };
  }
  static get styles() {
    return [
      styles,
      css`
      :host {display:inline-block;position: relative; width: auto;}
      .popover {
        display: none;
        transition: all 0.3s ease-in-out;
        background-color: var(--foreground);
        color: var(--background);
      }
      .arrow:before {
        background-color: var(--foreground);
        color: var(--background);
      }
  .warning.popover {
    color: var(--warning-foreground);
    background-color: var(--warning-background);
  }
  .danger.popover {
    color: var(--danger-foreground);
    background-color: var(--danger-background);
  }
  .success.popover {
    color: var(--success-foreground);
    background-color: var(--success-background);
  }
  .warning .arrow:before {
    color: var(--warning-foreground);
    background-color: var(--warning-background);
  }
  .danger .arrow:before {
    color: var(--danger-foreground);
    background-color: var(--danger-background);
  }
  .success .arrow:before {
    color: var(--success-foreground);
    background-color: var(--success-background);
  }
      :host([data-show]) .popover {
        width: 20rem;
        transition: fadeIn 0.3s;
        padding: var(--margin);
        display: inline-block;
        z-index: 4;
        border-radius: var(--design-unit);
      }
      p {
        margin: 0;
        height: auto;
        font-size: var(--ramp-t8);
        line-height: 1em;
      }
      .arrow {
        position: relative;
        margin-top: -6px;
      }
      .arrow:before {
        position: absolute;
        width: var(--du-3);
        height: var(--du-3);
        content: '';
        left: calc(-6px - var(--margin));
        top: calc(50% + 6px);
        transform: translateY(-50%) rotate(45deg);
        border-radius: 0 0 0 2px;
      `,
    ];
  }
  constructor() {
    super();
    this.privateDefaults();
    this.placement = 'right';
    this.addEventListener('touchstart', () => {
      this.toggle();
      this.setAttribute('isTouch', true);
    });
  }

  privateDefaults() {
    this.isPopoverVisible = false;
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.documentClickHandler);
  }
  firstUpdated() {
    this.trigger = document.querySelector(`#${this.for}`);
    // allow placement in shadow roots
    if (this.trigger === null) {
      this.trigger = this.getRootNode().querySelector(`#${this.for}`);
    }

    this.popover = this.shadowRoot.querySelector('#popover');
    this.popper = new Popover(this.trigger, this.popover, this.placement);

    const handleShow = () => {
        this.toggleShow();
      },
      handleHide = () => {
        this.toggleHide();
      },
      handleKeyboardWhenFocusOnTrigger = event => {
        const key = event.key.toLowerCase();

        if (this.isPopoverVisible) {
          if (key === 'tab' || key === 'escape') {
            this.toggleHide();
          }
        }

        if (key === ' ' || key === 'enter') {
          this.toggle();
        }
      },
      element =
        this.trigger.parentElement.nodeName === 'AURO-POPOVER'
          ? this
          : this.trigger;

    element.addEventListener('mouseenter', handleShow);
    element.addEventListener('mouseleave', handleHide);

    // if user tabs off of trigger, then hide the popover.
    this.trigger.addEventListener('keydown', handleKeyboardWhenFocusOnTrigger);

    // handle gain/loss of focus
    this.trigger.addEventListener('focus', handleShow);
    this.trigger.addEventListener('blur', handleHide);

    // e.g. for a closePopover button in the popover
    this.addEventListener('hidePopover', handleHide);
  }
  toggle() {
    this.isPopoverVisible ? this.toggleHide() : this.toggleShow();
  }
  toggleShow() {
    this.popper.show();
    this.isPopoverVisible = true;
    this.setAttribute('data-show', true);
  }
  toggleHide() {
    this.popper.hide();
    this.isPopoverVisible = false;
    this.removeAttribute('data-show');
  }
  render() {
    return html`
      <div id="popover" class="popover ${this.alertType}" aria-live="polite">
        <div id="arrow" class="arrow" data-popper-arrow></div>
        <p>${this.details}</p>
      </div>
      <slot name="trigger" data-trigger-placement="${this.placement}"></slot>
    `;
  }
}
customElements.define('tool-tip', Tooltip);
