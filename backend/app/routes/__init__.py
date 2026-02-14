from flask import Blueprint

main = Blueprint('main', __name__)

from . import routes

from .auth_routes import bp as auth_bp
from .listing_routes import bp as listing_bp
from .user_routes import bp as user_bp

__all__ = ['auth_bp', 'listing_bp', 'user_bp'] 