import React from "react";
import { HashRouter, Route } from "react-router-dom";
import CssBaseline from '@material-ui/core/CssBaseline';


import MainPage from "../routes/Main";
import DetailsPage from "../routes/Details";

export default class App extends React.Component {
    render() {
        return (
            <HashRouter>
                <React.Fragment>
                    <CssBaseline />
                    <Route exact path="/" component={MainPage} />
                    <Route exact path="/details" component={DetailsPage} />
                </React.Fragment>
            </HashRouter>
        );
    }
}