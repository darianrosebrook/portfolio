export const userService = {
  login,
  logout,
  register,
  // getAll,
  // getById,
  read,
  update,
  updateUser,
  // delete: _delete,
};

function login(user) {
  return fetch(`${window.process.env.API_URL}/user/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then(handleResponse)
    .then((user) => {
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    });
}

function logout(next) {
  if (typeof window !== "undefined") {
    return fetch(`${window.process.env.API_URL}/user/logout`, {
      method: "GET",
    }).then(() => {
      localStorage.removeItem("user");
      next();
      return;
    });
  }
}
//
// function getAll() {
//   const requestOptions = {
//     method: "GET",
//     headers: authHeader(),
//   };
//
//   return fetch(`${config.apiUrl}/users`, requestOptions).then(handleResponse);
// }
//
// function getById(id) {
//   const requestOptions = {
//     method: "GET",
//     headers: authHeader(),
//   };
//
//   return fetch(`${config.apiUrl}/users/${id}`, requestOptions).then(
//     handleResponse
//   );
// }
//
function register(user) {
  return fetch(`${window.process.env.API_URL}/user/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then(handleResponse)
    .then((user) => {
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    });
}

function read(account) {
  return fetch(
    `${window.process.env.API_URL}/user/${account.user.publicDetails.userName}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${account.token}`,
      },
    }
  )
    .then((res) => res.json())
    .catch((err) => console.log(err));
}

function update(account, updateItems) {
  const requestOptions = {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${account.token}`,
    },
    body: JSON.stringify(updateItems),
  };

  return fetch(
    `${window.process.env.API_URL}/user/${account.user.publicDetails.userName}`,
    requestOptions
  ).then(handleResponse);
}
function updateUser(user, next) {
  console.log("update user");
  if (typeof window !== "undefined") {
    console.log("window exists");
    if (localStorage.getItem("user")) {
      console.log("user exists in local storage");
      let auth = JSON.parse(localStorage.getItem("user"));
      auth.user = user;
      localStorage.setItem("user", JSON.stringify(auth));
      next();
    }
  }
}
// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {
  const requestOptions = {
    method: "DELETE",
    headers: authHeader(),
  };

  return fetch(`${config.apiUrl}/users/${id}`, requestOptions).then(
    handleResponse
  );
}

function handleResponse(response) {
  return response.json().then((data) => {
    if (data.error) {
      const message = data.error || response.statusText;
      let errType = data.errType ? data.errType : null;
      const error = {message, errType};
      return Promise.reject(error);
    }

    return data;
  });
}
