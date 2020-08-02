import { css } from 'lit-element';
import reset from './reset.js';

export default css`
  ${reset}
  *,
  *::before,
  *::after {
    flex-direction: row;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  *::selection {
    background-color: var(--foreground);
    color: var(--background);
  }
  h1.subheading {
    font-weight: 300;
  }
  h2.subheading {
    font-weight: 300;
  }
  h3.subheading {
    font-weight: 300;
  }
  h4.subheading {
    font-weight: 300;
  }
  h5.subheading {
    font-weight: 300;
  }
  h6.subheading {
    font-weight: 300;
  }
  strong.subheading,
  b.subheading {
    font-weight: 300;
  }
  h1 {
    font-size: var(--ramp-t1);
    font-weight: 600;
    line-height: 1.2;
  }
  h2 {
    font-size: var(--ramp-t2);
    font-weight: 600;
    line-height: 1.2173913043;
  }
  h3 {
    font-size: var(--ramp-t3);
    font-weight: 600;
    line-height: 1.294117647058824;
  }
  h4 {
    font-size: var(--ramp-t4);
    font-weight: 600;
    line-height: 1.285714285714286;
  }
  h5 {
    font-size: var(--ramp-t5);
    font-weight: 600;
    line-height: 1.4;
  }
  h6 {
    font-size: var(--ramp-t6);
    font-weight: 600;
    line-height: 1.5;
  }
  strong,
  b {
    font-size: var(--ramp-t7);
    font-weight: 600;
    line-height: 1.428571428571429;
  }
  p.p-1 {
    font-size: var(--ramp-t5);
    font-weight: 400;
  }
  p.p-2 {
    font-size: var(--ramp-t6);
  }
  p,
  p.p-3,
  div {
    font-size: var(--ramp-t7);
  }
  p.mono,
  pre {
    font-family: 'Monaco';
  }
  label,
  .label {
    font-size: var(--ramp-t7);
    font-weight: 300;
  }
  small,
  caption {
    font-weight: 300;
  }
  small.c1,
  caption.c1,
  .metatext {
    font-size: var(--ramp-t8);
  }
  small.c1-upper,
  caption.c1-upper {
    text-transform: uppercase;
    font-size: var(--ramp-t8);
  }
  small.c2,
  caption.c2 {
    font-size: var(--ramp-t9);
  }
  small.c2-upper,
  caption.c2-upper {
    text-transform: uppercase;
    font-size: var(--ramp-t9);
  }
  a,
  a:link,
  a:visited,
  a:hover,
  a:focus {
    display: inline-block;
    transition: all ease 0.3s;
    text-decoration: none;
    color: var(--link-rest);
    padding: 0.3rem;
    height: 100%;
  }
  a:hover {
    color: var(--background);
    box-shadow: inset 0 -15em 0 var(--link-hover);
  }
  a:active {
    color: var(--link-active);
  }
  a.block-link:link,
  a.block-link:visited {
    color: var(--foreground);
    display: block;
    width: 100%;
  }
  button,
  a.button,
  input[type='submit'] {
    transition: var(--transition);
    display: inline;
    min-width: 5rem;
    border: 2px solid var(--foreground);
    font-size: 1.3rem;
    text-align: center;
    text-transform: none;
    background: none;
    color: var(--foreground);
    cursor: pointer;
    padding: 1rem 2rem;
  }
  button:hover,
  a.button:hover,
  input[type='submit']:hover {
    background-color: var(--foreground);
    color: var(--background);
  }

  /* Form inputs */
  .input-group {
    display: flex;
    flex-direction: column;
    margin-bottom: var(--margin);
  }

  input {
    outline: none;
    padding: 1rem 2rem;
    min-height: 4.4rem;
    color: var(--foreground);
    transition: 0.1s ease-out;
    border: 1px solid;
    border-color: var(--foreground);
    border-radius: var(--design-unit);
    background: transparent;
    cursor: text;
    width: 100%;
  }
  input:focus {
    border: 1px solid var(--focus);
  }
  input:disabled,
  input:disabled ~ .label {
    opacity: 0.5;
  }
  nav {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  div:first-child {
    width: 50%;
  }
  nav div {
    width: 25%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  a:link {
    color: var(--link-rest);
  }
  /* A link that has been visited */
  a:visited {
    color: var(--link-rest);
  }
  /* A link that is hovered on */
  a:hover {
    color: var(--link-hover);
  }
  /* A link that is selected */
  a:active {
    color: var(--link-active);
  }
  @media (prefers-color-scheme: dark) {
    a:link {
      color: var(--cr-blue-40);
    }
    /* A link that has been visited */
    a:visited {
      color: var(--cr-blue-40);
    }
    /* A link that is hovered on */
    a:hover {
      color: var(--cr-blue-50);
    }
    /* A link that is selected */
    a:active {
      color: var(--cr-blue-20);
    }
  }
`;
