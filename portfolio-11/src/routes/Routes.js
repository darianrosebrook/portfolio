import { LitElement, html, css } from "lit";

// Root path
import "../views/home/home";

// //Products
// import "../views/products/products";
// import "../views/products/productshow";
import "../views/products/addproduct";
import "../views/products/editproduct";

// //Cart
// import "../views/cart/cart";

// //Articles
// import "../views/articles/articles";
// import "../views/articles/articleshow";
// import "../views/articles/addarticle";
// import "../views/articles/editarticle";

// //Books
// import "../views/books/books";
// import "../views/books/bookshow";
// import "../views/books/addbook";
// import "../views/books/editbook";

//Category
import "../views/admin/ManageCategories";
import "../views/categories/addcategory";
import "../views/categories/editcategory";

//Auth
import "../views/auth/signin";
import "../views/auth/signup";

//Dashboards
import "../views/admin/admindashboard";
import "../views/user/userdashboard";
// import "../views/user/profile";

// // Admin content management
import "../views/admin/manageproducts";

import '../views/error-page/error-page'

// Restricted routes
import "../auth/privateroute";
import "../auth/adminroute";

class Routes extends LitElement {
  static get styles() {
    return css`
      div {
        width: 85%;
        margin: 5rem auto 0 auto;
      }
    `;
  }

  render() {
    return html`
      <div>
        <lit-route path="/" component="home-page"></lit-route>

        <!-- <lit-route path="/products" component="products-page"></lit-route>
        <lit-route path="/product/:slug" component="product-show"></lit-route>

        <lit-route path="/articles" component="articles-page"></lit-route>
        <lit-route path="/article/:slug" component="article-show"></lit-route>

        <lit-route path="/books" component="books-page"></lit-route>
        <lit-route path="/book/:slug" component="book-show"></lit-route>

        <lit-route path="/cart" component="cart-page"></lit-route> -->

        <lit-route path="/sign-up" component="sign-up"></lit-route>
        <lit-route path="/sign-in" component="sign-in"></lit-route>

        <lit-route component="error-page"></lit-route>

        <private-route
          path="/u/:userId"
          component="user-profile"
        ></private-route>
        <private-route
          path="/user/account"
          component="user-dashboard"
        ></private-route>
 
        <admin-route
          path="/admin/account"
          component="admin-dashboard"
        ></admin-route>
        <admin-route
          path="/admin/categories"
          component="manage-categories"
        ></admin-route>
        <admin-route
          path="/create/category"
          component="add-category"
        ></admin-route>
        <admin-route
          path="/edit/category/:slug"
          component="edit-category"
        ></admin-route>

        <admin-route
          path="/admin/products"
          component="manage-products"
        ></admin-route>
        <admin-route
          path="/create/product"
          component="add-product"
        ></admin-route>
        <admin-route
          path="/edit/product/:slug"
          component="edit-product"
        ></admin-route>
        <!-- 

        <admin-route
          path="/admin/articles"
          component="manage-articles"
        ></admin-route>
        <admin-route
          path="/create/article"
          component="add-article"
        ></admin-route>
        <admin-route
          path="/edit/article/:slug"
          component="edit-article"
        ></admin-route>

        <admin-route path="/admin/books" component="manage-books"></admin-route>
        <admin-route path="/create/book" component="add-book"></admin-route>
        <admin-route
          path="/edit/book/:slug"
          component="edit-book"
        ></admin-route> -->
      </div>
    `;
  }
}

customElements.define("router-routes", Routes);
