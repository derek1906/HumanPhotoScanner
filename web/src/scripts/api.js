function fetchWithCredentials(url, options={}) {
    return fetch(url, {
        ...options,
        credentials: "include"
    });
}

export function getProcessedPhotos() {
    return fetchWithCredentials("/api/get_processed_photos", {
            method: "GET"
        })
        .then(res => res.json());
}

export function getGeneralInfo() {
    return fetchWithCredentials("/api/info/general")
        .then(res => res.json());
}

export function getNewProcessingBatch() {
    return fetchWithCredentials("/api/request_new_batch", {
        method: "POST"
    })
        .then(res => res.json())
}

export function requestCancelBatch() {
    return fetchWithCredentials("/api/cancel_current_processing_batch", {
        method: "POST"
    })
        .then(res => res.json())
}

export function getRawPhotoInfo(rawphoto_id) {
    return fetchWithCredentials("/api/info/rawphoto/" + encodeURIComponent(rawphoto_id))
        .then(res => res.json());
}