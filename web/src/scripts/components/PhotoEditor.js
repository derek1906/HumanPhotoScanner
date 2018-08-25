import React from "react";
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from "react-redux";
import { compose } from "redux";
import { fetchRawPhotoInfo } from "../actions";

// Material UI
import { withStyles } from "@material-ui/core";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import RotateRight from '@material-ui/icons/RotateRight';
import RotateLeft from '@material-ui/icons/RotateLeft';


import { withContentRect } from 'react-measure';

import Vector from "../vector";


const classes = {
    root: {
        display: "flex",
        overflow: "hidden",
        flex: 1
    },
    rawphotoContainter: {
        display: "flex",
        flex: 1,
        alignSelf: "stretch"
    },
    rawphoto: {
        
    }
};

function computeTransformation(inputs) {
    let halfWidth = new Vector(1, 0).scale(inputs.width / 2).rotate(inputs.angle),
        halfHeight = new Vector(0, 1).scale(inputs.height / 2).rotate(inputs.angle);

    let center = new Vector(inputs.top_left_x, inputs.top_left_y).add(halfWidth).add(halfHeight);

    let scale;
    let boundingBox = {};
    if (inputs.width / inputs.window_width > inputs.height / inputs.window_height) {
        scale = inputs.window_width / inputs.width;
        boundingBox.position = [0, (inputs.window_height - inputs.height * scale) / 2];
    } else {
        scale = inputs.window_height / inputs.height;
        boundingBox.position = [(inputs.window_width - inputs.width * scale) / 2, 0];
    }
    boundingBox.dimensions = [inputs.width * scale, inputs.height * scale];

    return {
        translate: {
            x: (inputs.window_width / 2 - center.x),
            y: (inputs.window_height / 2 - center.y)
        },
        rotate: inputs.angle,
        scale: scale,
        center: center,
        boundingBox: boundingBox
    };
}

class PhotoOverlay extends React.Component {
    static propTypes = {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        boxPosition: PropTypes.arrayOf(PropTypes.number),
        innerWidth: PropTypes.number.isRequired,
        innerHeight: PropTypes.number.isRequired
    };

    static makeRect(initial, width, height, reverse=false) {
        let lines = [
            [width, 0],
            [0, height],
            [-width, 0],
            [0, -height]
        ]
        if (reverse) {
            lines.reverse();
            lines = lines.map(line => [line[0] * -1, line[1] * -1]);
        }

        return `M${initial[0]},${initial[1]}` + lines.map(line => `l${line[0]},${line[1]}`).join("") + "z";
    }

    render() {
        let pathString = PhotoOverlay.makeRect([0, 0], this.props.width, this.props.height) + 
                         PhotoOverlay.makeRect(this.props.boxPosition, this.props.innerWidth, this.props.innerHeight, true);

        return (
            <svg
                style={this.props.style}
                width={this.props.width}
                height={this.props.height}
            >
                <g fillRule="evenodd" fill="rgba(255, 255, 255, 0.9)">
                    <path d={pathString} />
                </g>
            </svg>
        );
    }
}

class PhotoEditingField extends React.Component {
    static propTypes = {
        contentRect: PropTypes.shape({
            client: PropTypes.shape({
                width: PropTypes.number,
                height: PropTypes.number,
            }).isRequired
        }).isRequired,
        rawphoto: PropTypes.object.isRequired,
        photo: PropTypes.object.isRequired,
        onUpdate: PropTypes.func
    };

    static defaultProps = {
        onUpdate: () => {}
    };

    computeTransformString() {
        let containerRect = this.props.contentRect.client;
        let photoTransformation = this.props.photo.transformation;

        let actual = computeTransformation({
            top_left_x: photoTransformation.top_left[0],
            top_left_y: photoTransformation.top_left[1],
            angle: photoTransformation.rotation,
            width: photoTransformation.dimensions[0],
            height: photoTransformation.dimensions[1],
            window_width: containerRect.width,
            window_height: containerRect.height
        }, this.props.myscale);

        let m = [
            [Math.cos(actual.rotate) * actual.scale, Math.sin(actual.rotate) * actual.scale, actual.translate.x],
            [-Math.sin(actual.rotate) * actual.scale, Math.cos(actual.rotate) * actual.scale, actual.translate.y]
        ];

        return {
            transformOrigin: `${actual.center.x}px ${actual.center.y}px`,
            transform: `matrix(${m[0][0]}, ${m[1][0]}, ${m[0][1]}, ${m[1][1]}, ${m[0][2]}, ${m[1][2]})`,
            boundingBox: actual.boundingBox
        };
    }

    rotateCounterClockwise() {
        let fullWidth = new Vector(1, 0).scale(this.props.photo.transformation.dimensions[0]).rotate(this.props.photo.transformation.rotation);

        let newTopLeft = new Vector(this.props.photo.transformation.top_left[0], this.props.photo.transformation.top_left[1])
            .add(fullWidth);
        let newRotation = this.props.photo.transformation.rotation + Math.PI / 2;

        this.props.onUpdate({
            ...this.props.photo,
            transformation: {
                ...this.props.photo.transformation,
                dimensions: [this.props.photo.transformation.dimensions[1], this.props.photo.transformation.dimensions[0]],
                rotation: newRotation,
                top_left: [newTopLeft.x, newTopLeft.y]
            }
        });
    }

    rotateClockwise() {
        let fullHeight = new Vector(0, 1).scale(this.props.photo.transformation.dimensions[1]).rotate(this.props.photo.transformation.rotation);

        let newTopLeft = new Vector(this.props.photo.transformation.top_left[0], this.props.photo.transformation.top_left[1])
            .add(fullHeight);
        let newRotation = this.props.photo.transformation.rotation - Math.PI / 2;

        this.props.onUpdate({
            ...this.props.photo,
            transformation: {
                ...this.props.photo.transformation,
                dimensions: [this.props.photo.transformation.dimensions[1], this.props.photo.transformation.dimensions[0]],
                rotation: newRotation,
                top_left: [newTopLeft.x, newTopLeft.y]
            }
        });
    }

    render() {
        let content;
        if (Object.keys(this.props.contentRect.client).length){
            let {transform, transformOrigin, boundingBox} = this.computeTransformString();
            content = (
                <React.Fragment>
                    <img
                        //src={`/dynamic/rawphoto/${this.props.rawphoto.id}`}
                        src={`/cached/rawphoto/${this.props.rawphoto.id}`}
                        style={{
                            width: this.props.rawphoto.dimensions[0],
                            height: this.props.rawphoto.dimensions[1],
                            position: "absolute",
                            top: 0,
                            left: 0,
                            transition: "transform 0.3s ease",
                            transform,
                            transformOrigin
                        }}
                    />
                    <PhotoOverlay
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0
                        }}
                        width={this.props.contentRect.client.width}
                        height={this.props.contentRect.client.height}
                        innerWidth={boundingBox.dimensions[0]}
                        innerHeight={boundingBox.dimensions[1]}
                        boxPosition={boundingBox.position}
                    />
                </React.Fragment>
            );
        }

        let chips = this.props.photo.meta.map(({type, value}, i) => {
            return (
                <Chip
                    key={i}
                    label={`${type}: ${value}`}
                    className={classes.chip}
                />
            );
        });

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    flex: 1
                }}
            >
                <div 
                    ref={this.props.measureRef} 
                    style={{
                        width: "100%",
                        position: "relative",
                        flex: 1,
                        overflow: "hidden"
                    }}
                >
                    {content}
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row"
                    }}
                >
                    <div>{chips}</div>
                    <div style={{flex: 1}} />
                    <div>
                        <IconButton
                            aria-label="Rotate Clockwise"
                            onClick={() => this.rotateClockwise()}
                        >
                            <RotateRight />
                        </IconButton>
                        <IconButton
                            aria-label="Rotate Counter Clockwise"
                            onClick={() => this.rotateCounterClockwise()}
                        >
                            <RotateLeft />
                        </IconButton>
                    </div>
                </div>
            </div>
        );
    }
}
PhotoEditingField = compose(
    withStyles(theme => ({
        chip: {
            margin: theme.spacing.unit,
        }
    })),
    withContentRect("client")
)(PhotoEditingField);

class PhotoEditor extends React.Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        photo: PropTypes.shape({
            id: PropTypes.number.isRequired,
            rawphoto_id: PropTypes.number.isRequired,
            meta: PropTypes.arrayOf(PropTypes.shape({
                type: PropTypes.string.isRequired,
                value: PropTypes.string.isRequired
            })),
            transformation: PropTypes.shape({
                rotation: PropTypes.number.isRequired,
                top_left: PropTypes.arrayOf(PropTypes.number).isRequired,
                dimensions: PropTypes.arrayOf(PropTypes.number).isRequired
            }).isRequired
        }),
        onUpdate: PropTypes.func,
        classes: PropTypes.object
    }

    static defaultProps = {
        onUpdate: () => {}
    }

    componentDidMount() {
        let rawphoto_id = this.props.photo.rawphoto_id;
        let rawphotoInfoRepository = this.props.rawphotoInfoRepository;
        if (!rawphotoInfoRepository.hasOwnProperty(rawphoto_id.toString())) {
            this.props.requestRawPhotoInfo(rawphoto_id);
        }
    }

    componentDidUpdate() {
        let rawphoto_id = this.props.photo.rawphoto_id;
        let rawphotoInfoRepository = this.props.rawphotoInfoRepository;
        if (!rawphotoInfoRepository.hasOwnProperty(rawphoto_id.toString())){
            this.props.requestRawPhotoInfo(rawphoto_id);
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

    renderEditor() {
        return <PhotoEditingField
            rawphoto={this.props.rawphotoInfoRepository[this.props.photo.rawphoto_id.toString()]}
            photo={this.props.photo}
            onUpdate={this.props.onUpdate}
        />
    }

    render() {
        const rootClassName = classNames(
            this.props.classes.root,
            this.props.className
        );

        let rawphoto_id = this.props.photo.rawphoto_id;
        let rawphotoInfoRepository = this.props.rawphotoInfoRepository;

        let status, content;
        if (!rawphotoInfoRepository.hasOwnProperty(rawphoto_id.toString())) {
            // not ready
            status = "not ready";
        } else if (
            rawphotoInfoRepository[rawphoto_id.toString()] === null ||
            rawphotoInfoRepository[rawphoto_id.toString()] === undefined
        ) {
            // loading
            status = "loading";
        } else {
            status = "ready";
        }

        switch(status) {
            case "not ready":
            case "loading":
                content = this.renderFetching();
                break;
            case "ready":
                content = this.renderEditor();
        }
        
        return (
            <div className={rootClassName}>
                {content}
            </div>
        );
    }
}

export default compose(
    withStyles(classes),
    connect(state => ({
        rawphotoInfoRepository: state.rawphotoInfoRepository
    }), dispatch => ({
        requestRawPhotoInfo: id => dispatch(fetchRawPhotoInfo(id))
    }))
)(PhotoEditor);