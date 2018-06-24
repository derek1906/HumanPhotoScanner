import todo_reducer from "./todo";
import ACTIONS from "../actions";

function add_todo(prev_state, action){
    return {
        ...prev_state,
        [action.id]: todo_reducer(undefined, action)
    };
}

function modify_todo(prev_state, action){
    if (action.id in prev_state){
        return {
            ...prev_state,
            [action.id]: todo_reducer(prev_state[action.id], action)
        };
    } else {
        // uh oh
        console.warn(`Unable to modify todo with id ${action.id}.`);
        return prev_state;
    }
}

function remove_todo(prev_state, action){
    if (action.id in prev_state){
        let new_state = {...prev_state};
        delete new_state[action.id];
        return new_state;
    } else {
        // uh oh
        console.warn(`Unable to remove todo with id ${action.id}.`);
        return prev_state;
    }
}


export default function todos(prev_state = {}, action) {
    switch (action.type) {
        case ACTIONS.ADD_TODO:
            return add_todo(prev_state, action);
        case ACTIONS.MODIFY_TODO:
            return modify_todo(prev_state, action);
        case ACTIONS.REMOVE_TODO:
            return remove_todo(prev_state, action);
        default:
            return prev_state;
    }
}