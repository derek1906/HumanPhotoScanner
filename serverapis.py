"""Server APIs"""
import flask
import dbapis
import entities
from initialization import db

def success():
    return flask.jsonify({
        "status": "OK"
    })

def list_of_photos(photos):
    return flask.jsonify({
        "photos": [{
            "id": photo.id,
            "raw_photo_id": photo.source_raw_photo.id
        } for photo in photos]
    })

def apply_update_batch(batch):
    try:
        for photo_id, entry in batch.items():
            photo_attrs = entry["photo_attrs"]
            extra_attrs = entry.get("extra_attrs", {})

            dbapis.update_photo_by_id(photo_id, {
                "rotation": photo_attrs["rotation"],
                "top_left_x": photo_attrs["top_left"][0],
                "top_left_y": photo_attrs["top_left"][1],
                "dimension_x": photo_attrs["dimension"][0],
                "dimension_y": photo_attrs["dimension"][1],
            }, extra_attrs)

            photo_process = entities.Processing.query.get(photo_id)
            db.session.delete(photo_process)
    except Exception:
        db.session.rollback()
        raise
        
    db.session.commit()
