import React from "react";
import ReactDOM from "react-dom";
import * as redux from "redux";
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import { HashRouter } from "react-router-dom";

import App from "./components/App";
import root_reducer from "./reducers/root";

const store = redux.createStore(
    root_reducer,
    composeWithDevTools(
        redux.applyMiddleware(
            thunkMiddleware, 
            logger
        )
    )
);

document.addEventListener("DOMContentLoaded", () => {
    ReactDOM.render(
        <Provider store={store}>
            <HashRouter>
                <App />
            </HashRouter>
        </Provider>
    , document.getElementById("root"));
});