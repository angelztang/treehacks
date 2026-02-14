from flask import Flask, request
from flask_cors import CORS
from app.config import Config
from app.extensions import db, migrate, init_extensions, jwt
import os
import logging
from logging.handlers import RotatingFileHandler
import sys

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Setup CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "https://tigerpop-marketplace-frontend-df8f1fbc1309.herokuapp.com",
                "http://localhost:3000",
                "http://localhost:5000",
                "http://localhost:5001"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "max_age": 3600
        }
    })

    # Setup logging
    if not app.debug and not app.testing:
        # Always log to stdout on Heroku
        stream_handler = logging.StreamHandler(sys.stdout)
        stream_handler.setLevel(app.config['LOG_LEVEL'])
        stream_handler.setFormatter(logging.Formatter(app.config['LOG_FORMAT']))
        app.logger.addHandler(stream_handler)
        
        if not app.config['LOG_TO_STDOUT']:
            if not os.path.exists('logs'):
                os.mkdir('logs')
            file_handler = RotatingFileHandler('logs/app.log',
                                             maxBytes=app.config['LOG_MAX_BYTES'],
                                             backupCount=app.config['LOG_BACKUP_COUNT'])
            file_handler.setFormatter(logging.Formatter(app.config['LOG_FORMAT']))
            file_handler.setLevel(app.config['LOG_LEVEL'])
            app.logger.addHandler(file_handler)

        app.logger.setLevel(app.config['LOG_LEVEL'])
        app.logger.info('TigerPop startup')

    # Initialize extensions
    init_extensions(app)

    # Configure JWT
    jwt.init_app(app)

    # Register blueprints
    from app.routes.auth_routes import bp as auth_bp
    from app.routes.listing_routes import bp as listing_bp
    from app.routes.user_routes import bp as user_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(listing_bp, url_prefix='/api/listing')
    app.register_blueprint(user_bp, url_prefix='/api/user')

    return app
