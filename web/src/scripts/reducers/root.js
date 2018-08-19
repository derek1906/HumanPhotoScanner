import * as redux from "redux";
import actions from "../actions/index";


function generalInfo(prevState={
    isFetching: false,
    data: null
}, action){
    switch(action.type){
        case actions.REQUEST_GENERAL_INFO:
            return {
                ...prevState, 
                isFetching: true, 
                data: null
            };
        case actions.RECEIVE_GENERAL_INFO:
            return {
                ...prevState,
                isFetching: false,
                data: action.data
            };
        case actions.FAILED_RECEIVE_GENERAL_INFO:
            return {
                ...prevState,
                isFetching: false,
                data: null
            };
        default:
            return prevState;
    }
}

function rawphotoInfoRepository(prevState={}, action){
    switch (action.type) {
        case actions.REQUEST_RAWPHOTO_INFO:
            return {
                ...prevState,
                [action.id]: null
            };
        case actions.RECEIVE_RAWPHOTO_INFO:
            return {
                ...prevState,
                [action.id]: action.data
            };
        case actions.FAILED_RECEIVE_RAWPHOTO_INFO:
            let newState = {
                ...prevState,
            };
            delete newState[action.id];
            return newState;
        default:
            return prevState;
    }
}

function editor(prevState={
    activeProcessingPhotoIndex: -1,
    processingPhotos: null,
    isFetching: false
}, action){
    switch(action.type){
        case actions.EDITOR_NEXT_PAGE:
            if (prevState.processingPhotos === null || prevState.activeProcessingPhotoIndex >= prevState.processingPhotos.length - 1){
                throw new Error("Cannot go to next page");
            }
            return {
                ...prevState,
                activeProcessingPhotoIndex: prevState.activeProcessingPhotoIndex + 1
            };
        case actions.EDITOR_PREVIOUS_PAGE:
            if (prevState.processingPhotos === null || prevState.activeProcessingPhotoIndex <= 0) {
                throw new Error("Cannot go to previous page");
            }
            return {
                ...prevState,
                activeProcessingPhotoIndex: prevState.activeProcessingPhotoIndex - 1
            };
        case actions.REQUEST_NEW_BATCH:
            return {
                ...prevState,
                activeProcessingPhotoIndex: -1,
                processingPhotos: null,
                isFetching: true
            };
        case actions.RECEIVE_NEW_BATCH:
            return {
                ...prevState,
                activeProcessingPhotoIndex: 0,
                processingPhotos: action.data,
                isFetching: false
            };
        case actions.FAILED_RECEIVE_NEW_BATCH:
            return {
                ...prevState,
                activeProcessingPhotoIndex: -1,
                processingPhotos: null,
                isFetching: false
            };
        case actions.REQUEST_CANCEL_BATCH:
        case actions.FAILED_RECEIVE_CANCEL_BATCH:
            return {
                ...prevState
            };
        case actions.RECEIVE_CANCEL_BATCH:
            return editor(undefined, {});
        default:
            return prevState;
    }
}

export default redux.combineReducers({
    generalInfo,
    editor,
    rawphotoInfoRepository
});