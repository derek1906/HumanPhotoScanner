import React from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import CssBaseline from '@material-ui/core/CssBaseline';

import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import HomeIcon from '@material-ui/icons/Home';
import InsertChartIcon from '@material-ui/icons/InsertChart';

import MainPage from "../routes/Main";
import DetailsPage from "../routes/Details";

class App extends React.Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    static tabIndices = [{
        tabName: "Home",
        icon: <HomeIcon />,
        pathname: "/"
    }, {
        tabName: "Details",
        icon: <InsertChartIcon />,
        pathname: "/details"
    }]

    getCurrentTabIndex(){
        return App.tabIndices.findIndex(e => e.pathname == this.props.location.pathname);
    }

    setCurrentTabByIndex(index) {
        this.props.history.push(App.tabIndices[index].pathname);
    }

    render() {
        return (
            <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
                <CssBaseline />
                <div style={{display: "flex", flexDirection: "column", flex: 1}}>
                    <Switch>
                        <Route exact path="/" component={MainPage} />
                        <Route exact path="/details" component={DetailsPage} />
                    </Switch>
                </div>
                <BottomNavigation
                    value={this.getCurrentTabIndex()}
                    onChange={(event, value) => this.setCurrentTabByIndex(value)}
                    showLabels
                >
                    {
                        App.tabIndices.map((e, i) => {
                            return <BottomNavigationAction key={i} label={e.tabName} icon={e.icon} />;
                        })
                    }
                </BottomNavigation>
            </div>
        );
    }
}

export default withRouter(App);