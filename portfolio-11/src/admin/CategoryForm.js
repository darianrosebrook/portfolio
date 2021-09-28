import {LitElement,html,css} from 'lit';
import styles from '../styles'
import { store } from '../redux/store';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { isAuthenticated } from "../auth";
import { createCategory } from "../api/apiAdmin";
import { alertActions } from '../redux/actions';

import '../components/inputtext'
import '../components/inputselect'
import '../components/button'

class CategoryForm extends connect(store)(LitElement) {
  render() {
    return html`
    <form>
      <text-input
          label="Category Name"
          placeholder="Enter category name"
          .value=${this.category}
          name="category"
          @textInputChange=${e => this._handleChange(e, "category")}
        ></text-input>
        <select-input
          label="Category Type"
          placeholder="Select category type"
          .options=${[{value: "book", label: "Book"}, {value: "product", label: "Product"}, {value: 'article', label: 'Article'}]}
          .value=${this.categoryType}
          name="categoryType"
          @selectInputChange=${e => this._handleChange(e, "categoryType")}
          ></select-input>
        
        <lit-button
          @buttonPress=${this._handleSubmit}
        >Submit</lit-button>
    </form>
      
    `
  }
  static get properties() {
    return {
      category: { type: String },
      categoryType: { type: String },
      createdCategory: { type: String },
      title: { type: String },
      error: { type: String },
      success: { type: Boolean },
      formData: { type: String },
      user: { type: Object },
      token: { type: String },
    }
  }
  static get styles() {
    return [ styles, css`
      select-input, text-input {
        width: 100%;
        max-width: 45rem;
        margin-bottom: 1rem;
      }
    `]
  }
  constructor() {
    super();
    this.success = false;
    this.category = "";
    this.formData = new FormData();
  }
  connectedCallback() {
    super.connectedCallback();
    const { user, token } = isAuthenticated();
    this.user = user;
    this.token = token;
  }
  stateChanged(state) {
    this.error = state.error;
    this.success = state.success;
    this.createdCategory = state.createdCategory;
  }
  _handleChange(e, name) {
    const value = e.target.value || e.details.value;
    this[name] = value;
    this.formData.set(name, value);
  }
  _handleSubmit(e) {
    e.preventDefault();
    this.error = "";
    this.success = false;
    if (!this.category) {
      store.dispatch(alertActions.error({message: "Category name is required"}));
      return;
    }
    if (!this.categoryType) {
      store.dispatch(alertActions.error({message: "Category type is required"}));
      return;
    }
    createCategory(
      this.user.publicDetails.userName,
      this.token,
      this.formData
    ).then(data => {
      if (data.error) {
        this.error = data.error;
        store.dispatch(alertActions.error({message: data.error}));
      } else {
        this.success = true;
        this.createdCategory = data.category;
        store.dispatch(alertActions.success(`"${this.createdCategory.category}" was created successfully in "${this.createdCategory.categoryType}"`));
      }
    }
    )

  }
}
customElements.define("category-form", CategoryForm);