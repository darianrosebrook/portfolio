export const productService = {
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
function getProducts() {
  return fetch(`${window.process.env.API_URL}/products`, {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
function getProduct(productSlug) {
  return fetch(`${window.process.env.API_URL}/product/${productSlug}`, {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
function updateProduct(userName, token, productSlug, product) {
  return fetch(
    `${window.process.env.API_URL}/product/${productSlug}/${userName}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: product,
    }
  )
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
function deleteProduct(productSlug, userName, token) {
  return fetch(
    `${window.process.env.API_URL}/product/${productSlug}/${userName}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
