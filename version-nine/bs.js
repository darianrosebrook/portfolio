class CoolHeading extends HTMLElement {
  connectedCallback() {
   console.log("CoolHeading connected");
   this.style.color = 'blue';
   this.addEventListener('click', () => {
     this.classList.toggle("what");
     this.innerHTML = `<H2>This is an h2</h2>`
   })

 }
  disconnectedCallback() {

  }
}
customElements.define('cool-heading', CoolHeading);
