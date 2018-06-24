import ACTIONS from "../actions";

function modify_content(prev_state, action) {
    return {
        ...prev_state,
        id: action.id,
        content: action.content
    };
}

export default function todo(prev_state = {}, action) {
    switch(action.type){
        case ACTIONS.ADD_TODO:
        case ACTIONS.MODIFY_TODO:
            return modify_content(prev_state, action);
        default:
            return prev_state;
    }
}