from initialization import db
import entities

def request_available_raw_photos(session_id, limit=10):
    """Request raw photos that has not been processed."""
    raw_photos = list(entities.RawPhoto.query
                      .outerjoin(entities.Processing)
                      .outerjoin(entities.ProcessedPhoto)
                      .filter((entities.Processing.id == None) &
                              (entities.ProcessedPhoto.rawphoto_id == None))
                      .limit(limit))

    for raw_photo in raw_photos:
        processing = entities.Processing(
            rawphoto_id=raw_photo.id,
            by_session_id=session_id    
        )
        db.session.add(processing)

    db.session.commit()
    return raw_photos

def get_current_processing_photos(session_id):
    """Get current processing photos by a session."""
    raw_photos = list(entities.RawPhoto.query
                      .outerjoin(entities.Processing)
                      .filter(entities.Processing.id != None)
                      .filter(entities.Processing.by_session_id == session_id))

    return raw_photos
