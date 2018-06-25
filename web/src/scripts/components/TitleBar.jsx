import React from "react";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";

export default class TitleBar extends React.Component {
    static propTypes = {
        menuItems: PropTypes.arrayOf(PropTypes.shape({
            text: PropTypes.string,
            icon: PropTypes.any,
            onClick: PropTypes.func
        })),
        titleText: PropTypes.string.isRequired
    }

    static defaultProps = {
        menuItems: []
    }

    render() {
        let menuButtons = this.props.menuItems.map((item, i) => {
            return (
                <IconButton
                    key={i}
                    color="inherit"
                    aria-label={item.text}
                    onClick={item.onClick}
                >
                    {item.icon}
                </IconButton>
            );
        });

        return (
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="title" color="inherit" style={{ flex: 1 }}>{this.props.titleText}</Typography>
                    {menuButtons}
                </Toolbar>
            </AppBar>
        );
    }
}