import React from "react";
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Todo from "./Todo.jsx";

export default class TodoList extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            editingTodo: null
        }
    }

    _get_todos(){
        return Object.keys(this.props.todos).map(id => {
            let todo = this.props.todos[id];
            return (
                <Todo
                    key={id}
                    id={id}
                    content={todo.content}
                    onClick={() => this.openTodoEditDialog(todo)}
                />
            );
        });
    }

    openTodoEditDialog(todo){
        this.setState({
            editingTodo: {...todo}
        });
    }

    closeTodoEditDialog(){
        this.setState({
            editingTodo: null
        });
    }

    modifyTodo(editingTodo){
        this.props.onTodoChanged(editingTodo.id, editingTodo.content);
    }

    render(){
        return (
            <React.Fragment>
                <List>
                    {this._get_todos()}
                </List>
                <Dialog
                    open={!!this.state.editingTodo}
                    onClose={() => this.closeTodoEditDialog()}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle>Edit todo</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Enter a new todo message.</DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Message"
                            type="text"
                            fullWidth
                            value={this.state.editingTodo ? this.state.editingTodo.content : ""}
                            onChange={event => {this.setState({
                                editingTodo: {
                                    ...this.state.editingTodo,
                                    content: event.target.value
                                }
                            })}}
                            onKeyDown={event => {
                                if(event.keyCode !== 13)    return;
                                this.modifyTodo(this.state.editingTodo);
                                this.closeTodoEditDialog();
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.closeTodoEditDialog()} color="primary">
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                this.modifyTodo(this.state.editingTodo);
                                this.closeTodoEditDialog();
                            }}
                            color="primary"
                        >
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}