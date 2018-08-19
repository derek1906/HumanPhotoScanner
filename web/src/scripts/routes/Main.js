// Core
import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router-dom";

// Material UI
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

// Custom
import TitleBar from "../components/TitleBar.js";

// Actions
import { fetchGeneralInfo } from "../actions/index";

const styles = theme => ({
    root: {
        overflowY: "scroll",
        flex: 1,
        padding: theme.spacing.unit * 2
    },
    thumbnail: {
        height: 0,
        paddingTop: "56.25%"
    }
});


class Main extends React.Component {
    componentDidMount() {
        this.props.fetchGeneralInfo();
    }

    render() {
        let { classes, generalInfo } = this.props;
        let content;

        if(!generalInfo.data || generalInfo.isFetching){
            content = (
                <Grid
                    container
                    justify="center"
                    alignItems="center"
                    style={{height: "100%"}}
                >
                    <Grid item>
                        <CircularProgress />
                    </Grid>
                </Grid>
            );
        } else {
            let unprocessedCard, processedCard;

            if(generalInfo.data.counts.unprocessed){
                unprocessedCard = (
                    <Grid item xs={12} sm>
                        <Card>
                            <CardContent>
                                <Typography gutterBottom variant="headline" component="h2">
                                    ☝️ Unprocessed Photos
                                        </Typography>
                                <Typography component="p">
                                    There are {generalInfo.data.counts.unprocessed} photos left that needs processing.
                                        </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    color="primary"
                                    onClick={() => this.props.history.push("processer")}
                                >
                                    Start a Batch
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                );
            }

            if(generalInfo.data.counts.processed){
                processedCard = (
                    <Grid item xs={12} sm>
                        <Card>
                            <CardMedia
                                className={classes.thumbnail}
                                image={`/cached/photo/${generalInfo.data.randoms.processed_photo.id}`}
                                title="Processed Photo"
                            />
                            <CardContent>
                                <Typography gutterBottom variant="headline" component="h2">
                                    🙆 Processed Photos
                                    </Typography>
                                <Typography component="p">
                                    There are {generalInfo.data.counts.processed} photos already processed.
                                    </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    color="primary"
                                    onClick={() => this.props.history.push("processed")}
                                >
                                    View
                                    </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                );
            }
            content = (
                <Grid container spacing={16}>
                    {unprocessedCard}
                    {processedCard}
                </Grid>
            );
        }

        return (
            <React.Fragment>
                <TitleBar 
                    titleText="Photos"
                    menuItems={[]}
                />
                <div className={classes.root}>
                    {content}
                </div>
            </React.Fragment>
        );
    }
}

export default compose(
    connect(state => ({
        generalInfo: state.generalInfo
    }), dispatch => ({
        fetchGeneralInfo: () => dispatch(fetchGeneralInfo())
    })), 
    withStyles(styles),
    withRouter
)(Main);