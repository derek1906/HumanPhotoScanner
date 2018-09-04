"""Preprocessing"""
import re
import os
from pathlib import Path
from pprint import pprint

from PIL import Image

import entities
from initialization import db
import dbapis
import image_processing

caches_raw_photos_dir = Path()/"caches"/"rawphotos"
number_regex = re.compile(r"\d+")

def _extract_number(filename):
    match = number_regex.search(filename)
    if not match:
        return 0
    return int(match.group(0))

def process_pending_photos():
    """Process pending photos."""

    new_raw_photos = []
    pending_files = sorted(os.listdir("./pending"),
                           key=_extract_number)

    for i, filename in enumerate(pending_files):
        source_filename = os.path.join("./pending", filename)
        target_filename = os.path.join("./raw", filename)

        if os.path.isfile(target_filename):
            raise OSError("Destination already exists")

        # create a new RawPhoto
        raw_photo_size = image_processing.get_image_size(source_filename)
        raw_photo = entities.RawPhoto(
            filename=filename,
            dimension_x=raw_photo_size[0],
            dimension_y=raw_photo_size[1]
        )
        # add to db
        db.session.add(raw_photo)
        # add to result lists
        new_raw_photos.append(raw_photo)

        # process new image
        print("Processing raw photo %d/%d" % (i + 1, len(pending_files)))
        found_photos = image_processing.find_photos(source_filename,
                                                    dpi=600,
                                                    height=3.5,
                                                    width=5)
        pprint(found_photos)

        for part, photo_detail in enumerate(found_photos):
            print("Processing photo part %d" % i)

            dbapis.update_photo_by_id(photo_id=None, photo_attrs={
                "source_raw_photo": raw_photo,
                "rotation": photo_detail["rotation"],
                "top_left_x": photo_detail["top_left"][0],
                "top_left_y": photo_detail["top_left"][1],
                "dimension_x": photo_detail["dimension"][0],
                "dimension_y": photo_detail["dimension"][1],
                "part": part
            }, extra_attrs={
                "date_initialized": db.func.now()
            })

        db.session.flush()

        # generate smaller versions
        os.makedirs(caches_raw_photos_dir, exist_ok=True)
        (image_processing
            .scale_down_image(Image.open(source_filename), [1024, 1024])
            .save(caches_raw_photos_dir/f"{raw_photo.id}.jpg"))

        # move to /raw
        os.rename(source_filename, target_filename)

    db.session.commit()

    print("Imported %d new raw photos." % len(new_raw_photos))
    return new_raw_photos
