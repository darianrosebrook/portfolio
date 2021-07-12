export const articleService = {
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
};
function getArticles() {
  return fetch(`${window.process.env.API_URL}/articles`, {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
function getArticle(articleId) {
  return fetch(`${window.process.env.API_URL}/article/${articleId}`, {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
function updateArticle(userName, token, articleId, article) {
  return fetch(
    `${window.process.env.API_URL}/article/${articleId}/${userName}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: article,
    }
  )
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
function deleteArticle(userName, token, articleId) {
  return fetch(
    `${window.process.env.API_URL}/article/${articleId}/${userName}`,
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
