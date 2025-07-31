export const SVG_GOO = (
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
    <defs>
      <filter id="goo">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>

      {/* Text-optimized gooey filter with less blur for readability */}
      <filter id="goo-text">
        <feGaussianBlur
          in="SourceGraphic"
          stdDeviation="2"
          result="blur-text"
        />
        <feColorMatrix
          in="blur-text"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 10 -3"
          result="goo-text"
        />
        <feComposite in="SourceGraphic" in2="goo-text" operator="atop" />
      </filter>

      {/* Very subtle gooey filter for CSS Custom Highlight API */}
      <filter id="goo-text-subtle">
        <feGaussianBlur
          in="SourceGraphic"
          stdDeviation="1"
          result="blur-subtle"
        />
        <feColorMatrix
          in="blur-subtle"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 8 -2"
          result="goo-subtle"
        />
        <feComposite in="SourceGraphic" in2="goo-subtle" operator="atop" />
      </filter>
    </defs>
  </svg>
);
