from initialization import db
from enum import Enum

class RawPhoto(db.Model):
    __tablename__ = "RawPhoto"

    id = db.Column(db.Integer, primary_key=True, autoincrement="auto")
    filename = db.Column(db.String)
    created_date = db.Column(db.DateTime, default=db.func.now())

    photos = db.relationship("Photo",
                             cascade="all,delete",
                             backref=db.backref("source_raw_photo", lazy=True))

    def __repr__(self):
        return "<RawPhoto(id=%s, filename='%s')>" % (self.id, self.filename)


class Photo(db.Model):
    __tablename__ = "Photo"

    id = db.Column(db.Integer, primary_key=True, autoincrement="auto")
    rawphoto_id = db.Column(db.ForeignKey(RawPhoto.id))

    # rotation in radians
    rotation = db.Column(db.Float)
    # translation in pixels relative to the raw photo
    top_left_x = db.Column(db.Float)
    top_left_y = db.Column(db.Float)
    # dimension
    dimension_x = db.Column(db.Integer)
    dimension_y = db.Column(db.Integer)

    # part
    part = db.Column(db.Integer)

    # cropped filename
    filename = db.Column(db.String, nullable=True)
    created_date = db.Column(db.DateTime, default=db.func.now())

    photo_meta_list = db.relationship("PhotoMeta",
                                      cascade="all,delete",
                                    backref=db.backref("photo", lazy=True))

    __table_args__ = (
        db.ForeignKeyConstraint(["rawphoto_id"], ["RawPhoto.id"], ondelete="CASCADE"),
    )

    def __repr__(self):
        return ("<Photo("
                "id=%s, "
                "RawPhoto_id='%s', "
                "part=%s, "
                "filename='%s')>") % (self.id, self.rawphoto_id, self.part, self.filename)


class Processing(db.Model):
    __tablename__ = "Processing"

    #id = db.Column(db.Integer, primary_key=True, autoincrement="auto")
    #photo_id = db.Column(db.ForeignKey(Photo.id), primary_key=True)
    id = db.Column(db.ForeignKey(Photo.id), primary_key=True)
    by_session_id = db.Column(db.String)
    created_date = db.Column(db.DateTime, default=db.func.now())

    __table_args__ = (
        db.ForeignKeyConstraint(["id"], ["Photo.id"], ondelete="CASCADE"),
    )

    photo = db.relationship("Photo")

    def __repr__(self):
        return ("<Processing("
                "id=%s, "
                "Photo_id='%s', "
                "by_session_id='%s')>") % (self.id, self.photo_id, self.by_session_id)


class PhotoMeta(db.Model):
    __tablename__ = "PhotoMeta"

    photo_id = db.Column(db.ForeignKey(Photo.id), primary_key=True)
    type = db.Column(db.String, primary_key=True)
    value = db.Column(db.String, nullable=True)

    __table_args__ = (
        db.ForeignKeyConstraint(["photo_id"], ["Photo.id"], ondelete="CASCADE"),
    )

    def __repr__(self):
        return ("<PhotoMeta("
                "photo_id=%s, "
                "type='%s', "
                "value='%s'>") % (self.photo_id, self.type, self.value)


# Create all tables
db.create_all()
