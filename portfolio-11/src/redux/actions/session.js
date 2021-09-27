import { userService } from "../services/user-service.js";
import { alertActions } from "./";
const userConstants = {
  REGISTER_REQUEST: "USERS_REGISTER_REQUEST",
  REGISTER_SUCCESS: "USERS_REGISTER_SUCCESS",
  REGISTER_FAILURE: "USERS_REGISTER_FAILURE",

  LOGIN_REQUEST: "USERS_LOGIN_REQUEST",
  LOGIN_SUCCESS: "USERS_LOGIN_SUCCESS",
  LOGIN_FAILURE: "USERS_LOGIN_FAILURE",

  LOGOUT: "USERS_LOGOUT",

  GETALL_REQUEST: "USERS_GETALL_REQUEST",
  GETALL_SUCCESS: "USERS_GETALL_SUCCESS",
  GETALL_FAILURE: "USERS_GETALL_FAILURE",

  DELETE_REQUEST: "USERS_DELETE_REQUEST",
  DELETE_SUCCESS: "USERS_DELETE_SUCCESS",
  DELETE_FAILURE: "USERS_DELETE_FAILURE",
};

export const userActions = {
  login,
  logout,
  register,
  getAll,
  delete: _delete,
};

let account = JSON.parse(localStorage.getItem("user"));
const initialState = account ? { loggedIn: true, account } : {};

export function authentication(state = initialState, action) {
  switch (action.type) {
    case userConstants.LOGIN_REQUEST:
      return {
        loggingIn: true,
        account: action.user,
      };
    case userConstants.LOGIN_SUCCESS:
      return {
        loggedIn: true,
        account: action.user,
      };
    case userConstants.LOGIN_FAILURE:
      return {};
    case userConstants.LOGOUT:
      return {};
    default:
      return state;
  }
}

function login(user) {
  return (dispatch) => {
    dispatch(request(user.email));

    userService.login(user).then(
      (user) => {
        dispatch(success(user));
        dispatch(alertActions.success("Login successful", 'Success'));
      },
      (error) => {
        dispatch(failure(error));
        dispatch(alertActions.error(error, "An error occured"));
      }
    );
  };

  function request(user) {
    return { type: userConstants.LOGIN_REQUEST, user };
  }
  function success(user) {
    return { type: userConstants.LOGIN_SUCCESS, user };
  }
  function failure(error) {
    return { type: userConstants.LOGIN_FAILURE, error };
  }
}

function logout(next) {
  return (dispatch) => {
    userService.logout(next).then((success) => {
      dispatch(logout(success));
      dispatch(alertActions.success("Successfully logged out", "Success"));
    });
    function logout(success) {
      return { type: userConstants.LOGOUT };
    }
  };
}

function register(user) {
  return (dispatch) => {
    dispatch(request(user));

    userService.register(user).then(
      (user) => {
        dispatch(success());
        dispatch(alertActions.success("Registration successful", 'Success'));
      },
      (error) => {
        dispatch(failure(error.toString()));
        dispatch(alertActions.error(error.toString()));
      }
    );
  };

  function request(user) {
    return { type: userConstants.REGISTER_REQUEST, user };
  }
  function success(user) {
    return { type: userConstants.REGISTER_SUCCESS, user };
  }
  function failure(error) {
    return { type: userConstants.REGISTER_FAILURE, error };
  }
}

function getAll() {
  return (dispatch) => {
    dispatch(request());

    userService.getAll().then(
      (users) => dispatch(success(users)),
      (error) => dispatch(failure(error.toString()))
    );
  };

  function request() {
    return { type: userConstants.GETALL_REQUEST };
  }
  function success(users) {
    return { type: userConstants.GETALL_SUCCESS, users };
  }
  function failure(error) {
    return { type: userConstants.GETALL_FAILURE, error };
  }
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {
  return (dispatch) => {
    dispatch(request(id));

    userService.delete(id).then(
      (user) => dispatch(success(id)),
      (error) => dispatch(failure(id, error.toString()))
    );
  };

  function request(id) {
    return { type: userConstants.DELETE_REQUEST, id };
  }
  function success(id) {
    return { type: userConstants.DELETE_SUCCESS, id };
  }
  function failure(id, error) {
    return { type: userConstants.DELETE_FAILURE, id, error };
  }
}
