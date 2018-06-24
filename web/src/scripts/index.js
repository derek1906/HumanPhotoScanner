import React from "react";
import ReactDOM from "react-dom";
import * as redux from "redux";
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';


import App from "./components/App.jsx";
import root_reducer from "./reducers/root.js";
import * as todoActions from "./actions/todos";

const store = redux.createStore(
    root_reducer,
    composeWithDevTools(
        redux.applyMiddleware(
            thunkMiddleware, 
            logger
        )
    )
);

store.dispatch(todoActions.addTodo("Hello"));
store.dispatch(todoActions.addTodo("World"));

document.addEventListener("DOMContentLoaded", () => {
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>
    , document.getElementById("root"));
});