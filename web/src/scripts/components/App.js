import React from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import CssBaseline from '@material-ui/core/CssBaseline';

import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import HomeIcon from '@material-ui/icons/Home';
import DoneIcon from '@material-ui/icons/Done';
import RateReview from '@material-ui/icons/RateReview';

import MainPage from "../routes/Main";
import ProcessedPhotosPage from "../routes/ProcessedPhotosPage";
import PhotoProcesserPage from "../routes/PhotoProcesserPage";

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
        tabName: "Processed",
        icon: <DoneIcon />,
        pathname: "/processed"
    }, {
        tabName: "Process Batch",
        icon: <RateReview />,
        pathname: "/processer"
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
                        <Route exact path="/processed" component={ProcessedPhotosPage} />
                        <Route exact path="/processer" component={PhotoProcesserPage} />
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