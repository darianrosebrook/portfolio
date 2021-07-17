import { css } from "lit-element";
import reset from "./reset.js";
import keyframes from "./keyframes.js";

/*
  Position
  Display
  Sizing
  Margin/padding
  Border
  Colors
  Typography
  Effects
*/

export default css`
  /* Imports */
  ${reset}
  ${keyframes}

  /* Defaults */
  *,
  *::before,
  *::after {
    flex-direction: row;
    -moz-box-sizing:border-box;
    -webkit-box-sizing:border-box;
    box-sizing:border-box;
    vertical-align:top;
    margin: 0;
    padding: 0;
  }
  *::selection {
    background-color: var(--foreground);
    color: var(--background);
  }
  *:focus {
    outline: var(--focus) solid 2px ;
  }
  .elevation-1 {
    --depth: var(--depth-1);
    box-shadow: 0px calc(var(--depth, 8) * 0.25px) calc(var(--depth, 8) * 0.75px) rgba(17, 17, 17, 0.08), 
    0px calc(var(--depth, 8) * 0.125px) calc(var(--depth, 8) * 0.25px) rgba(17, 17, 17, 0.04);
    
  }
  .elevation-2 {
    --depth: var(--depth-2);
    box-shadow: 0px calc(var(--depth, 8) * 0.25px) calc(var(--depth, 8) * 0.75px) rgba(17, 17, 17, 0.08), 
    0px calc(var(--depth, 8) * 0.125px) calc(var(--depth, 8) * 0.25px) rgba(17, 17, 17, 0.04);
    
  }
  .elevation-3 {
    --depth: var(--depth-3);
    box-shadow: 0px calc(var(--depth, 8) * 0.25px) calc(var(--depth, 8) * 0.75px) rgba(17, 17, 17, 0.08), 
    0px calc(var(--depth, 8) * 0.125px) calc(var(--depth, 8) * 0.25px) rgba(17, 17, 17, 0.04);
    
  }
  .elevation-4 {
    --depth: var(--depth-4);
    box-shadow: 0px calc(var(--depth, 8) * 0.25px) calc(var(--depth, 8) * 0.75px) rgba(17, 17, 17, 0.08), 
    0px calc(var(--depth, 8) * 0.125px) calc(var(--depth, 8) * 0.25px) rgba(17, 17, 17, 0.04);
    
  }
  
  /* -- Clearfix--  */
  .f-r,
  .f-l {
    float: none;
  }
  avatar-image.f-r {
    float: right;
  }
  .cf::after {
    content: "";
    display: table;
    clear: both;
  }
  /* -- Media -- */
  img {
    transition: var(--transition);
    display: inline-block;
    width: 100%;
  }
  video {
    display: block;
  }

  /* Typography  */
  /* -- Headings--  */
  h1 {
    font-size: var(--ramp-t1);
    font-weight: var(--light);
    line-height: 1.2;
  }
  h2 {
    font-size: var(--ramp-t2);
    font-weight: var(--light);
    line-height: 1.2173913043;
  }
  h3 {
    font-size: var(--ramp-t3);
    font-weight: var(--light);
    line-height: 1.294117647058824;
  }
  h4 {
    font-size: var(--ramp-t4);
    font-weight: var(--light);
    line-height: 1.285714285714286;
  }
  h5 {
    font-size: var(--ramp-t5);
    font-weight: var(--light);
    line-height: 1.4;
  }
  h6 {
    font-size: var(--ramp-t6);
    font-weight: var(--light);
    line-height: 1.5;
  }
  .subheading {
    font-weight: 300;
  }
  strong,
  b {
    font-size: var(--ramp-t7);
    font-weight: 600;
    line-height: 1.428571428571429;
  }

  p {
    margin-bottom: var(--margin);
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
  div,
  ul {
    font-size: var(--ramp-t7);
  }
  p.mono,
  pre {
    font-family: "Monaco";
  }
  .emph {
    font-family: "Crimson Pro";
    font-weight: 100;
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

  ul {
    list-style-type: none;
  }

  a,
  a:link,
  a:visited,
  a:hover,
  a:focus {
    display: inline-block;
    transition: var(--transition);
    text-decoration: none;
    color: var(--link-rest);
    padding: 0.25rem;
    height: 100%;
  }
  a:hover {
    color: var(--background);
    box-shadow: inset 0 -.125em 0 var(--link-rest);
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

  /* Architecture */
  /* -- Grid--  */
  .grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-gap: var(--margin);
  }

  button,
  a.button,
  input[type="submit"] {
    transition: var(--transition);
    display: inline-block;
    border: 2px solid var(--foreground);
    border-radius: 4px;
    font-size: 1.6rem;
    text-align: center;
    text-transform: none;
    background: none;
    color: var(--foreground) !important;
    cursor: pointer;
    padding: 1rem;
    min-height: 4.4rem;
  }
  button:hover,
  a.button:hover,
  input[type="submit"]:hover {
    background-color: var(--foreground);
    color: var(--background) !important;
    box-shadow: none;
  }
  button.stealth,
  a.stealth {
    border: 1px solid transparent;
  }
  button.stealth:hover,
  a.stealth:hover {
    background: transparent;
    color: var(--foreground) !important;
    border: 1px solid var(--cr-neutral-50);
  }
  button.stealth:active,
  a.stealth:active {
    background: var(--hover-background);
    color: var(--foreground) !important;
    border: 1px solid var(--cr-neutral-50);
  }
  button.disabled,
  a.disabled {
    border: 2px solid var(--disabled);
    color: var(--disabled) !important;
    cursor: not-allowed;
  }
  button.disabled:hover,
  a.disabled:hover {
    background: var(--hover-background);
    color: var(--foreground) !important;
  }
  /* Form inputs */
  .input-group {
    display: flex;
    flex-direction: column;
    margin-bottom: var(--margin);
  }

  input,
  textarea {
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
  nav div:first-child {
    width: 50%;
  }
  nav div {
    width: 25%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h5 {
    font-family: "Crimson pro";
    font-weight: 200;
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
  :host {
    display: block;
    width: 100%;
  }
  @media (min-width: 1000px) {
    /* Clearfix */
    .f-r {
      float: right;
      margin-left: 3rem;
    }
    .f-l {
      float: left;
      margin-right: 3rem;
    }

    /* Grid */

    .grid {
      grid-template-columns: repeat(5, 1fr);
    }
    .grid-item {
      border-right: 1px solid var(--divider-color);
      margin-right: -0.5rem;
      padding: 0 var(--margin);
    }
    .grid-item:nth-of-type(1n + 4) {
      display: inline-block;
    }
    .grid-item:first-of-type {
    }
    .grid-item:nth-of-type(5n + 5) {
      border-right: none;
    }
    .grid-item:nth-of-type(5n + 6) {
    }
    .grid-item ~ .grid-item:last-of-type {
      margin-right: 0;
      border-right: none;
    }
  }
`;
