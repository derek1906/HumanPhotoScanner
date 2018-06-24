import ACTIONS from ".";

export function modifyTodo(id, content){
    return {
        type: ACTIONS.MODIFY_TODO,
        id, content
    }
}