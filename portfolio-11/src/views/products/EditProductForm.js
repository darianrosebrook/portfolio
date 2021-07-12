import { LitElement, html, css } from "lit-element";
import { login, authenticate, isAuthenticated } from "../../auth";
import { createProduct, getCategories } from "../../api/apiAdmin";
import { productService } from "../../redux/services";
import styles from "../../styles";

class EditProductForm extends LitElement {
  render() {
    return html`
      <form>
        <div class="input-group">
          <h4>Add a photo</h4>
          <label for="product">Product</label>
          <input
            @input=${this._handleChange("photo")}
            type="file"
            name="photo"
            accept="image/*"
          />
        </div>
        <div class="input-group">
          <label for="title">Title</label>
          <input
            @input=${this._handleChange("title")}
            type="text"
            name="title"
            placeholder="Title"
            value=${this.title}
            required
          />
        </div>
        <div class="input-group">
          <label for="subTitle">Subtitle</label>
          <input
            @input=${this._handleChange("subTitle")}
            type="text"
            name="subTitle"
            placeholder="Subtitle"
            value=${this.subTitle}
            required
          />
        </div>
        <div class="input-group">
          <label for="slug">Url</label>
          <input
            @input=${this._handleChange("slug")}
            type="text"
            name="slug"
            placeholder="Url"
            value=${this.slug}
            required
          />
        </div>
        <div class="input-group">
          <label for="description">Description</label>
          <textarea
            @input=${this._handleChange("description")}
            type="description"
            name="description"
            placeholder="Description"
            required
          >
${this.description}
</textarea
          >
        </div>
        <div class="input-group">
          <label for="body">Product body</label>
          <textarea
            @input=${this._handleChange("body")}
            type="text"
            name="body"
            placeholder="Article Body"
            required
          >
${this.body}
</textarea
          >
        </div>
        <div class="input-group">
          <label for="price">price</label>
          <input
            @input=${this._handleChange("price")}
            type="number"
            name="price"
            placeholder="$0.00"
            value=${this.price}
            required
          />
        </div>
        <div class="input-group">
          <label for="category">Category</label>
          <select
            @input=${this._handleChange("category")}
            name="category"
            required
          >
            <option>-Choose a category-</option>
            ${this.categories.map((category) => {
              return html`<option value=${category._id}>
                ${category.category}</option
              >`;
            })}
          </select>
        </div>
        <div class="input-group">
          <label for="shipping">Shipping</label>
          <select
            @input=${this._handleChange("shipping")}
            name="shipping"
            required
          >
            <option>-Select if shipping is required-</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div class="input-group">
          <label for="quantity">Quantity</label>
          <input
            @input=${this._handleChange("quantity")}
            type="number"
            name="quantity"
            placeholder="0"
            value=${this.quantity}
            required
          />
        </div>
        <button @click=${this.clickSubmit} type="submit">
          Create product
        </button>
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
    this.contentType = "product";
    this.author = "this.user._id";
    this.shipping = true;
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
        const productCategories = data.filter((i) =>
          Object.values(i).includes("product")
        );
        this.categories = productCategories;
      }
    });
    const { user, token } = isAuthenticated();
    this.user = user;
    this.token = token;
    this.author = this.user._id;
    this.getProduct();
  }
  _handleChange = (name) => (event) => {
    const value = name === "photo" ? event.target.files[0] : event.target.value;
    this.formData.set(name, value);

    this.error = "";
    this.loading = false;
  };
  clickSubmit(event) {
    event.preventDefault();
    for (var pair of this.formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    this.error = "";
    this.loading = true;
    productService
      .updateProduct(
        this.user.publicDetails.userName,
        this.token,
        this.slug,
        this.formData
      )
      .then((data) => {
        if (data.error) {
          this.error = data.error;
        } else {
          this.contentType = "product";
          this.author = "this.user._id";
          this.redirectToProfile = false;
          this.formData = "";
          this.loading = false;
          this.createdProduct = data.product.title;
        }
      });
  }
  getProduct = () => {
    function getPathFromUrl(string) {
      return string.split(/[?#]/)[0];
    }
    let url = window.location.href;
    url = getPathFromUrl(url).replace(/\/$/, "");
    const productSlug = url.substr(url.lastIndexOf("/") + 1);
    productService.getProduct(productSlug).then((data) => {
      if (data.error) {
        this.error = data.error;
      } else {
        this.slug = data.slug;
        this.title = data.title;
        this.subTitle = data.subTitle;
        this.description = data.description;
        this.category = data.category;
        this.body = data.body;
        this.price = data.price;
        this.shipping = data.shipping;
        this.quantity = data.quantity;
        this.photo = data.photo;
        this.formData = new FormData();
        this.formData.set("author.id", this.user._id);
        this.formData.set("author.name", this.user.publicDetails.name);
        this.formData.set("author.userName", this.user.publicDetails.userName);
        this.formData.set("contentType", this.contentType);
        this.formData.set("slug", this.slug);
        this.formData.set("title", this.title);
        this.formData.set("subTitle", this.subTitle);
        this.formData.set("description", this.description);
        this.formData.set("category", this.category);
        this.formData.set("body", this.body);
        this.formData.set("price", this.price);
        this.formData.set("shipping", this.shipping);
        this.formData.set("quantity", this.quantity);
        this.formData.set("photo", this.photo);
      }
    });
  };
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

customElements.define("edit-product-form", EditProductForm);
