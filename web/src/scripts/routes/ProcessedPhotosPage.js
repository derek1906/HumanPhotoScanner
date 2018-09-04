// Core
import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";

// Material UI
import { withStyles } from "@material-ui/core";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";

// Custom
import TitleBar from "../components/TitleBar";

// API
import { getProcessedPhotos } from "../api";


const styles = theme => ({
    root: {
        overflowY: "scroll",
        flex: 1,
        padding: theme.spacing.unit
    },
    thumbnail: {
        height: 0,
        paddingTop: "56.25%"
    }
});


class ProcessedPhotosPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            next_page: undefined,
            photos: []
        }
    }   

    componentDidMount(){
        getProcessedPhotos().then(({photos, next_page}) => {
            this.setState({
                next_page: next_page,
                photos: this.state.photos.concat(photos)
            });
        });
    }

    render() {
        return (
            <React.Fragment>
                <TitleBar
                    titleText="Processed Photos"
                />
                <div className={this.props.classes.root}>
                    <GridList cellHeight={160} cols={2}>
                        {
                            this.state.photos.map(photo => {
                                return (
                                    <GridListTile key={photo.id} cols={1}>
                                        <a href={`/dynamic/photo/${photo.id}`}>
                                            <img src={`/cached/photo/${photo.id}`} />
                                        </a>
                                    </GridListTile>
                                );
                            })
                        }
                    </GridList>
                </div>
            </React.Fragment>
        );
    }
};

export default compose(
    connect(
        state => ({}),
        dispatch => ({})
    ),
    withStyles(styles),
    withRouter
)(ProcessedPhotosPage);