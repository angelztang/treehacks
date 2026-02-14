import os
from datetime import timedelta
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler
from sqlalchemy.pool import NullPool

load_dotenv()

class Config:
    # Basic Flask config
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev'
    
    # JWT config
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    # Database config
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # SQLAlchemy engine options. For serverless platforms (Vercel) we prefer NullPool
    # to avoid exhausting database connections from short-lived function invocations.
    IS_SERVERLESS = os.environ.get('VERCEL') == '1' or os.environ.get('SERVERLESS') == '1'

    if IS_SERVERLESS:
        # Use NullPool for serverless environments; keep connect_args minimal.
        SQLALCHEMY_ENGINE_OPTIONS = {
            'poolclass': NullPool,
            'connect_args': {}
        }
    else:
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_size': 10,
            'max_overflow': 2,
            'pool_recycle': 300,
            'pool_pre_ping': True,
            'pool_timeout': 30
        }
    
    # File upload config
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    
    # Email config
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'tigerpopmarketplace@gmail.com'
    MAIL_PASSWORD = 'vvtb vsht wwro tvlb'
    MAIL_DEFAULT_SENDER = ('TigerPop', "tigerpopmarketplace@gmail.com")

    # Logging configuration
    LOG_TO_STDOUT = os.environ.get('LOG_TO_STDOUT', True)  # Default to True for Heroku
    LOG_LEVEL = logging.INFO
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_FILE = 'app.log'
    LOG_MAX_BYTES = 1024 * 1024  # 1MB
    LOG_BACKUP_COUNT = 10
    
    # Ensure upload directory exists
    if not os.path.exists(UPLOAD_FOLDER):
        try:
            os.makedirs(UPLOAD_FOLDER)
        except Exception:
            # On Heroku, we can't create directories
            pass

    # Additional config
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')
    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:3000'
    SERVICE_URL = os.environ.get('SERVICE_URL') or 'http://localhost:5000'
    CAS_URL = os.environ.get('CAS_URL') or 'https://fed.princeton.edu/cas'
