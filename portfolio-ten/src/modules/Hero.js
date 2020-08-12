import { LitElement, html, css } from 'lit-element';

// Actions

// Styles
import styles from '../styles/index.js';

// Components
import '../components/Icon.js';
import '../components/Button.js';

const host = css`
  .hero {
    position: relative;
  }
  .row {
    padding-bottom: var(--margin);
    border-bottom: 1px solid var(--divider-color);
  }
  h1 {
    font-size: var(--ramp-t2);
  }
  h2 {
    font-size: var(--ramp-t7);
  }
  .row-head {
    padding: 1rem 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .row-head p {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .row-head p button-component + button-component {
    margin-left: var(--margin);
  }

  p {
    width: 100%;
  }
  h1 {
    width: 100%;
    padding: 0.45rem 0;
    line-height: 1.15;
    margin-left: -0.45rem;
  }
  @media (min-width: 1000px) {
    .hero {
      grid-column: 2/6;
      padding-right: 2rem;
      margin-right: -0.5rem;
      border-right: 1px solid var(--divider-color);
    }
    .module {
      width: 100%;
    }
    small {
      width: 100%;
      white-space: nowrap;
    }
    figure {
      width: calc(75% - 2rem);
    }
    h6 {
      padding: var(--design-unit);
      background: var(--neutral-layer-l2);
      width: fit-content;
    }
    .row-head {
      flex-direction: row;
    }
    h2 {
      width: 20%;
    }
    p {
      width: auto;
    }
  }
`;

// Redux
// class ___ extends connect(store)(LitElement) {

class Hero extends LitElement {
  render() {
    return html`
      <article class="hero ">
        <div class="row-head">
          <h2>Product &amp; UX Designer</h2>
          <p>
            <small class="c1-upper">Find me Here:</small>
            <button-component
              action="http://twitter.com/darianrosebrook"
              weight="b"
              iconSize="small"
              icon="twitter"
              ariaLabel="Link to Twitter"
              variant="stealth"
            ></button-component>
            <button-component
              action="http://medium.com/@darianrosebrook"
              weight="b"
              iconSize="small"
              icon="medium-m"
              ariaLabel="Link to Medium"
              variant="stealth"
            ></button-component>
            <button-component
              action="http://dribbble.com/darianrosebrook"
              weight="b"
              iconSize="small"
              icon="dribbble"
              ariaLabel="Link to Dribbble"
              variant="stealth"
            ></button-component>
            <button-component
              action="http://instagram.com/darianrosebrook"
              weight="b"
              iconSize="small"
              icon="instagram"
              ariaLabel="Link To Instagram"
              variant="stealth"
            ></button-component>
            <button-component
              action="http://youtube.com/compassofdesign"
              weight="b"
              iconSize="small"
              icon="youtube"
              ariaLabel="Link to YouTube"
              variant="stealth"
            ></button-component>
            <button-component
              action="http://linkedin.com/in/darianrosebrook"
              weight="b"
              iconSize="small"
              icon="linkedin"
              ariaLabel="Link to Linkedin"
              variant="stealth"
            ></button-component>
          </p>
        </div>
        <article class="row">
          <figure class="f-r cf">
            <img
              loading="lazy"
              src="/assets/img/darian-rosebrook-portrait.jpg"
              alt="Professional headshot of product designer, Darian Rosebrook. Seattle, WA 2019"
            />
            <figcaption>
              <h6>Product Designer, Darian Rosebrook. Seattle, WA. 2019</h6>
              <p>
                <a href="{{site.baseurl}}/about"
                  >See more
                  <i class="fa fa-arrow-right icon"
                    ><span>Click to see more</span></i
                  ></a
                >
              </p>
            </figcaption>
          </figure>
          <h1 class="emph">
            <span
              >Hey there! I'm Darian Rosebrook, a product designer that helps
              businesses design better end to end user experiences.
            </span>
          </h1>
          <p class="p-1">
            You know when you’re using an app or website and you get frustrated
            when it doesn't do what you want it to? I work to help make sure
            that doesn't happen.
          </p>
          <p>
            I work as a digital product designer in the Seattle area. Here, I
            utilize my consulting background in user experience design and brand
            identity design to create better end to end experiences people have
            with products they love.
          </p>
          <p>
            I have also worked with large companies, VC backed startups,
            bootstrapped startups, multiple clients in brandind and experience
            design. I've worked cross collaboratively, setting up design
            processes for the Developer Experiences team with Microsoft's Edge.
            I've built a design system and design process for Common Room's
            product team. I've designed an entire community app and website with
            a small team for the community that I run. I mentor and teach other
            designers ways to become better freelancers, designers, and
            communicators.
          </p>
          <h4>I am currently looking for my next role as a product designer</h4>
        </article>
      </article>
    `;
  }

  static get styles() {
    return [styles, host];
  }
}

customElements.define('hero-content', Hero);
