"""DB APIs"""
import os
from io import BytesIO

import PIL

from initialization import db
import entities
import image_processing

def request_unprocessed_photos(session_id, limit=5):
    """Request photos that have not been processed."""
    # pylint: disable=C0121
    photos = (entities.Photo.query
              .outerjoin(entities.Processing)
              .filter(entities.Photo.filename == None)
              .filter(entities.Processing.id == None)
              .order_by(entities.Photo.created_date)
              .limit(limit)
              .all())

    for photo in photos:
        processing = entities.Processing(
            photo=photo,
            by_session_id=session_id
        )
        db.session.add(processing)

    db.session.commit()
    return photos

def get_current_processing_photos(session_id):
    """Get current processing photos by a session."""
    return (entities.Photo.query
            .join(entities.Processing)
            .filter_by(by_session_id=session_id)
            .all())

def cancel_current_processing_photos(session_id):
    """Cancel current processing photos by a session."""
    for processing in entities.Processing.query.filter_by(by_session_id=session_id):
        db.session.delete(processing)

    db.session.commit()

def get_processed_photos(page=1, num_photos=20):
    """Get processed photos."""
    return (entities.Photo.query
            .filter(entities.Photo.filename != None)
            .paginate(page, per_page=num_photos, max_per_page=100, error_out=True))

def get_raw_photo_by_id(raw_photo_id):
    """Get raw photo by RawPhoto ID."""
    raw_photo = entities.RawPhoto.query.get(raw_photo_id)

    if raw_photo is None:
        raise KeyError(raw_photo_id)

    with open(os.path.join("raw", raw_photo.filename), "rb") as raw_photo_file:
        return BytesIO(raw_photo_file.read())

def get_cropped_photo_by_id(photo_id):
    """Get cropped photo by Photo ID."""
    photo = entities.Photo.query.get(photo_id)

    if photo is None:
        raise KeyError(photo_id)

    raw_photo = get_raw_photo_by_id(photo.source_raw_photo.id)

    cropped_photo = image_processing.crop_image(
        PIL.Image.open(raw_photo),
        (photo.top_left_x, photo.top_left_y),
        photo.rotation,
        (photo.dimension_x, photo.dimension_y)
    )

    ret = BytesIO()
    cropped_photo.save(ret, format="JPEG")
    ret.seek(0)

    return ret

def update_photo_by_id(photo_id=None, photo_attrs={}, extra_attrs={}):  # pylint: disable=W0102
    """Update photo by id or create new photo"""
    new_photo = photo_id is None

    if new_photo:
        photo = entities.Photo()
    else:
        photo = entities.Photo.query.get(photo_id)
        if photo is None:
            raise KeyError(photo_id)

    for key, value in photo_attrs.items():
        if hasattr(photo, key):
            setattr(photo, key, value)

    if new_photo:
        db.session.add(photo)
        db.session.flush()

    for key, value in extra_attrs.items():
        photo_meta = entities.PhotoMeta(photo_id=photo.id,
                                        type=key,
                                        value=value)
        db.session.merge(photo_meta)

    db.session.commit()
    return photo


def get_random_photo(is_processed=None):
    """Get random photo"""
    if is_processed is True:
        comp = lambda filename: filename != None
    elif is_processed is False:
        comp = lambda filename: filename == None
    else:
        comp = lambda _: True

    return (entities.Photo.query
            .filter(comp(entities.Photo.filename))
            .order_by(db.func.random())
            .first())
