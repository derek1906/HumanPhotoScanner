import React from 'react';
import PropTypes from 'prop-types';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';


export default class Todo extends React.Component {
    constructor(props){
        super(props);
    }

    static propTypes = {
        id: PropTypes.string.isRequired,
        content: PropTypes.string,
        onClick: PropTypes.func
    }

    static defaultProps = {
        content: ""
    }

    render(){
        let listItemText;
        if (this.props.content) {
            listItemText = <ListItemText primary={this.props.content} />;
        } else {
            listItemText = <ListItemText primary={"(empty)"} primaryTypographyProps={{
                color: "textSecondary"
            }} />;
        }

        return (
            <ListItem button onClick={this.props.onClick}>
                {listItemText}
            </ListItem>
        )
    }

}