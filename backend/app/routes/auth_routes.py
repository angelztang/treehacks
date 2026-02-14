from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from ..extensions import db
from ..models import User
from sqlalchemy import text
import logging
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
import os

bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@bp.route('/test-db', methods=['GET'])
def test_db():
    """Test database connection."""
    try:
        logger.info("Starting database connection test")
        
        # Set a shorter timeout for the query
        # Get the database URL from config
        db_url = db.engine.url
        logger.info(f"Using database URL: {db_url}")
        
        # Create a new engine with a timeout
        engine = create_engine(db_url, connect_args={'connect_timeout': 10})
        
        # Try to execute a simple query with the new engine
        with engine.connect() as conn:
            logger.info("Executing test query")
            result = conn.execute(text('SELECT 1'))
            logger.info("Query executed successfully")
            return jsonify({'status': 'success', 'message': 'Database connection is working'}), 200
            
    except OperationalError as e:
        logger.error(f"Database operational error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Database connection timeout'}), 503
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    # Hash the password using werkzeug
    password_hash = generate_password_hash(password)

    # Create the user
    new_user = User(username=username, email=email, password_hash=password_hash)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully!'}), 201

@bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'message': 'Username and password are required'}), 400
            
        user = User.query.filter_by(username=username).first()
        if not user or not user.password_hash or not check_password_hash(user.password_hash, password):
            return jsonify({'message': 'Invalid username or password'}), 401

        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'message': 'An error occurred during login'}), 500

@bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """Verify the JWT token and return user info."""
    try:
        current_user_id = get_jwt_identity()
        logger.info(f"Verifying token for user_id: {current_user_id}")
        
        # Get additional claims from the token
        additional_claims = get_jwt()
        netid = additional_claims.get('netid')
        logger.info(f"Token claims: {additional_claims}")
        
        if not netid:
            logger.error("No netid found in token claims")
            return jsonify({'error': 'Invalid token claims'}), 401
            
        user = User.query.get(current_user_id)
        if not user:
            # If user doesn't exist, create them
            logger.info(f"User not found, creating new user with netid: {netid}")
            user = User(netid=netid)
            db.session.add(user)
            db.session.commit()
            logger.info(f"Created new user with id: {user.id}")
            
        logger.info(f"Token verified successfully for user: {user.netid}")
        return jsonify({
            'netid': user.netid,
            'user_id': user.id
        }), 200
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return jsonify({'error': 'Invalid token'}), 401

@bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """Verify the JWT token and return user info."""
    try:
        current_user_id = get_jwt_identity()
        logger.info(f"Verifying token for user_id: {current_user_id}")

        user = User.query.get(current_user_id)
        if not user:
            logger.error(f"User id {current_user_id} not found")
            return jsonify({'error': 'Invalid token user'}), 401

        logger.info(f"Token verified successfully for user: {user}")
        return jsonify({
            'username': user.username,
            'email': user.email,
            'user_id': user.id
        }), 200
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return jsonify({'error': 'Invalid token'}), 401
