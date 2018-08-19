"""Server APIs"""
import json
import os
from pathlib import Path
import flask
import dbapis
import entities
from initialization import db, app

caches_photos_dir = Path()/"caches"/"photos"
caches_raw_photos_dir = Path()/"caches"/"rawphotos"

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj, "__json__"):
            return obj.__json__()
        else:
            return super().default(obj)
app.json_encoder = JSONEncoder

def success():
    """Create success JSON response"""
    return status(200, "Success.")


def status(status_code, message):
    """Create custom status JSON response"""
    return flask.jsonify({
        "status": status_code,
        "message": message
    }), status_code


def apply_update_batch(batch):
    """Apply an update batch. Raises exception and rollback if anything failed."""
    try:
        for photo_id, entry in batch.items():
            photo_attrs = entry["photo_attrs"]
            extra_attrs = entry.get("extra_attrs", {})

            photo = dbapis.update_photo_by_id(photo_id, {
                "rotation": photo_attrs["rotation"],
                "top_left_x": photo_attrs["top_left"][0],
                "top_left_y": photo_attrs["top_left"][1],
                "dimension_x": photo_attrs["dimension"][0],
                "dimension_y": photo_attrs["dimension"][1],
                "filename": "photo_%d.jpg" % photo_id
            }, extra_attrs)

            photo_process = entities.Processing.query.get(photo_id)
            db.session.delete(photo_process)

            cache_photo(photo)
    except Exception:
        db.session.rollback()
        raise

    db.session.commit()


def cache_photo(updated_photo):
    """Cache photo"""
    if not updated_photo.filename:
        raise ValueError("Input photo has not been processed")

    image_bytes = dbapis.get_cropped_photo_by_id(updated_photo.id)
    with (caches_photos_dir/updated_photo.filename).open("wb") as file:
        file.write(image_bytes.read())


def page_of_photos(page):
    """Create a page as a list of photos JSON response"""
    return flask.jsonify({
        "photos": page.items,
        "page": page.page,
        "next_page": page.next_num
    })


def get_scaled_raw_photo_bytes_by_id(raw_photo_id):
    raw_photo = entities.RawPhoto.query.get(raw_photo_id)

    if not raw_photo:
        raise KeyError(raw_photo_id)

    with (caches_raw_photos_dir/f"{raw_photo.id}.jpg").open("rb") as file:
        return file.read()


def get_photo_bytes_by_id(photo_id):
    photo = entities.Photo.query.get(photo_id)

    if not photo:
        raise KeyError(photo_id)

    if not photo.filename:
        raise ValueError("Photo has not been processed")

    with (caches_photos_dir/photo.filename).open("rb") as file:
        return file.read()


def get_general_info():
    """Get general info"""
    return {
        "counts": {
            "processed": entities.Photo.query.filter(entities.Photo.filename != None).count(),
            "unprocessed": entities.Photo.query.filter(entities.Photo.filename == None).count(),
        },
        "randoms": {
            "processed_photo": dbapis.get_random_photo(is_processed=True),
            "unprocessed_photo": dbapis.get_random_photo(is_processed=False),
        }
    }
