import { userConstants } from "../constants";

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
