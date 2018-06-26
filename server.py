"""Server"""
import time
import uuid

import flask

import entities
from initialization import app, current_sessions, db
import dbapis

import preprocessing


def get_session():
    """Creates new session if not exists."""
    if "session_id" in flask.session:
        session_id = flask.session["session_id"]
        current_session = current_sessions[session_id]
    else:
        print("CREATING NEW UUID")
        new_session_id = str(uuid.uuid4())
        flask.session["session_id"] = new_session_id
        current_session = {
            "session_id": new_session_id,
            "creation_time": time.time()
        }
        current_sessions[new_session_id] = current_session

    current_session["last_seen"] = time.time()

    return current_session


@app.route("/")
def home():
    current_session = get_session()

    for photo in entities.RawPhoto.query:
        print(photo)

    return flask.render_template("index.html")


@app.route("/api/get_session_info")
def get_session_info():
    """Get current session info."""
    return flask.jsonify(get_session())


@app.route("/api/request_new_batch", methods=["POST"])
def request_new_batch():
    """Request next available batch."""
    current_session = get_session()
    current_session_id = current_session["session_id"]

    already_processing_photos = dbapis.get_current_processing_photos(current_session_id)
    if already_processing_photos:
        # is already processing some photos
        return flask.jsonify([{
            "id": raw_photo.id,
            "filename": raw_photo.filename
        } for raw_photo in already_processing_photos]), 405

    # request new photos
    raw_photos = dbapis.request_available_raw_photos(current_session_id)

    return flask.jsonify([{
        "id": raw_photo.id,
        "filename": raw_photo.filename
    } for raw_photo in raw_photos])


@app.route("/api/get_current_processing_batch")
def get_current_processing_batch():
    """Get current batch."""
    current_session = get_session()
    raw_photos = dbapis.get_current_processing_photos(current_session["session_id"])

    return flask.jsonify([{
        "id": raw_photo.id,
        "filename": raw_photo.filename
    } for raw_photo in raw_photos])


@app.route("/static/<path:path>")
def static_files(path):
    return flask.send_from_directory("./web/dist/static", path)


@app.route("/rawphoto/<int:raw_photo_id>")
def get_raw_photo(raw_photo_id):
    raw_photos = list(entities.RawPhoto.query.filter(entities.RawPhoto.id == raw_photo_id))
    
    if not raw_photos:
        flask.abort(404)
        return
        
    return flask.send_from_directory("./raw", raw_photos[0].filename)


@app.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    return r


if __name__ == "__main__":
    entities.Processing.query.delete()
    entities.Photo.query.delete()
    preprocessing.process_pending_photos()
    app.run(debug=True, host="0.0.0.0", port=8000)
