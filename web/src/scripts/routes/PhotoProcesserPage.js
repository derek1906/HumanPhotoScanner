// Core
import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";

// Material UI
import { withStyles } from "@material-ui/core";
import MobileStepper from '@material-ui/core/MobileStepper';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

// Custom
import PhotoEditor from "../components/PhotoEditor";
import { editorNextPage, editorPreviousPage, fetchNewBatch, cancelBatch, updatePhoto, submitBatch } from "../actions";


const styles = theme => ({
    root: {
        overflowY: "scroll",
        flex: 1,
        padding: theme.spacing.unit,
        display: "flex",
        flexDirection: "column"
    },
    stepper: {
        
    },
    editor: {
        flex: 1
    }
});


class PhotoProcesserPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            defaultCreatedDate: {
                year: "",
                month: "",
                day: ""
            }
        };
    }

    componentDidMount() {
        let editor = this.props.editor;
        if (editor.processingPhotos === null && !editor.isFetching) {
            this.props.fetchNewBatch();
        }
    }

    renderFetching() {
        return (
            <Grid
                container
                justify="center"
                alignItems="center"
                style={{ height: "100%" }}
            >
                <Grid item>
                    <CircularProgress />
                </Grid>
            </Grid>
        );
    }

    renderNothingProcessing() {
        return (
            <Grid
                container
                justify="center"
                alignItems="center"
                style={{ height: "100%" }}
            >
                <Grid item>
                    <Typography>No available photo to process!</Typography>
                </Grid>
            </Grid>
        );
    }

    renderNothingLeftToProcess() {
        return (
            <Grid
                container
                justify="center"
                alignItems="center"
                style={{ height: "100%" }}
            >
                <Grid item>
                    <Typography>All processed! 😄</Typography>
                </Grid>
            </Grid>
        );
    }

    renderReadyContent() {
        let backButton, nextButton;
        let editor = this.props.editor;
        let activeEditingPhoto = editor.processingPhotos[editor.activeProcessingPhotoIndex];

        if (editor.activeProcessingPhotoIndex === 0) {
            backButton = (
                <Button size="small" onClick={() => {
                    this.props.cancelBatch();
                    this.props.history.push("/");
                }}>
                    Cancel
                </Button>
            );
        } else {
            backButton = (
                <Button size="small" onClick={this.props.onPreviousPhoto}>
                    <KeyboardArrowLeft /> Back
                </Button>
            );
        }

        if (editor.activeProcessingPhotoIndex === editor.processingPhotos.length - 1) {
            nextButton = (
                <Button size="small" onClick={this.props.submitBatch}>
                    Finish
                </Button>
            );
        } else {
            nextButton = (
                <Button size="small" onClick={this.props.onNextPhoto}>
                    Next <KeyboardArrowRight />
                </Button>
            );
        }

        return (
            <React.Fragment>
                <MobileStepper
                    variant="dots"
                    steps={editor.processingPhotos.length}
                    position="static"
                    activeStep={editor.activeProcessingPhotoIndex}
                    className={this.props.classes.stepper}
                    backButton={backButton}
                    nextButton={nextButton}
                />
                <PhotoEditor
                    className={this.props.classes.editor}
                    photo={activeEditingPhoto}
                    defaultCreatedDate={this.state.defaultCreatedDate}
                    onUpdate={photo => {
                        this.props.updatePhoto(editor.activeProcessingPhotoIndex, photo);

                        if (photo.date_created) {
                            this.setState({
                                defaultCreatedDate: photo.date_created
                            });
                        }
                    }}
                />
            </React.Fragment>
        );
    }

    render() {
        let content;
        if(this.props.editor.isFetching) {
            content = this.renderFetching();
        } else if (this.props.editor.processingPhotos === null) {
            content = this.renderNothingProcessing();
        } else if (!this.props.editor.processingPhotos.length) {
            content = this.renderNothingLeftToProcess();
        } else {
            content = this.renderReadyContent();
        }

        return (
            <React.Fragment>
                <div className={this.props.classes.root}>
                    {content}
                </div>
            </React.Fragment>
        );
    }
};

export default compose(
    connect(state => ({
        editor: state.editor
    }), dispatch => ({
        onNextPhoto: () => dispatch(editorNextPage()),
        onPreviousPhoto: () => dispatch(editorPreviousPage()),
        fetchNewBatch: () => dispatch(fetchNewBatch()),
        cancelBatch: () => dispatch(cancelBatch()),
        updatePhoto: (i, photo) => dispatch(updatePhoto(i, photo)),
        submitBatch: () => dispatch(submitBatch())
    })),
    withStyles(styles),
    withRouter
)(PhotoProcesserPage);