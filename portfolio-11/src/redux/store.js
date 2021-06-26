import { createStore, compose, combineReducers } from 'redux';
import { reducer } from './reducer';
import { lazyReducerEnhancer } from 'pwa-helpers';

export const store = createStore(reducer, compose(lazyReducerEnhancer(combineReducers)));