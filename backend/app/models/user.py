from ..extensions import db
from datetime import datetime


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=True)
    netid = db.Column(db.String(80), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, username=None, email=None, password_hash=None, netid=None):
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.netid = netid

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'netid': self.netid,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<User {self.username or self.netid}>'