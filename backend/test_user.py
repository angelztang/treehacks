from app import create_app
from app.extensions import db
from app.models.user import User
from sqlalchemy.exc import IntegrityError

def test_user_creation():
    app = create_app()
    with app.app_context():
        netid = 'testuser3'
        
        # Try to retrieve the user first
        user = User.query.filter_by(netid=netid).first()
        if user is None:
            # Create a new user if they don't exist
            user = User(netid=netid)
            db.session.add(user)
            db.session.commit()
            print(f"Created new user: {user.to_dict()}")
        else:
            print(f"Found existing user: {user.to_dict()}")
        
        # Retrieve the user again
        retrieved_user = User.query.filter_by(netid=netid).first()
        print(f"Retrieved user: {retrieved_user.to_dict()}")
        
        # Assert they are the same
        assert retrieved_user.netid == user.netid
        print("Test passed!")

if __name__ == '__main__':
    test_user_creation() 