import { cartConstants } from "../constants";
import { createSelector } from "reselect";

let items = JSON.parse(localStorage.getItem("cart"));
const initialState = items ? { cartInitialized: true, items } : {};

export const cart = (state = initialState, action) => {
  switch (action.type) {
    case cartConstants.SET_CART:
      return {
        ...action.cart,
      };
    case cartConstants.ADD_TO_CART:
    case cartConstants.EDIT_CART:
      return {
        ...state,
        items: {
          ...state.items,
          [action.entryId]: entry(state[action.entryId], action),
        },
      };
    case cartConstants.REMOVE_FROM_CART:
      const result = {
        ...state,
        items: {
          ...state.items,
        },
      };
      delete result.items[action.entryId];
      return result;
    case cartConstants.CLEAR_CART:
      return {};
    default:
      return state;
  }
};

const entry = (state = {}, action) => {
  switch (action.type) {
    case cartConstants.ADD_TO_CART:
      return {
        ...action.entry,
        quantity: (state.quantity || 0) + action.entry.quantity,
      };
    case cartConstants.EDIT_CART:
      return {
        ...action.entry,
        quantity: (state.quantity || 0) + action.entry.quantity,
      };
    default:
      return state;
  }
};

const cartSelector = (state) => state.cart;

export const numItemsSelector = createSelector(cartSelector, (cart) => {
  if (cart) {
    return Object.keys(cart).reduce((total, key) => {
      return total + cart[key].quantity;
    }, 0);
  }

  return 0;
});

export const totalSelector = createSelector(cartSelector, (cart) => {
  if (cart) {
    return Object.keys(cart).reduce((total, key) => {
      const entry = cart[key];
      return total + entry.quantity * entry.item.price;
    }, 0);
  }

  return 0;
});
