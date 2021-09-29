import { LitElement, html, css } from "lit";
import styles from '../../styles'
import { store } from '../../redux/store';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { isAuthenticated } from "../../auth";
import { categoryService } from "../../redux/services";
import { alertActions } from '../../redux/actions';

import '../../components/inputtext'
import '../../components/inputselect'
import '../../components/button'

class EditCategoryForm extends connect(store)(LitElement) {
  render() {
    return html`
    <form>
      <text-input
          label="Category Name"
          placeholder="Enter category name"
          .value=${this.category.category}
          name="category"
          @textInputChange=${e => this._handleChange(e, "category")}
        ></text-input>
        <select-input
          label="Category Type"
          placeholder="Select category type"
          .options=${[{value: "book", label: "Book"}, {value: "product", label: "Product"}, {value: 'article', label: 'Article'}]}
          .value=${this.category.categoryType}
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
      category: {
        category: {type: String},
        categoryType: {type: String}
      },
      categoryId: { type: String },
      createdCategory: { type: String },
      title: { type: String },
      error: { type: String },
      success: { type: Boolean },
      formData: { type: String },
      user: { type: Object },
      token: { type: String },
      loading: { type: Boolean }
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
    this.category = {};
    this.formData = new FormData();
  }
  connectedCallback() {
    super.connectedCallback();
    this._getCategory();
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
    this.category[name] = value;
    this.formData.set(name, value);
  }
  _handleSubmit(e) {
    e.preventDefault();
    this.error = "";
    this.success = false;
    this.loading = true;
    if (!this.category) {
      store.dispatch(alertActions.error({message: "Category name is required"}));
      return;
    }
    if (!this.category.categoryType) {
      store.dispatch(alertActions.error({message: "Category type is required"}));
      return;
    }
    categoryService.updateCategory(
      this.user.publicDetails.userName,
      this.token,
      this.categoryId,
      this.formData
    ).then(data => {
      if (data.error) {
        store.dispatch(alertActions.error({message: data.error}));
      }
      else {
        console.log(data.data)
        this.category.category= data.data.category;
        console.log(this.category, data.data.category, this.category.categoryType === data.data.categoryType);
        this.category.categoryType = data.data.categoryType;
        store.dispatch(alertActions.success(`Category has been updated to "${this.category.category}: ${this.category.categoryType}"`))
      }
    })
  }
    _getCategory = () => {
      function getPathFromUrl(string) {
        return string.split(/[?#]/)[0];
      }
      let url = window.location.href;
      url = getPathFromUrl(url).replace(/\/$/, "");
      const categorySlug = url.substr(url.lastIndexOf("/") + 1);
      this.categoryId = categorySlug;
      categoryService.getCategory(categorySlug).then(data => {
        if (data.error) {
          console.log(data);
        } else {
          this.category = data;
          this.formData.set('category', this.category.category)
          this.formData.set('categoryType', this.category.categoryType)
          console.log(this.category);
        } 
      });
    }

  
}

customElements.define("editcategory-form", EditCategoryForm);
