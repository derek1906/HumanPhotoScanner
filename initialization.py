"""Performs server initialization."""
import os
from flask import Flask
from flask_compress import Compress
from flask_sqlalchemy import SQLAlchemy

# pylint: disable=C0103

# Flask app
app = Flask(
    "CrowdSourcedPhotoIdentifier",
    template_folder=os.path.abspath("./web/dist/pages"),
    static_folder=None
)
app.secret_key = os.urandom(16)
app.config.update(
    SQLALCHEMY_DATABASE_URI="sqlite:///database.db",
    SQLALCHEMY_TRACK_MODIFICATIONS=False
)
Compress(app)

# Flask-SQLAlchemy instance
db = SQLAlchemy(app)

# Current session container
current_sessions = {}
