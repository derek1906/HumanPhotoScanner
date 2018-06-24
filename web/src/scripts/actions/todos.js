import ACTIONS from ".";

let next_available_todo_id = 0;
export function addTodo(content){
    return {
        type: ACTIONS.ADD_TODO,
        id: (next_available_todo_id++).toString(),
        content
    };
}

export function removeTodo(id){
    return {
        type: ACTIONS.REMOVE_TODO,
        id
    }
}