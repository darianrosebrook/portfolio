import { cartConstants } from "../constants";
import { alertActions } from "./alerts";

export const cartActions = {
  setCart,
  addToCart,
  editCart,
  removeFromCart,
  clearCart,
};

function setCart(cart) {
  return {
    type: cartConstants.SET_CART,
    cart,
  };
}
function addToCart(entry) {
  return (dispatch) => {
    dispatch({
      type: cartConstants.ADD_TO_CART,
      entryId: entry.item._id,
      entry,
    });
    dispatch(alertActions.success("Item added to your cart"));
  };
}

function editCart(entry) {
  return (dispatch) => {
    dispatch({
      type: cartConstants.EDIT_CART,
      entryId: entry.item._id,
      entry,
    });
  };
}

function removeFromCart(entry) {
  return (dispatch) => {
    dispatch({
      type: cartConstants.REMOVE_FROM_CART,
      entryId: entry,
      entry,
    });

    dispatch(alertActions.success("Item removed from your cart"));
  };
}

function clearCart() {
  return {
    type: cartConstants.CLEAR_CART,
  };
}
