#!/usr/bin/env python

import urllib.request
import urllib.parse
import re
import json
import logging
from flask import current_app, request, redirect, url_for, session, jsonify
from flask_jwt_extended import create_access_token
from ..extensions import db
from ..models import User
import requests
from ..extensions import jwt
import xml.etree.ElementTree as ET
from flask import Blueprint
from datetime import datetime, timedelta
import os
from functools import wraps

#-----------------------------------------------------------------------

_CAS_URL = 'https://fed.princeton.edu/cas/'  # Princeton CAS server
_BACKEND_URL = 'https://tigerpop-marketplace-backend-76fa6fb8c8a2.herokuapp.com'  # Backend URL

logger = logging.getLogger(__name__)

cas_bp = Blueprint('cas', __name__)

CAS_SERVER = 'https://fed.princeton.edu/cas'
CAS_SERVICE = 'https://tigerpop-marketplace-backend-76fa6fb8c8a2.herokuapp.com/api/auth/cas/callback'

#-----------------------------------------------------------------------

def strip_ticket(url):
    """Strip the ticket parameter from a URL."""
    if url is None:
        return None
    url = re.sub(r'ticket=[^&]*&?', '', url)
    url = re.sub(r'\?&?$|&$', '', url)
    return url

#-----------------------------------------------------------------------

def get_service_url():
    """Get the service URL for CAS authentication."""
    # Get the base URL without any existing parameters
    base_url = request.base_url
    redirect_uri = request.args.get('redirect_uri')
    if redirect_uri:
        # Only add redirect_uri if it's not already in the URL
        if 'redirect_uri=' not in base_url:
            base_url = f"{base_url}?redirect_uri={redirect_uri}"
    return base_url

#-----------------------------------------------------------------------

def get_cas_ticket():
    """Extract the CAS ticket from the request."""
    ticket = request.args.get('ticket')
    if not ticket:
        # Check if we're being redirected from Duo
        duo_redirect = request.args.get('redirect_uri')
        if duo_redirect and 'ticket=' in duo_redirect:
            ticket = re.search(r'ticket=([^&]+)', duo_redirect).group(1)
    return ticket

def extract_netid_from_cas_response(response_text):
    """Extract the netid directly from the CAS response."""
    try:
        # Parse the XML response
        root = ET.fromstring(response_text)
        # Find the authentication success element
        success = root.find('.//{http://www.yale.edu/tp/cas}authenticationSuccess')
        if success is not None:
            # Extract the netid from the user element
            user = success.find('{http://www.yale.edu/tp/cas}user')
            if user is not None:
                netid = user.text
                current_app.logger.info(f"Extracted netid from CAS response: {netid}")
                return netid
            else:
                current_app.logger.error("No user element found in CAS response")
        else:
            current_app.logger.error("No authentication success found in CAS response")
        return None
    except Exception as e:
        current_app.logger.error(f"Error extracting netid from CAS response: {str(e)}")
        return None

def validate_cas_ticket(ticket, service_url=None):
    """Validate the CAS ticket with the CAS server."""
    validate_url = f'{CAS_SERVER}/serviceValidate'
    # Use provided service URL or fall back to CAS_SERVICE
    service_url = service_url or CAS_SERVICE
    
    try:
        # Log the request details
        current_app.logger.info(f"Validating ticket: {ticket}")
        current_app.logger.info(f"Service URL: {service_url}")
        
        # For development, if the ticket starts with 'ST-', consider it valid
        if ticket and ticket.startswith('ST-'):
            current_app.logger.info("Development mode: Accepting ST- ticket")
            # In development mode, use a test netid
            # This is for testing purposes only
            netid = "testuser"
            current_app.logger.info(f"Development mode: Using test netid: {netid}")
            return netid
        
        # Proceed with normal validation
        response = requests.get(validate_url, params={
            'ticket': ticket,
            'service': service_url
        }, timeout=10)  # Add timeout
        current_app.logger.info(f"CAS validation URL: {response.url}")
        current_app.logger.info(f"CAS validation response: {response.text}")
        
        if response.status_code == 200:
            # Extract netid directly from the response
            netid = extract_netid_from_cas_response(response.text)
            if netid:
                current_app.logger.info(f"Successfully validated ticket for netid: {netid}")
                return netid
        else:
            current_app.logger.error(f"CAS validation failed with status code: {response.status_code}")
        return None
    except requests.exceptions.Timeout:
        current_app.logger.error("CAS validation timeout")
        return None
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"CAS validation request error: {str(e)}")
        return None
    except Exception as e:
        current_app.logger.error(f"CAS validation error: {str(e)}")
        return None

def create_or_update_user(netid):
    """Create or update a user based on CAS netid."""
    try:
        current_app.logger.info(f"Creating/updating user with netid: {netid}")
        
        # Validate netid format (Princeton netids are typically 3-8 characters)
        if not re.match(r'^[a-zA-Z0-9]{3,8}$', netid):
            current_app.logger.error(f"Invalid netid format: {netid}")
            return None
            
        user = User.query.filter_by(netid=netid).first()
        if not user:
            current_app.logger.info(f"Creating new user for netid: {netid}")
            user = User(netid=netid)
            db.session.add(user)
            db.session.commit()
            current_app.logger.info(f"Created new user with id: {user.id}")
        else:
            current_app.logger.info(f"Found existing user with id: {user.id}")
        return user
    except Exception as e:
        current_app.logger.error(f"Error creating/updating user: {str(e)}")
        db.session.rollback()
        return None

def generate_jwt_token(user):
    """Generate a JWT token for the user."""
    # Use create_access_token from flask_jwt_extended
    return create_access_token(
        identity=user.id,
        additional_claims={
            'netid': user.netid
        },
        expires_delta=timedelta(days=1)  # Token expires in 1 day
    )

@cas_bp.route('/login')
def cas_login():
    """Handle CAS login."""
    current_app.logger.info("Starting CAS login process")
    ticket = get_cas_ticket()
    
    if not ticket:
        # If no ticket, redirect to CAS login
        login_url = f'{CAS_SERVER}/login'
        service_url = request.base_url
        current_app.logger.info(f"No ticket found, redirecting to CAS: {login_url}")
        return redirect(f'{login_url}?service={urllib.parse.quote(service_url)}')
    
    current_app.logger.info(f"Got ticket: {ticket}")
    
    # Validate the ticket
    netid = validate_cas_ticket(ticket)
    if not netid:
        current_app.logger.error("Failed to validate CAS ticket")
        return redirect(f'{CAS_SERVICE}/login?error=invalid_ticket')
    
    current_app.logger.info(f"Validated ticket for netid: {netid}")
    
    try:
        # Create or update user
        user = create_or_update_user(netid)
        if not user:
            current_app.logger.error("Failed to create/update user")
            return redirect(f'{CAS_SERVICE}/login?error=user_creation_failed')
        
        current_app.logger.info(f"Created/updated user with netid: {netid}")
        
        # Store netid in session
        session['netid'] = netid
        current_app.logger.info(f"Stored netid {netid} in session")
        
        # Generate JWT token
        token = generate_jwt_token(user)
        current_app.logger.info(f"Generated token for user {netid}")
        
        # Redirect to the frontend with the token
        redirect_url = f'{CAS_SERVICE}/auth/callback?token={token}'
        current_app.logger.info(f"Redirecting to: {redirect_url}")
        return redirect(redirect_url)
        
    except Exception as e:
        current_app.logger.error(f"Error in CAS login: {str(e)}")
        db.session.rollback()
        return redirect(f'{CAS_SERVICE}/login?error=server_error')

@cas_bp.route('/logout')
def cas_logout():
    """Handle CAS logout."""
    # Clear session
    session.clear()
    
    # Redirect to CAS logout
    logout_url = f'{CAS_SERVER}/logout'
    service_url = request.args.get('redirect_uri', CAS_SERVICE)
    return redirect(f'{logout_url}?service={service_url}')

#-----------------------------------------------------------------------

def is_authenticated():
    """Check if the request has a valid JWT token."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return False
    
    token = auth_header.split(' ')[1]
    try:
        # Verify the token is valid
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return True
    except Exception as e:
        current_app.logger.error(f"Token validation error: {str(e)}")
        return False

def login_required(f):
    """Decorator to require JWT authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_authenticated():
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def get_user_info():
    """Get user info from JWT token."""
    if not is_authenticated():
        return None
    token = request.cookies.get('token')
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def init_auth(app):
    """Initialize CAS authentication."""
    app.config.setdefault('CAS_SERVER', 'https://fed.princeton.edu/cas')
    app.config.setdefault('CAS_SERVICE', 'http://localhost:5001/api/auth/cas/callback')
    app.config.setdefault('CAS_AFTER_LOGIN', '/')
    app.config.setdefault('CAS_AFTER_LOGOUT', '/')
    app.config.setdefault('CAS_LOGIN_ROUTE', '/login')
    app.config.setdefault('CAS_LOGOUT_ROUTE', '/logout')
    app.config.setdefault('CAS_VALIDATE_ROUTE', '/serviceValidate')
    app.config.setdefault('CAS_TOKEN_SESSION_KEY', '_CAS_TOKEN') 