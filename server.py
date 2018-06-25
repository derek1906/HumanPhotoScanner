"""Server"""
import time
import uuid

import flask

import entities
from initialization import app, current_sessions, db


def get_session():
    """Creates new session if not exists."""
    if "session_id" in flask.session:
        session_id = flask.session["session_id"]
        current_session = current_sessions[session_id]
    else:
        new_session_id = uuid.uuid4()
        flask.session["session_id"] = new_session_id
        current_session = {
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


@app.route("/static/<path:path>")
def static_files(path):
    return flask.send_from_directory("./web/dist/static", path)


@app.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    return r


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
