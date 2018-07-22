"""Server"""
import time
import uuid
import logging

import flask

import entities
from initialization import app, current_sessions, db
import dbapis
import serverapis
import preprocessing


logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

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
    """Home"""
    # current_session = get_session()

    for photo in entities.RawPhoto.query.all():
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
        return serverapis.list_of_photos(already_processing_photos), 405

    # request new photos
    photos = dbapis.request_unprocessed_photos(current_session_id)

    return serverapis.list_of_photos(photos)


@app.route("/api/submit_batch", methods=["POST"])
def submit_batch():
    """Submit batch."""
    current_session = get_session()
    current_session_id = current_session["session_id"]

    payload = flask.request.get_json()

    if not isinstance(payload, (tuple, list)):
        flask.abort(400)

    submitted_batch = {photo["photo_id"]: photo for photo in payload}
    submitted_photo_ids = set(submitted_batch.keys())

    current_processing_photos = dbapis.get_current_processing_photos(current_session_id)
    current_processing_photo_ids = set(photo.id for photo in current_processing_photos)

    if submitted_photo_ids ^ current_processing_photo_ids:
        # extra photo ids
        flask.abort(400)

    try:
        serverapis.apply_update_batch(submitted_batch)
    except (KeyError, IndexError):
        # look up error
        flask.abort(400)

    return serverapis.success()


@app.route("/api/get_current_processing_batch")
def get_current_processing_batch():
    """Get current batch."""
    current_session = get_session()
    photos = dbapis.get_current_processing_photos(current_session["session_id"])

    return serverapis.list_of_photos(photos)


@app.route("/static/<path:path>")
def static_files(path):
    """Static files"""
    return flask.send_from_directory("./web/dist/static", path)


@app.route("/dynamic/rawphoto/<int:raw_photo_id>")
def get_raw_photo(raw_photo_id):
    """Return raw photo by raw photo id"""
    try:
        raw_photo = dbapis.get_raw_photo_by_id(raw_photo_id)
    except KeyError:
        flask.abort(404)

    response = flask.make_response(raw_photo.read())
    response.content_type = "image/jpeg"

    return response


@app.route("/dynamic/photo/<int:photo_id>")
def get_photo(photo_id):
    """Return photo by photo id"""
    try:
        photo = dbapis.get_cropped_photo_by_id(photo_id)
    except KeyError:
        flask.abort(404)

    response = flask.make_response(photo.read())
    response.content_type = "image/jpeg"

    return response


@app.after_request
def add_header(request):
    """Add no cache header after every request"""
    request.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    request.headers["Pragma"] = "no-cache"
    request.headers["Expires"] = "0"
    return request


if __name__ == "__main__":
    preprocessing.process_pending_photos()
    db.session.query(entities.Processing).delete()
    db.session.commit()
    app.run(debug=True, host="0.0.0.0", port=8000, threaded=True)
