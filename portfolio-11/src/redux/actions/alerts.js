import { alertConstants } from "../constants";
export const alertActions = {
  success,
  error,
  clear,
  info,
  warning
};

function info(message, title) {
  return { type: alertConstants.INFO, message, title };
}

function warning(message, title) {
  return { type: alertConstants.WARNING, message, title };
}

function success(message, title) {
  return { type: alertConstants.SUCCESS, message, title };
}

function error(message, title) {
  return { type: alertConstants.ERROR, message, title };
}

function clear() {
  return { type: alertConstants.CLEAR };
}
