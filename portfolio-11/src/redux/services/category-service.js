export const categoryService = {
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
function getCategories() {
  return fetch(`${window.process.env.API_URL}/categories`, {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
function getCategory(categoryId) {
  return fetch(`${window.process.env.API_URL}/category/${categoryId}`, {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
function updateCategory(userName, token, categoryId, category) {
  return fetch(
    `${window.process.env.API_URL}/category/${categoryId}/${userName}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: category,
    }
  )
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
function deleteCategory(category, userName, token) {
  return fetch(
    `${window.process.env.API_URL}/category/${category}/${userName}`,
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
