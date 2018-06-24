import React from "react";
import List from '@material-ui/core/List';
import Todo from "./Todo.jsx";

export default class TodoList extends React.Component {
    constructor(props){
        super(props);
    }

    _get_todos(){
        return Object.keys(this.props.todos).map(id => {
            let todo = this.props.todos[id];
            return (
                <li key={id}>
                    <Todo
                        id={id}
                        onTodoChanged={this.props.onTodoChanged}
                        onTodoRemoved={this.props.onTodoRemoved}
                        content={todo.content}
                    />
                </li>
            );
        });
    }

    render(){
        return (
            <ul>
                {this._get_todos()}
                <li>
                    <Todo
                        id="-1"
                        onTodoChanged={(_, content) => this.props.onTodoAdded(content)}
                        alwaysEdit
                        placeholder="Add a todo..."
                    />
                </li>
            </ul>
        );
    }
}