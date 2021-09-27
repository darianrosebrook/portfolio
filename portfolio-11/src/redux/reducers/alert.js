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
        message: action.message.message.toString(),
        title: action.title
      };
    case alertConstants.ERROR:
      return {
        type: "danger",
        message: action.message.message.toString(),
        errType: action.message.errType ? action.message.errType.toString() : null,
        title: action.title
      };
    case alertConstants.CLEAR:
      return {};
    default:
      return state;
  }
}
