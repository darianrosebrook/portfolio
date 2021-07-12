export const bookService = {
  getBooks,
  getBook,
  updateBook,
  deleteBook,
};
function getBooks() {
  return fetch(`${window.process.env.API_URL}/books`, {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
function getBook(bookId) {
  return fetch(`${window.process.env.API_URL}/book/${bookId}`, {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
function updateBook(userName, token, bookId, book) {
  return fetch(`${window.process.env.API_URL}/book/${bookId}/${userName}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: book,
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
function deleteBook(userName, token, bookId) {
  return fetch(`${window.process.env.API_URL}/book/${bookId}/${userName}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
