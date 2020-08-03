import { LitElement, html } from 'lit-element';

// Actions

// Styles
import styles from '../styles/index.js';

// Components
import '../components/Icon.js';

// Redux
// class ___ extends connect(store)(LitElement) {

class Hero extends LitElement {
  render() {
    return html`
      <article class="hero row">
        <div class="row-head">
          <h2>Product &amp; UX Designer</h2>
          <p>
            <small><strong>Find me Here: </strong></small>
            <a
              href="http://twitter.com/darianrosebrook"
              class="social-link"
              rel="noreferrer"
              target="_blank"
              aria-label="Link To Twitter"
              ><fa-icon
                weight="b"
                icon="twitter"
                ariaLabel="Link to Twitter"
              ></fa-icon
            ></a>
            <a
              href="http://medium.com/@darianrosebrook"
              class="social-link"
              rel="noreferrer"
              target="_blank"
              aria-label="Link To Medium"
              ><fa-icon weight="b" icon="medium-m" ariaLabel=""
                ><span>Link to Medium</span></fa-icon
              ></a
            >
            <a
              href="http://dribbble.com/darianrosebrook"
              class="social-link"
              rel="noreferrer"
              target="_blank"
              aria-label="Link To Dribbble"
              ><fa-icon weight="b" icon="dribbble" ariaLabel=""
                ><span>Link to Dribbble</span></fa-icon
              ></a
            >
            <a
              href="http://instagram.com/darianrosebrook"
              class="social-link"
              rel="noreferrer"
              target="_blank"
              aria-label="Link To Instagram"
              ><fa-icon weight="b" icon="instagram" ariaLabel=""
                ><span>Link to Instagram</span></fa-icon
              ></a
            >
            <a
              href="http://youtube.com/compassofdesign"
              class="social-link"
              rel="noreferrer"
              target="_blank"
              aria-label="Link To YouTube"
              ><fa-icon weight="b" icon="youtube" ariaLabel=""
                ><span>Link to YouTube</span></fa-icon
              ></a
            >
            <a
              href="http://linkedin.com/in/darianrosebrook"
              class="social-link"
              rel="noreferrer"
              target="_blank"
              aria-label="Link To Linkedin"
              ><fa-icon weight="b" icon="linkedin" ariaLabel=""
                ><span>Link to Linkedin</span></fa-icon
              ></a
            >
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
          <h1 class="name">
            <span
              >Hey there! I'm Darian Rosebrook, a product designer that helps
              businesses design better end to end user experiences.
            </span>
          </h1>
          <p>
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
    return styles;
  }
}

customElements.define('hero-content', Hero);
