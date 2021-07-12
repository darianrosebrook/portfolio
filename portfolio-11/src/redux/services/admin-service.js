export const adminService = {
  listOrders,
  getStatusValues,
  updateOrderStatus,
};

function listOrders(userName, token) {
  return fetch(`${window.process.env.API_URL}/order/list/${userName}`, {
    method: "GET",
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
function getStatusValues(userName, token) {
  return fetch(
    `${window.process.env.API_URL}/order/status-values/${userName}`,
    {
      method: "GET",
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
function updateOrderStatus(userName, token, orderId, status) {
  return fetch(
    `${window.process.env.API_URL}/order/${orderId}/status/${userName}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, orderId }),
    }
  )
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}
// export const createCategory = (userName, token, category) => {
//   return fetch(`${window.process.env.API_URL}/category/create/${userName}`, {
//     method: "POST",
//     headers: {
//       Accept: "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: category,
//   })
//     .then((res) => {
//       return res.json();
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
// export const createProduct = (userName, token, product) => {
//   return fetch(`${window.process.env.API_URL}/product/create/${userName}`, {
//     method: "POST",
//     headers: {
//       Accept: "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: product,
//   })
//     .then((res) => {
//       return res.json();
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
// export const createArticle = (userName, token, article) => {
//   return fetch(`${window.process.env.API_URL}/article/create/${userName}`, {
//     method: "POST",
//     headers: {
//       Accept: "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: article,
//   })
//     .then((res) => {
//       return res.json();
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
// export const createBook = (userName, token, book) => {
//   return fetch(`${window.process.env.API_URL}/book/create/${userName}`, {
//     method: "POST",
//     headers: {
//       Accept: "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: book,
//   })
//     .then((res) => {
//       return res.json();
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
//
// export const getCategories = () => {
//   return fetch(`${window.process.env.API_URL}/categories`, {
//     method: "GET",
//   })
//     .then((res) => {
//       return res.json();
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
