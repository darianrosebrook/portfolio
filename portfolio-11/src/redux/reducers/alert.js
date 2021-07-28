const alertConstants = {
  SUCCESS: "ALERT_SUCCESS",
  ERROR: "ALERT_ERROR",
  CLEAR: "ALERT_CLEAR",
};

export function alert(state = {}, action) {
  switch (action.type) {
    case alertConstants.SUCCESS:
      return {
        type: "success",
        message: action.message,
        title: action.title
      };
    case alertConstants.ERROR:
      return {
        type: "danger",
        message: action.message,
        title: action.title
      };
    case alertConstants.CLEAR:
      return {};
    default:
      return state;
  }
}
