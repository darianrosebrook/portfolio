import { LitElement, html, css } from "lit";
import "../shared/layout";
import styles from "../../styles";

import '../../components/button'
import '../../components/icon'

const stylesheet = css`
  * {
    border: 1px
  }
`

class Home extends LitElement {
  constructor() {
    super();
  }
  static get styles() {
    return [
      styles,
      css`
        div {
          width: 100%;
        }
        .social-links {
          display: flex;
          align-items: center;
          width: auto;
        }
        .social-links li + li {
          margin-left: 1rem;
        }
        .hero > div {
          margin-top: 2rem;
        }
        @media (min-width: 768px) {
          .hero {
            min-height: 50vh;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 2rem;
          }
        }
        .hero-profile {
          width: auto;
        }
        .work {
          margin-bottom: 2rem;
        }
        .hero-image {
          width: auto;
          height: auto;
          max-height: 100%;
        }


      `,
    ];
  }
  render() {
    return html`
      <shared-layout heading=${'Darian Rosebrook: Product Designer, Portland OR'} description=${'Hey! I\'m Darian Rosebrook 👋🏼 I am a senior product designer in the Portland, OR area where I work on design systems at Nike for Enterprise Tools. I believe in making things that make it easier for people to make things.'} .stylesheet=${stylesheet}>
      <section>
        <div class="hero">
          <div class="hero-profile">
            <img class="hero-image" src="https://community-production.nyc3.digitaloceanspaces.com/product/asdfaefwef/darian-thin.png" alt="A photo of Darian Rosebrook">
          </div>
          <div>
            <div>
              <p class="subtitle-3">Senior Product Designer</p>
              <h1 >Darian Rosebrook</h1>
            </div>
            <div class="content">
              <p class="body-3">Hey! I’m Darian Rosebrook 👋🏼 I am a senior product designer in the Portland, OR area where I work on design systems at Nike for Enterprise Tools.</p>
              <p class="body-3">I believe in making things that make it easier for people to make things.</p>
            </div>
            <div class="work">
              <p class="body-3">I'm super passionate about building better, accessibility-focused design systems for product teams. As a designer and developer hybrid, I bridge a lot of the communication barriers between both halves of a design system library.</p>
              <p class="body-3">With the ability to help create custom tooling for Design System tools like Figma, in-depth knowledge of HTML, CSS, and Javascript, and user experience, I do my best to help make things easier for teams to get their work done without being hindered by repetitive low-hanging decisions, freeing them up for more in-depth problem-solving in their product development.</p>
              <p class="body-3">I write and teach designers how to build better design processes and focus on helping the community as a whole get better by helping designers understand business.</p>
              <p class="body-3">I am working on critical updates to my personal site, if you need to see my work, check out <a href="https://darian.is/a-designer" target="_blank">my portfolio here</a></p>
            </div>
            <div>
              <ul class="social-links">
                <li>You can also find me here &mdash;</li>
                <li>
                  <a href="https://twitter.com/darianrosebrook" target="_blank">
                    <fa-icon weight="b" icon="twitter"></fa-icon>
                  </a>
                </li>
                <li>
                  <a href="
                  https://www.linkedin.com/in/darianrosebrook/" target="_blank">
                  <fa-icon weight="b" icon="linkedin"></fa-icon>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      </shared-layout>
    `;
  }
  _handleClick = (e) => {
    e.stopPropagation();
    console.log(e.detail);
  }
}

customElements.define("home-page", Home);
