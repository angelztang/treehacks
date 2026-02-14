from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    # Drop the password column
    db.session.execute('ALTER TABLE users DROP COLUMN password;')
    
    db.session.commit()
    print("Password column dropped successfully!") 