import { css } from "lit";
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
  /* -- Global -- */
  html {
    opacity: 0;
    animation: fadein 0.3s ease-in-out;
    opacity: 1;
  }
  .fadein {
    opacity: 0;
    animation: fadein 0.3s ease-in-out;
    opacity: 1;
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
  

  h1, .title-1 {
    font: var(--tr-title-1);
    margin: 0;
    letter-spacing: -0.04em;
    line-height: 1.2;
  }
  h2, .title-2 {
    font: var(--tr-title-2);
    margin: 0;
    line-height: 1.2;
  }
  h3, .title-3 {
    font: var(--tr-title-3);
    margin: 0;
    line-height: 1.2;
  }
  h4, .title-4 {
    font: var(--tr-title-4);
    margin: 0;
    line-height: 1.2;
  }
  h5, .title-5 {
    font: var(--tr-title-5);
    margin: 0;
    line-height: 1.2;
  }
  h6, .title-6 {
    font: var(--tr-title-6);
    margin: 0;
    line-height: 1.2;
  }
  .subtitle-1 {
    font: var(--tr-subtitle-1);
    margin: 0;
    line-height: 1.2;
  }
  .subtitle-2 {
    font: var(--tr-subtitle-2);
    margin: 0;
    line-height: 1.2;
  }
  .subtitle-3 {
    font: var(--tr-subtitle-3);
    margin: 0;
  }
  small, .legal {
    font: var(--tr-legal);
    margin: 0;
  }
  strong,
  b {
    font-size: inherit;
    font-weight: var(--bold);
  }
  .body-1 {
    font: var(--tr-body-1);
    margin: 0;
  }
  p,.body-2 {
    font: var(--tr-body-2);
    margin: 0;
  }
  .body-3,
  div,
  ul {
    font: var(--tr-body-3);
  }
  * + p {
    margin-top: 1rem;
  }
  p.mono,
  pre {
    font-family: "Monaco";
  }
  .emph {
    font-family: "Crimson Pro";
    font-weight: 100;
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
    font: 
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
    padding: 0 0.25rem;
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
    background: var(--foreground);
    color: var(--background) !important;
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
  label {
    font-size: var(--ramp-t6);
    font-weight: var(--medium);
    display: block;
    margin-bottom: var(--du-2);
  }
  input {
    line-height: 1;
  }
  input,
  textarea, select {
    line-height: 1;
    display: block;
    outline: none;
    padding: 1rem 2rem;
    min-height: 4.4rem;
    color: var(--foreground);
    transition: 0.1s ease-out;
    border: 2px solid;
    border-color: var(--foreground);
    border-radius: var(--design-unit);
    background: transparent;
    cursor: text;
    width: 100%;
    font-size: var(--ramp-t7);
  }
  input:focus {
    outline: none;
    border: 2px solid var(--focus);
  }
  input:disabled,
  input:disabled ~ .label {
    opacity: 0.5;
    cursor: not-allowed;
  }
  ::placeholder, .placeholder { 
    color: var(--foreground-secondary);
  }
  .formValidation {
    margin-top: 1rem;
    margin-bottom: 1rem;
    font-size: var(--ramp-t7);
    line-height: 1.428571428571429;
  }
  .formValidation span {
    color: var(--secondary-text);
    background-color: var(--cr-neutral-10);
    border-radius: var(--design-unit);
    padding: var(--design-unit) var(--du-2) var(--design-unit) var(--design-unit);
  }
  .warning span {
    color: var(--warning-foreground);
    background-color: var(--warning-background);
  }
  .danger span {
    color: var(--danger-foreground);
    background-color: var(--danger-background);
  }
  .success span {
    color: var(--success-foreground);
    background-color: var(--success-background);
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
  /* Structure */
  section {
    margin-top: var(--du-4);
  }

  /* Tables */
  table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    margin-bottom: var(--margin);
  }
  table thead th {
    font-weight: var(--medium);
    font-size: var(--ramp-t6);
    color: var(--foreground);
    text-align: left;
  }
  tbody tr {
    border-top: 1px solid var(--cr-neutral-10);
  }
  td, th {
    padding: var(--du-4) var(--du-4) var(--du-4) var(--du-4);
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
