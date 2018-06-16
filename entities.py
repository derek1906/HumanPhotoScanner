from initialization import db


class RawPhoto(db.Model):
    __tablename__ = "RawPhoto"

    id = db.Column(db.Integer, primary_key=True, autoincrement="auto")
    filename = db.Column(db.String)
    created_date = db.Column(
        db.DateTime, default=db.func.now())

    def __repr__(self):
        return "<RawPhoto(id='%s', filename='%s')>" % (self.id, self.filename)


db.create_all()