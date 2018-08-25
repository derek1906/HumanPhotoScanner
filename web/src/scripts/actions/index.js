import { getGeneralInfo, getNewProcessingBatch, requestCancelBatch, getRawPhotoInfo, postBatch } from "../api";

let ACTIONS = {
    REQUEST_GENERAL_INFO: "REQUEST_GENERAL_INFO",
    RECEIVE_GENERAL_INFO: "RECEIVE_GENERAL_INFO",
    FAILED_RECEIVE_GENERAL_INFO: "RECEIVE_GENERAL_INFO",

    REQUEST_NEW_BATCH: "REQUEST_NEW_BATCH",
    RECEIVE_NEW_BATCH: "RECEIVE_NEW_BATCH",
    FAILED_RECEIVE_NEW_BATCH: "RECEIVE_NEW_BATCH",

    REQUEST_CANCEL_BATCH: "REQUEST_CANCEL_BATCH",
    RECEIVE_CANCEL_BATCH: "RECEIVE_CANCEL_BATCH",
    FAILED_RECEIVE_CANCEL_BATCH: "FAILED_RECEIVE_CANCEL_BATCH",

    REQUEST_RAWPHOTO_INFO: "REQUEST_RAWPHOTO_INFO",
    RECEIVE_RAWPHOTO_INFO: "RECEIVE_RAWPHOTO_INFO",
    FAILED_RECEIVE_RAWPHOTO_INFO: "FAILED_RECEIVE_RAWPHOTO_INFO",

    EDITOR_PREVIOUS_PAGE: "EDITOR_PREV_PAGE",
    EDITOR_PREVIOUS_PAGE: "EDITOR_PREV_PAGE",
    EDITOR_NEXT_PAGE: "EDITOR_NEXT_PAGE",

    UPDATE_PHOTO: "UPDATE_PHOTO"
};

export default ACTIONS;

export function fetchGeneralInfo(){
    return dispatch => {
        dispatch({
            type: ACTIONS.REQUEST_GENERAL_INFO
        });

        return getGeneralInfo().then(res => {
            dispatch({
                type: ACTIONS.RECEIVE_GENERAL_INFO,
                data: res
            });
        }, err => {
            dispatch({
                type: ACTIONS.FAILED_RECEIVE_GENERAL_INFO
            });
        });
    };
}

export function fetchNewBatch() {
    return dispatch => {
        dispatch({
            type: ACTIONS.REQUEST_NEW_BATCH
        });

        return getNewProcessingBatch().then(res => {
            dispatch({
                type: ACTIONS.RECEIVE_NEW_BATCH,
                data: res
            });
        }, err => {
            dispatch({
                type: ACTIONS.FAILED_RECEIVE_NEW_BATCH
            });
        });
    };
}

export function submitBatch() {
    return (dispatch, getState) => {
        let { editor } = getState();
        let batch = editor.processingPhotos.map(photo => {
            return {
                photo_id: photo.id,
                photo_attrs: {
                    rotation: photo.transformation.rotation,
                    top_left: photo.transformation.top_left,
                    dimensions: photo.transformation.dimensions
                },
                extra_attrs: {}
            };
        });

        return postBatch(batch).then(res => {
            // reset current processing photos
            dispatch({
                type: ACTIONS.RECEIVE_CANCEL_BATCH
            });
            // fetch new batch
            dispatch(fetchNewBatch());
        }, err => {
            // todo: handle error
            console.log(err);
        });
    };
}

export function cancelBatch() {
    return dispatch => {
        dispatch({
            type: ACTIONS.REQUEST_CANCEL_BATCH
        });

        return requestCancelBatch().then(res => {
            dispatch({
                type: ACTIONS.RECEIVE_CANCEL_BATCH
            });
        }, err => {
            dispatch({
                type: ACTIONS.FAILED_RECEIVE_CANCEL_BATCH
            });
        });
    };
}

export function fetchRawPhotoInfo(rawphoto_id) {
    return (dispatch, state) => {
        if(
            state.rawphotoInfoRepository &&
            state.rawphotoInfoRepository[rawphoto_id.toString()]
        ){
            dispatch({
                type: ACTIONS.RECEIVE_RAWPHOTO_INFO,
                id: rawphoto_id,
                data: state.rawphotoInfoRepository[rawphoto_id.toString()]
            });
            return;
        }

        dispatch({
            type: ACTIONS.REQUEST_RAWPHOTO_INFO,
            id: rawphoto_id
        });

        return getRawPhotoInfo(rawphoto_id).then(res => {
            dispatch({
                type: ACTIONS.RECEIVE_RAWPHOTO_INFO,
                id: rawphoto_id,
                data: res
            });
        }, err => {
            dispatch({
                type: ACTIONS.FAILED_RECEIVE_RAWPHOTO_INFO,
                id: rawphoto_id
            });
        });
    };
}

export function editorPreviousPage() {
    return {
        type: ACTIONS.EDITOR_PREVIOUS_PAGE
    };
}

export function editorNextPage() {
    return {
        type: ACTIONS.EDITOR_NEXT_PAGE
    };
}

export function updatePhoto(i, photo) {
    return {
        type: ACTIONS.UPDATE_PHOTO,
        index: i,
        photo: photo
    };
}