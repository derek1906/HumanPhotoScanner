import * as react_redux from "react-redux";
import TodoList from "./TodoList.jsx";
import { addTodo, removeTodo } from "../actions/todos";
import { modifyTodo } from "../actions/todo";

export default react_redux.connect(state => {
    return {
        todos: state.todos
    }
}, dispatch => {
    return {
        onTodoChanged: (id, content) => {
            dispatch(modifyTodo(id, content));
        },
        onTodoAdded: (content) => {
            dispatch(addTodo(content));
        },
        onTodoRemoved: (id) => {
            dispatch(removeTodo(id));
        }
    }
})(TodoList);