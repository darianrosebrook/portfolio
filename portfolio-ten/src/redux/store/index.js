import {
  createStore,
  applyMiddleware,
  compose as origCompose,
  combineReducers,
} from 'redux';
import thunk from 'redux-thunk';
import { lazyReducerEnhancer } from 'pwa-helpers/lazy-reducer-enhancer.js';
import { alert } from '../reducers/index.js';

const compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || origCompose;

export const store = createStore(
  state => state,
  compose(lazyReducerEnhancer(combineReducers), applyMiddleware(thunk))
);

store.addReducers({ alert });
