export const paymentService = {
  paymentIntent,
};

function paymentIntent(items, stripeId, email) {
  let payload = { items, customer: stripeId, email: email };
  return fetch(`${window.process.env.API_URL}/paymentintent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((result) => {
      return result.json();
    })
    .catch((err) => console.log(err));
}
