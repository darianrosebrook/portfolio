import { LitElement, html, css } from "lit-element";
import { login, authenticate, isAuthenticated } from "../auth";
import { createBook, getCategories } from "../api/apiAdmin";
import { store } from '../redux/store';
import { connect } from 'pwa-helpers/connect-mixin.js';
import styles from '../styles'

import '../components/inputtext'
import '../components/inputselect'
import '../components/inputfile'
import '../components/button'
import '../components/icon'

class BookForm extends LitElement {
  render() {
    return html`
      <form>
        <!-- <div class="input-group">
          <label for="photo">Photo</label>
          <label for="photo" id="fileLabel" @drop=${e => this._handleDrop(e)}>
            <fa-icon icon="camera"></fa-icon>
          
          ${this.photo ? this.photo.split( "\\" ).pop() : 'Add a photo'}</label>
          <input
            @input=${e => this._handleChange(e, "photo")}
            type="file"
            name="photo"
            id="photo"
            accept="image/*"
          />
        </div> -->
      <file-input
        .value=${this.photo}
        accept="image/*"
        placeholder="Add a photo"
        icon="camera"
        label="Photo"

        @fileInputChange=${e => this._handleChange(e, "photo")}
      ></file-input>
      <text-input
        inputType="text"
        label="Title"
        placeholder="Title"
        .value=${this.title}
        required
        @textInputChange=${e => this._handleChange(e, 'title')}
      ></text-input>
      <text-input
        inputType="text"
        label="Subtitle"
        placeholder="Subtitle"
        .value=${this.subTitle}
        @textInputChange=${e => this._handleChange(e, 'subTitle')}
      ></text-input>
      <text-input
        inputType="text"  
        label="Description"
        placeholder="Description"
        .value=${this.description}
        @textInputChange=${e => this._handleChange(e, 'description')}
      ></text-input>
      <text-input
        inputType="text"
        label="Book Author"
        placeholder="Book Author"
        .value=${this.bookAuthor}
        @textInputChange=${e => this._handleChange(e, 'bookAuthor')}
      ></text-input>
      <text-input
        inputType="text"
        label="Related Links"
        placeholder="Related Links"
        .value=${this.relatedLinks}
        @textInputChange=${e => this._handleChange(e, 'relatedLinks')}
      ></text-input>
      <select-input
        label="Category"
        .value=${this.category}
        placeholder="Please select a category"
        @inputSelectChange=${e => this._handleChange(e, 'category')}
      ></select-input>
      <text-input
        inputType="text"
        label="Tags"
        .value=${this.tags}
        placeholder="Add tags separated by commas"
        @textInputChange=${e => this._handleChange(e, 'tags')}
      ></text-input>
      <text-input
        inputType="text"
        label="Body"
        placeholder="Body"
        .value=${this.body}
        @textInputChange=${e => this._handleChange(e, 'body')}
      ></text-input>
      <lit-button
        @buttonPress=${this._handleSubmit}
        >Submit</lit-button
      >

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
      bookAuthor: { type: String },
      tags: { type: Array },
      category: { type: String },
      categories: { type: Array },
      body: { type: String },
      author: { type: Object },
      relatedLinks: { type: String },
      photo: { type: String },
      articlesReferenced: { type: Array },
      productsReferenced: { type: Array },
      error: { type: String },
      loading: { type: Boolean },
      createdBook: { type: String },
      redirectToProfile: false,
      formData: { type: String },
    };
  }
  static get styles() {
    return [styles , css`
      .input-group, text-input, select-input {
        width: 40rem;
        margin: 0 auto 2rem auto;
      }
      
      `];
  }
  constructor() {
    super();
    this.title = '';
    this.subTitle = '';
    this.description = '';
    this.bookAuthor = '';
    this.tags = '';
    this.category = '';
    this.categories = [];
    this.body = '';
    this.author = {};
    this.relatedLinks = '';
    this.photo = '';
    this.articlesReferenced = [];
    this.productsReferenced = [];
    this.error = '';
    this.loading = false;
    this.createdBook = '';
    this.formData = new FormData();
    this.categories = this._getCategories();
  }
  connectedCallback() {
    super.connectedCallback();
  }
  _getCategories() {
    getCategories()
      .then((data) => {
        if (data.error) {
          this.error = data.error;
        } else {
          const bookCategories = data.filter((i) => Object.values(i).includes("book"))
          return bookCategories
        }
      });
  }
  _handleChange(e, field) {
    const value = e.target.value || e.detail.value;
    this[field] = value
    this.formData.set(field, value);
  }
  _handleSubmit(e) {
    e.preventDefault();
    this.error = '';
    this.loading = true;
    const { title, subTitle, description, bookAuthor, tags, category, body, relatedLinks, photo } = this;
    const formData = this.formData;
    formData.append('title', title);
    formData.append('subTitle', subTitle);
    formData.append('description', description);
    formData.append('bookAuthor', bookAuthor);
    formData.append('tags', tags);
    formData.append('category', category);
    formData.append('body', body);
    formData.append('relatedLinks', relatedLinks);
    formData.append('photo', photo);
   
    this.loading = false;
  }
}
  
customElements.define("book-form", BookForm);
