export const signup = (user) => {
  return fetch(`${window.process.env.API_URL}/user/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  }).then(res => res.json)
  .catch(err => console.log(err))
};
export const login = (user) => {
  return fetch(`${window.process.env.API_URL}/user/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  }).then(res => res.json)
  .catch(err => console.log(err))
};
export const authenticate = (data, next) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(data));
    next();
  }
};
export const logout = (next) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    next();
    return fetch(`${window.process.env.API_URL}/user/logout`, {
      method: "GET",
    })
      .then(res => console.log("signout", res.json))
      .catch(err => console.log(err))
  }
};
export const isAuthenticated = () => {
  if (typeof window == "undefined") {
    return false;
  }
  if (localStorage.getItem("user")) {
    return JSON.parse(localStorage.getItem("user"));
  } else {
    return false;
  }
};
