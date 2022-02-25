import {LitElement,html,css} from 'lit';
import styles from '../../styles'
import "../shared/layout";


class Designsystem extends LitElement {
  render() {
    return html`
      <shared-layout>
        <section>
          <h1>Design System</h1>
          <p class="p-2">This work is purely to practice my skills in understanding and creating content for design systems</p>
        </section>
        <section>
          <table>
            <thead>
            <tr>
              <th>
                Components
              </th>
              <th>
                Description
              </th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>
                Button
              </td>
              <td>
                <p>A button is a clickable element that is typically used to submit a form, trigger an action, or both.</p>
              </td>
            </tr>
            </tbody>
          </table>
        </section>
      </shared-layout>
    `
  }
  static get styles() {
    return [styles]
  }
}
customElements.define("design-system", Designsystem);