export const getProducts = (sortBy) => {
  return fetch(
    `${window.process.env.API_URL}/products?sortBy=${sortBy}&order=desc&limit=6`,
    {method: "GET",}
  ).then(response => response.json())
    .catch(err => console.log(err));
};
export const getArticles = (sortBy) => {
  return fetch(
    `${window.process.env.API_URL}/articles?sortBy=${sortBy}&order=desc&limit=6`,
    {method: "GET",}
  ).then(response => response.json())
   .catch(err => console.log(err));
};
export const getBooks = (sortBy) => {
  return fetch(`${window.process.env.API_URL}/books`, {
    method: "GET",
  }
  ).then(response => response.json())
   .catch(err => console.log(err));
};

export const getCategories = () => {
  return fetch(`${window.process.env.API_URL}/categories`, 
  {method: "GET",}
  ).then(response => response.json())
   .catch(err => console.log(err));
};

export const getFilteredProducts = (skip, limit, filters = {}) => {
  const data = {
    limit,
    skip,
    filters,
  };
  return fetch(`${window.process.env.API_URL}/products/by/search`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }
  ).then(response => response.json())
  .catch(err => console.log(err));
};
export const list = (params) => {
  return fetch(`${window.process.env.API_URL}/search?search=${params.search}`, {
    method: "GET",
  }).then(response => response.json())
  .catch(err => console.log(err));
};
export const read = (folder, slug) => {
  return fetch(`${window.process.env.API_URL}/${folder}/${slug}`, {
    method: "GET",
  }).then(response => response.json())
  .catch(err => console.log(err));
};
