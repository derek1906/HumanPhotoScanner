import React from "react";
import * as react_redux from "react-redux";
import PropTypes from "prop-types";

class Details extends React.Component {
    static propTypes = {
        todos: PropTypes.object.isRequired
    }

    render(){
        let numOfTodos = Object.keys(this.props.todos).length

        return (
            <React.Fragment>
                <h1>Todo Details</h1>
                <ul>
                    <li>Number of stored todos: {numOfTodos}</li>
                </ul>
            </React.Fragment>
        );
    }
};

export default react_redux.connect(state => {
    return {
        todos: state.todos
    }
}, dispatch => {
    return {};
})(Details);