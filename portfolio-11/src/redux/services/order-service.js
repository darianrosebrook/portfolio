export const orderService = {
  createOrder,
  getPurchaseHistory,
};

function createOrder(userName, token, createOrderData) {
  return fetch(`${window.process.env.API_URL}/order/create/${userName}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      order: createOrderData,
    }),
  })
    .then((data) => data.json())
    .catch((err) => console.log(err));
}
function getPurchaseHistory(userName, token) {
  return fetch(`${window.process.env.API_URL}/orders/by/user/${userName}`, {
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
