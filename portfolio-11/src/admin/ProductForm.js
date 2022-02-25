import { LitElement, html, css } from "lit";
import {store} from "../redux/store";
import { connect } from "pwa-helpers/connect-mixin";
import { login, authenticate, isAuthenticated } from "../auth";
import { createProduct, getCategories } from "../api/apiAdmin";
import styles from "../styles";

import '../components/inputfile'
import '../components/inputtext'
import '../components/inputtextarea'
import '../components/inputselect'

import { alertActions } from "../redux/actions";

class ProductForm extends connect(store)(LitElement) {

  render() {
    return html`
      <form>
        <file-input
          .value=${this.photo}
          accept="image/*"
          placeholder="Add a photo"
          icon="camera"
          label="Photo"
          @fileInputChange=${e => this._handleChange(e, "photo")}
        ></file-input>
        <text-input
          @textInputChange=${e => this._handleChange(e, 'title')}
          inputType="text"
          placeholder="Title"
          .value=${this.title}
          label="Title"
          required
        ></text-input>
        <text-input
          @textInputChange=${e => this._handleChange(e, 'subTitle')}
          inputType="text"
          placeholder="Subtitle"
          .value=${this.subTitle}
          label="Subtitle"
          required
        ></text-input>

        <text-input
          @textInputChange=${e => this._handleChange(e, 'slug')}
          inputType="text"
          placeholder="URL Slug"
          .value=${this.slug}
          label="URL Slug"
          required
        ></text-input>

        <text-input
          @textInputChange=${e => this._handleChange(e, 'description')}
          inputType="text"
          placeholder="Description"
          .value=${this.description}
          label="Description"
          required
        ></text-input>
        
        <div class="input-group">
          <label for="body">Product body</label>
          <textarea
            @input=${e => this._handleChange(e, 'body')}
            type="text"
            name="body"
            placeholder="Article Body"
            required
          >
          ${this.body}</textarea
          >
        </div>

        <div class="input-group">
          <label for="price">Price</label>
          <input
            @input=${e => this._handleChange(e, 'price')}
            type="number"
            name="price"
            placeholder="$0.00"
            value=${this.price}
            step=".01"
            required
          />
        </div>
        ${this.categories && this.categories.length > 0
          ? html`
              <select-input
                .options=${this.categories}
                placeholder="—Choose a category—"
                .value=${this.category}
                label="Category"
                @selectInputChange=${e => this._handleChange(e, 'category')}
                required
              ></select-input>
            `
          : ''}
        <select-input
          .options=${[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ]}
          placeholder="—Is shipping required?—"
          label="Shipping"
          .value=${this.shipping}
          @selectInputChange=${e => this._handleChange(e, 'shipping')}
          required
        ></select-input>
        <div class="input-group">
          <label for="quantity">Quantity</label>
          <input
            @input=${e => this._handleChange(e, 'quantity')}
            type="number"
            name="quantity"
            placeholder="0"
            value=${this.quantity}
            required
          />
        </div>
        <lit-button @buttonPress=${this.clickSubmit}>Edit Product</lit-button>
        <p>${this.showLoading()} ${this.showError()} ${this.showSuccess()}</p>
      </form>
    `;
  }
  static get properties() {
    return {
      slug: { type: String },
      contentType: { type: String },
      title: { type: String },
      subTitle: { type: String },
      description: { type: String },
      price: { type: Number },
      quantity: { type: Number },
      sold: { type: Number },
      shipping: { type: Boolean },
      tags: { type: Array },
      category: { type: String },
      categories: { type: Array },
      body: { type: String },
      author: { type: Object },
      photo: { type: String },
      productDownload: { type: String },
      error: { type: String },
      loading: { Type: Boolean },
      createProduct: { type: String },
      redirectToProfile: { Type: Boolean },
      formData: { type: String },
    };
  }
  static get styles() {
    return [styles];
  }
  constructor() {
    super();
    this.slug = "";
    this.contentType = "product";
    this.title = "";
    this.subTitle = "";
    this.description = "";
    this.tags = [];
    this.category = "";
    this.categories = [];
    this.body = "";
    this.author = "this.user._id";
    this.price = 0.0;
    this.shipping = true;
    this.quantity = 0;
    this.sold = 0;
    this.photo = "";
    this.bookReferenced = "";
    this.booksReferenced = [];
    this.articlesReferenced = [];
    this.error = "";
    this.redirectToProfile = false;
    this.formData = new FormData();
    this.loading = false;
    this.createdProduct = "";
  }
  connectedCallback() {
    super.connectedCallback();
    getCategories().then((data) => {
      if (data.error) {
        this.error = data.error;
      } else {
        console.log(data);
        const productCategories = data.filter((i) =>
          Object.values(i).includes("product")
        );
        console.log(productCategories);
        productCategories.forEach(category => {

          this.categories.push({
            value: category._id,
            label: category.category,
          });
          console.log(this.categories.length)
        });
      }
    });
    const { user, token } = isAuthenticated();
    this.user = user;
    this.token = token;
    this.author = this.user._id;
    this.formData = new FormData();
    this.formData.set("author.id", this.user._id);
    this.formData.set("author.name", this.user.publicDetails.name);
    this.formData.set("author.userName", this.user.publicDetails.userName);
    this.formData.set("contentType", this.contentType);
  }
  
  _handleChange = (event, name) => {
    console.log(event);
    const value = name === 'photo' ? event.target.files[0] : event.target.value;
    this.formData.set(name, value);
    console.log(value === this.formData.get(name));
    this.error = '';
    this.loading = false;
  };

  clickSubmit(event) {
    event.preventDefault();

    this.error = "";
    this.loading = true;
    for(let key of this.formData.entries()) {
      console.log(key[0] + ', ' + key[1]);
    }
    createProduct(
      this.user.publicDetails.userName,
      this.token,
      this.formData
    ).then((data) => {
      if (data.error) {
        this.error = data.error;
      } else {
        store.dispatch(alertActions.success(`${this.title} was created successfully`));
        this.slug = "";
        this.contentType = "product";
        this.title = "";
        this.subTitle = "";
        this.description = "";
        this.tags = [];
        this.category = "";
        this.categories = [];
        this.body = "";
        this.author = "this.user._id";
        this.price = "";
        this.shipping = "";
        this.quantity = "";
        this.photo = "";
        this.bookReferenced = "";
        this.booksReferenced = [];
        this.articlesReferenced = [];
        this.error = "";
        this.redirectToProfile = false;
        this.formData = "";
        this.loading = false;
        this.createdProduct = data.product.title;
      }
    });
  }
  showError = () => {
    return html`
      <div
        className="alert alert-danger"
        style="color: var(--cr-red-60); display: ${this.error ? "" : "none"}"
      >
        ${this.error}
      </div>
    `;
  };
  showSuccess = () => {
    if (this.createdProduct) {
      return html`
        <div
          className="alert alert-info"
          style="display:${this.createdProduct ? "" : "none"}"
        >
          <h2>${this.createdProduct} has been created!</h2>
        </div>
      `;
    }
  };
  showLoading = () => {
    if (this.loading) {
      return html`
        <div
          className="alert alert-info"
          style="color: var(--df-dark-neutral-dark); display: ${this.loading
            ? ""
            : "none"}"
        >
          Loading... please wait
        </div>
      `;
    }
  };
}

customElements.define("product-form", ProductForm);
