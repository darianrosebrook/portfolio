import {
  RECEIVE_CATEGORIES,
  RECEIVE_CATEGORY_ITEMS,
  FAIL_CATEGORY_ITEMS,
  REQUEST_CATEGORY_ITEMS,
} from "../actions/categories.js";
import { createSelector } from "reselect";

const categories = (state = {}, action) => {
  switch (action.type) {
    case RECEIVE_CATEGORIES:
      return {
        ...state,
        ...action.categories,
      };
    case REQUEST_CATEGORY_ITEMS:
    case RECEIVE_CATEGORY_ITEMS:
    case FAIL_CATEGORY_ITEMS:
      const categoryId = action.categoryId;
      return {
        ...state,
        [categoryId]: category(state[categoryId], action),
      };
    default:
      return state;
  }
};

const category = (state = {}, action) => {
  switch (action.type) {
    case REQUEST_CATEGORY_ITEMS:
      return {
        ...state,
        failure: false,
        isFetching: true,
      };
    case RECEIVE_CATEGORY_ITEMS:
      return {
        ...state,
        failure: false,
        isFetching: false,
        items: {
          ...action.items.reduce((obj, item) => {
            obj[item.name] = item;
            return obj;
          }, {}),
        },
      };
    case FAIL_CATEGORY_ITEMS:
      return {
        ...state,
        failure: true,
        isFetching: false,
      };
    default:
      return state;
  }
};

export default categories;

const categoriesSelector = (state) => state.categories;

const categoryNameSelector = (state) => state.app.categoryName;

export const currentCategorySelector = createSelector(
  categoriesSelector,
  categoryNameSelector,
  (categories, categoryName) =>
    categories && categoryName ? categories[categoryName] : null
);

const itemNameSelector = (state) => state.app.itemName;

export const currentItemSelector = createSelector(
  currentCategorySelector,
  itemNameSelector,
  (category, itemName) =>
    category && category.items && itemName ? category.items[itemName] : null
);
