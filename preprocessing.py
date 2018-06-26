import os
import entities
from initialization import db
import image_processing
from pprint import pprint

def process_pending_photos():
    """Process pending photos."""
    new_raw_photos = []
    pending_files = os.listdir("./pending")

    for i, filename in enumerate(pending_files):
        source_filename = os.path.join("./pending", filename)
        target_filename = os.path.join("./raw", filename)

        if os.path.isfile(target_filename):
            raise OSError("Destination already exists")

        # move to /raw
        os.rename(source_filename, target_filename)
        # create a new RawPhoto
        raw_photo = entities.RawPhoto(filename=filename)
        # add to db
        db.session.add(raw_photo)
        # add to result lists
        new_raw_photos.append(raw_photo)

        # process new image
        print("Processing raw photo %d/%d" % (i + 1, len(pending_files)))
        photo_details = image_processing.compute_windows(target_filename)
        pprint(photo_details)

        for i, photo_detail in enumerate(photo_details):
            print("Processing photo part %d" % i)
            photo = entities.Photo(source_raw_photo=raw_photo,
                                   rotation=photo_detail["rotation"],
                                   center_x=photo_detail["center"]["x"],
                                   center_y=photo_detail["center"]["y"],
                                   dimension_x=photo_detail["dimension"]["x"],
                                   dimension_y=photo_detail["dimension"]["y"],
                                   part=i)
            db.session.add(photo)

    db.session.commit()

    pprint(list(entities.Photo.query))

    print("Imported %d new raw photos." % len(new_raw_photos))
    return new_raw_photos
