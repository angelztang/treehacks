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

# Import CAS helpers for ticket validation and token generation
from ..cas.auth import validate_cas_ticket, create_or_update_user, generate_jwt_token

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

    if not username or not password or not email:
        return jsonify({'message': 'Username, email and password are required'}), 400

    # If Supabase is configured, create the user there as well using the admin API.
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_service_role = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    if supabase_url and supabase_service_role:
        try:
            import requests
            headers = {
                'Authorization': f'Bearer {supabase_service_role}',
                'apikey': supabase_service_role,
                'Content-Type': 'application/json'
            }
            payload = {
                'email': email,
                'password': password,
                'user_metadata': {'username': username}
            }
            resp = requests.post(f"{supabase_url}/auth/v1/admin/users", json=payload, headers=headers, timeout=10)
            if resp.status_code not in (200, 201):
                current_app.logger.error(f"Supabase signup failed: {resp.status_code} {resp.text}")
                return jsonify({'message': 'Failed to create user in Supabase', 'detail': resp.text}), 502
        except Exception as e:
            current_app.logger.error(f"Error creating Supabase user: {str(e)}")
            return jsonify({'message': 'Error creating Supabase user'}), 500

    # Hash the password using werkzeug and create local user record for compatibility
    password_hash = generate_password_hash(password)
    new_user = User(username=username, email=email, password_hash=password_hash)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully!', 'user_id': new_user.id}), 201

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


@bp.route('/validate', methods=['GET'])
def validate_ticket():
    """Validate a CAS ticket and return netid + token.

    Expected query params: ticket (required), service (optional)
    Returns: { netid, user_id, access_token }
    """
    ticket = request.args.get('ticket')
    service = request.args.get('service')
    if not ticket:
        return jsonify({'error': 'ticket is required'}), 400

    netid = validate_cas_ticket(ticket, service)
    if not netid:
        return jsonify({'error': 'Invalid ticket'}), 401

    user = create_or_update_user(netid)
    if not user:
        return jsonify({'error': 'Failed to create or fetch user'}), 500

    token = generate_jwt_token(user)
    return jsonify({'netid': user.netid, 'user_id': user.id, 'access_token': token}), 200


@bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """Verify the JWT token and return consolidated user info."""
    try:
        current_user_id = get_jwt_identity()
        logger.info(f"Verifying token for user_id: {current_user_id}")

        user = User.query.get(current_user_id)
        if not user:
            logger.error(f"User id {current_user_id} not found")
            return jsonify({'error': 'Invalid token user'}), 401

        additional_claims = get_jwt()
        netid = additional_claims.get('netid') or user.netid

        logger.info(f"Token verified successfully for user: {user}")
        return jsonify({
            'username': user.username,
            'email': user.email,
            'user_id': user.id,
            'netid': netid
        }), 200
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return jsonify({'error': 'Invalid token'}), 401
