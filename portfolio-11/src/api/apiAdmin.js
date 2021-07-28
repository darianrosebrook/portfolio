const headers = token => {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  }
}
export const createCategory = (userName, token, category) => {
  return fetch(`${window.process.env.API_URL}/category/create/${userName}`, {
    method: "POST",
    headers: headers(token),
    body: category,
  }).then(res => res.json())
  .catch(err => console.log(err))
};
export const createProduct = (userName, token, product) => {
  return fetch(`${window.process.env.API_URL}/product/create/${userName}`, {
    method: "POST",
    headers: headers(token),
    body: product,
  }).then(res => res.json())
  .catch(err => console.log(err))
};
export const createArticle = (userName, token, article) => {
  return fetch(`${window.process.env.API_URL}/article/create/${userName}`, {
    method: "POST",
    headers: headers(token),
    body: article,
  }).then(res => res.json())
  .catch(err => console.log(err))
};
export const createBook = (userName, token, book) => {
  return fetch(`${window.process.env.API_URL}/book/create/${userName}`, {
    method: "POST",
    headers: headers(token),
    body: book,
  }).then(res => res.json())
  .catch(err => console.log(err))
};

export const getCategories = () => {
  return fetch(`${window.process.env.API_URL}/categories`, {
    method: "GET",
  }).then(res => res.json())
  .catch(err => console.log(err))
};
