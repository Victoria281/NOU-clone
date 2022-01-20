// @ts-nocheck

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import rootReducers from "./store/reducer/index";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import { store } from "./store/store"
// const store = createStore(rootReducers, applyMiddleware(thunk));

const loader = document.querySelector('.loader');
const hideLoader = () => loader.hidden = true;

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App
        hideLoader={hideLoader}
      />
    </Provider>
  </React.StrictMode>
  ,
  document.getElementById('root')
)