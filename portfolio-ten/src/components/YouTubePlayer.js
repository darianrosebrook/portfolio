import { LitElement, html } from 'lit-element';

// Actions

// Styles

// Components

// Redux
// class ___ extends connect(store)(LitElement) {

class YouTubePlayer extends LitElement {
  render() {
    return html` <style>
        .embed-container {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          max-width: 100%;
        }

        .embed-container iframe,
        .embed-container object,
        .embed-container embed {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      </style>

      <div class="embed-container">
        <iframe
          title="${this.title}"
          width="560"
          height="315"
          src="https://www.youtube.com/embed/${this.videoId}"
          frameborder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>`;
  }

  static get properties() {
    return {
      title: { type: String },
      videoId: { type: String },
    };
  }
}

customElements.define('youtube-player', YouTubePlayer);
